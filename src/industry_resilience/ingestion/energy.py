"""Offline energy-shock acquisition and coverage audit."""

import argparse
import csv
import json
import math
from datetime import UTC, date, datetime
from hashlib import sha256
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

from industry_resilience.ingestion.http import AcquisitionError, fetch

ROOT = Path.cwd()
OUT = ROOT / "reports/energy"
WINDOWS = ("baseline", "impact", "followup")
INDIA_URL = "https://measure.thisindianlife.today/data/iip-industries-2011.json"
LABELS = {
    "food": "Manufacture of Food Products",
    "chemicals": "Manufacture of Chemicals and Chemical Products",
    "metals": "Manufacture of Basic Metals",
    "autos": "Manufacture of Motor Vehicles, Trailers and Semi-trailers",
}


def config(name: str) -> list[dict[str, str]]:
    with (ROOT / f"config/{name}.csv").open(encoding="utf-8", newline="") as stream:
        return list(csv.DictReader(stream))


def month(value: str) -> str:
    parsed = date.fromisoformat(value)
    if parsed.day != 1:
        raise ValueError(f"Expected a monthly observation: {value}")
    return parsed.isoformat()[:7]


def number(value: Any) -> float | None:
    if value in (None, "", "."):
        return None
    result = float(value)
    if not math.isfinite(result):
        raise ValueError("Nonfinite observation")
    return result


def aligned(dates: list[str], values: list[Any]) -> dict[str, float | None]:
    months = [month(value) for value in dates]
    if len(set(months)) != len(dates) or len(dates) != len(values):
        raise ValueError("Duplicate months or mismatched observation arrays")
    return dict(zip(months, map(number, values), strict=True))


def index_yoy(levels: dict[str, float | None]) -> dict[str, float | None]:
    growth = {}
    for key, level in levels.items():
        previous = levels.get(f"{int(key[:4]) - 1:04d}{key[4:]}")
        growth[key] = (
            100 * (level / previous - 1)
            if (level is not None and previous is not None and previous > 0)
            else None
        )
    return growth


def window_months(start: str, end: str) -> list[str]:
    return [
        key
        for year in range(int(start[:4]), int(end[:4]) + 1)
        for m in range(1, 13)
        if start <= (key := f"{year:04d}-{m:02d}") <= end
    ]


def audit(snapshots: Path | None = None) -> dict[str, Any]:
    sources: list[dict[str, Any]] = []
    production: list[dict[str, Any]] = []
    brent: list[dict[str, Any]] = []
    cases: list[dict[str, Any]] = []
    industries = config("industry_mapping")
    events = config("event_windows")

    def load(url: str, metadata: dict[str, Any]) -> str:
        if snapshots is not None:
            name = "india" if url == INDIA_URL else metadata["series_id"]
            path = snapshots / f"ir-{name}"
            body = path.read_bytes()
            metadata.update(
                retrieved_at_utc=datetime.fromtimestamp(path.stat().st_mtime, UTC).isoformat(),
                retrieval_timestamp_basis="downloaded file modification time",
                sha256=sha256(body).hexdigest(),
            )
            return body.decode("utf-8-sig")
        response = fetch(url, (urlsplit(url).hostname or "",))
        metadata.update(
            retrieved_at_utc=response.retrieved_at_utc,
            final_url=response.final_url,
            content_type=response.content_type,
            sha256=sha256(response.body).hexdigest(),
            last_modified=response.last_modified,
        )
        return response.body.decode("utf-8-sig")

    def record(
        source: dict[str, Any],
        values: dict[str, float | None],
        country: str = "",
        industry: str = "",
    ) -> None:
        values = {key: value for key, value in values.items() if "2012-04" <= key <= "2025-12"}
        valid = sorted(key for key, value in values.items() if value is not None)
        source.update(
            first_month=min(valid, default=None),
            last_month=max(valid, default=None),
            valid_count=len(valid),
            status="available" if valid else "unavailable",
        )
        for key, value in sorted(values.items()):
            row = {"month": key, "source_id": source["source_id"]}
            if country:
                production.append(
                    dict(row, country=country, industry=industry, yoy_growth_pct=value)
                )
            else:
                brent.append(dict(row, brent_usd_bbl=value))
        if country:
            for event in events:
                counts = {
                    name: sum(
                        values.get(key) is not None
                        for key in window_months(event[f"{name}_start"], event[f"{name}_end"])
                    )
                    for name in WINDOWS
                }
                status = (
                    "ready"
                    if min(counts.values()) >= 10
                    else ("partial" if any(counts.values()) else "unavailable")
                )
                cases.append(
                    dict(
                        country=country,
                        industry=industry,
                        event_id=event["event_id"],
                        coverage=counts,
                        status=status,
                        source_id=source["source_id"],
                    )
                )

    mirror = dict(
        download_url=INDIA_URL,
        publisher="MoSPI National Statistical Office",
        distributor="Measure of India (third-party republication)",
        source_url="https://microdata.gov.in/nada/index.php/catalog/148",
        unit_raw="YoY percent",
        unit_derived="YoY percent",
    )
    payload: dict[str, Any] = {}
    try:
        payload = json.loads(load(INDIA_URL, mirror))
        if (
            payload["meta"]["mock"] is not False
            or payload["meta"]["geo"] != "IND"
            or payload["meta"]["frequency"] != "monthly"
        ):
            raise ValueError("Unexpected India dataset metadata")
        mirror["vintage"] = payload["meta"]["vintage"]
    except (AcquisitionError, OSError, TypeError, KeyError, ValueError) as exc:
        mirror["error"] = str(exc)

    for industry, label in LABELS.items():
        source = dict(mirror, source_id=f"IND_{industry.upper()}", series_id=label)
        sources.append(source)
        values = {}
        if "error" not in source:
            try:
                matches = [
                    series["data"]
                    for series in payload["series"].values()
                    if series["label"] == label
                ]
                if len(matches) != 1:
                    raise ValueError(f"Expected exactly one India series with label {label}")
                values = aligned(payload["dates"], matches[0])
            except (AttributeError, KeyError, TypeError, ValueError) as exc:
                source["error"] = str(exc)
        record(source, values, "IND", industry)

    for item in [*industries, {"industry_id": "", "usa_fred_series": "MCOILBRENTEU"}]:
        industry, series = item["industry_id"], item["usa_fred_series"]
        series_url = f"https://fred.stlouisfed.org/series/{series}"
        download_url = f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={series}"
        source = dict(
            source_id=f"USA_{industry.upper()}" if industry else "BRENT",
            series_id=series,
            source_url=series_url,
            download_url=download_url,
            distributor="FRED",
            publisher=(
                "Federal Reserve Board" if industry else "U.S. Energy Information Administration"
            ),
            unit_raw="Index 2017=100 (NSA)" if industry else "USD/barrel",
            unit_derived="YoY percent" if industry else "USD/barrel",
        )
        sources.append(source)
        values = {}
        try:
            reader = csv.DictReader(load(download_url, source).splitlines())
            if reader.fieldnames not in (["observation_date", series], ["DATE", series]):
                raise ValueError(f"Unexpected CSV headers: {reader.fieldnames}")
            rows = list(reader)
            values = aligned(
                [next(iter(row.values())) for row in rows], [row[series] for row in rows]
            )
            if industry:
                values = index_yoy(values)
        except (AcquisitionError, OSError, KeyError, TypeError, ValueError) as exc:
            source["error"] = str(exc)
        record(source, values, "USA" if industry else "", industry)
    assert len(cases) == 16
    return dict(
        sources=sources,
        production=production,
        brent=brent,
        cases=cases,
        events=events,
        industries=industries,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--snapshots", type=Path, help="Directory with existing ir-* downloads")
    result = audit(parser.parse_args().snapshots)
    OUT.mkdir(parents=True, exist_ok=True)
    for name, value in (
        ("data_manifest", result["sources"]),
        ("coverage_audit", result["cases"]),
        ("monthly", {key: result[key] for key in ("production", "brent", "events", "industries")}),
    ):
        (OUT / f"{name}.json").write_text(json.dumps(value, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
