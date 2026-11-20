"""Build the expanded, observed monthly panel from verified source snapshots."""

import csv
import json
from datetime import UTC, datetime
from hashlib import sha256
from pathlib import Path

from openpyxl import load_workbook

from industry_resilience.ingestion.energy import INDIA_URL, aligned, index_yoy, number, window_months

CONFIG = Path("research_expansion/config")
OUT = Path("reports/research")
PROCESSED = Path("data/processed")
CACHE = Path(".tmp")
MONTHS = window_months("2013-01", "2026-10")
CODES = {
    "10": "food_products",
    "13": "textiles",
    "20": "chemicals_and_chemical_products",
    "21": "basic_pharmaceutical_products_and_pharmaceutical_preparations",
    "22": "rubber_and_plastics_products",
    "24": "basic_metals",
    "25": "fabricated_metal_products_except_machinery_and_equipment",
    "27": "electrical_equipment",
    "28": "machinery_and_equipment_n_e_c",
    "29": "motor_vehicles_trailers_and_semi_trailers",
}
FED = "https://www.federalreserve.gov/releases/g17/related_data/ip_nsa_isic4.xlsx"
EU = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/"
DE = EU + "sts_inpr_m?geo=DE&freq=M&indic_bt=PRD&unit=I21&s_adj=NSA&sinceTimePeriod=2012-01" + "".join(
    f"&nace_r2=C{code}" for code in CODES
)
AI = EU + "isoc_eb_ai?geo=DE&indic_is=E_AI_TANY&unit=PC_ENT&size_emp=GE10"
BRENT = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=MCOILBRENTEU"


def table(path):
    with path.open(encoding="utf-8-sig", newline="") as stream:
        return list(csv.DictReader(stream))


def write_csv(path, rows):
    with path.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":"), allow_nan=False) + "\n",
                    encoding="utf-8")


def receipt(path, url, vintage):
    return dict(download_url=url, vintage=vintage, sha256=sha256(path.read_bytes()).hexdigest(),
                retrieved_at_utc=datetime.fromtimestamp(path.stat().st_mtime, UTC).isoformat(),
                retrieval_timestamp_basis="downloaded file modification time")


def eurostat(payload, filters):
    axes = [payload["dimension"][axis]["category"]["index"] for axis in payload["id"]]
    for axis, expected in filters.items():
        if set(axes[payload["id"].index(axis)]) != set(expected):
            raise ValueError(f"Eurostat dimensions changed: {axis}")
    values = payload["value"]
    for offset, observation in (values.items() if isinstance(values, dict) else enumerate(values)):
        index = int(offset)
        coords = []
        for size in reversed(payload["size"]):
            index, coord = divmod(index, size)
            coords.append(coord)
        labels = [next(key for key, idx in axis.items() if idx == coord)
                  for axis, coord in zip(axes, reversed(coords), strict=True)]
        yield dict(zip(payload["id"], labels, strict=True)), number(observation)


def main():
    india_file = CACHE / "ir-india"
    fed_file = CACHE / "research/fed.xlsx"
    de_file = CACHE / "research/de.json"
    brent_file = CACHE / "ir-MCOILBRENTEU"
    ai_file = CACHE / "research/ai.json"
    india = json.loads(india_file.read_bytes())
    if india["meta"]["mock"] is not False or india["meta"]["geo"] != "IND":
        raise ValueError("Unexpected India production snapshot")
    de = json.loads(de_file.read_bytes())
    german = {code: {} for code in CODES}
    for dim, observation in eurostat(de, {
        "geo": ["DE"], "freq": ["M"], "indic_bt": ["PRD"], "unit": ["I21"],
        "s_adj": ["NSA"], "nace_r2": ["C" + code for code in CODES],
    }):
        german[dim["nace_r2"][1:]][dim["time"]] = observation

    book = load_workbook(fed_file, read_only=True, data_only=True)
    sheet = book["IP_NSA"]
    rows = list(sheet.values)
    book.close()
    if "not seasonally adjusted" not in rows[1][0] or "2017=100" not in rows[2][0]:
        raise ValueError("Unexpected G.17 workbook units")
    header = ("Rev 4", "Year", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
    start = next(i for i, row in enumerate(rows) if row == header)
    american = {code: {} for code in CODES}
    for code, year, *levels in rows[start + 1:]:
        if str(code) in american and isinstance(year, int) and year >= 2012:
            target = american[str(code)]
            for m, level in enumerate(levels, 1):
                month = f"{year:04d}-{m:02d}"
                if month in target:
                    raise ValueError(f"Duplicate Fed month {code} {month}")
                target[month] = number(level)

    brent_rows = table(brent_file)
    brent = aligned([row["observation_date"] for row in brent_rows],
                    [row["MCOILBRENTEU"] for row in brent_rows])
    inputs = {
        "IND": (receipt(india_file, INDIA_URL, india["meta"]["vintage"]),
                "MoSPI / Measure of India republication", "Published YoY percent",
                "https://microdata.gov.in/nada/index.php/catalog/148"),
        "USA": (receipt(fed_file, FED, None), "Federal Reserve G.17",
                "NSA index, 2017=100", "https://www.federalreserve.gov/releases/g17/download.htm"),
        "DEU": (receipt(de_file, DE, de["updated"]), "Eurostat sts_inpr_m",
                "NSA index, 2021=100",
                "https://ec.europa.eu/eurostat/databrowser/view/sts_inpr_m/default/table?lang=en"),
    }
    panel, coverage = [], []
    compact = {}
    for code, key in CODES.items():
        india_series = india["series"]["sub_manufacturing_manufacture_of_" + key]
        production = {"IND": aligned(india["dates"], india_series["data"]),
                      "USA": index_yoy(american[code]), "DEU": index_yoy(german[code])}
        for country, values in production.items():
            series = {"IND": india_series["label"], "USA": f"ISIC {code}", "DEU": f"NACE C{code}"}[country]
            observed = [month for month in MONTHS if values.get(month) is not None]
            metadata, publisher, unit, source_url = inputs[country]
            coverage.append(dict(
                metadata, country=country, industry_code=code, series_id=series, publisher=publisher,
                source_url=source_url, unit_raw=unit, unit_derived="YoY percent",
                match_grade="approximate", status="observed" if observed else "unavailable",
                first_month=observed[0] if observed else None, last_month=observed[-1] if observed else None,
                valid_count=len(observed),
            ))
            compact[country + code] = [values.get(month) for month in MONTHS]
            panel.extend(dict(date=month + "-01", country=country, industry_code=code,
                              production_yoy_pct=values.get(month), brent_usd=brent.get(month))
                         for month in MONTHS)
    ai = json.loads(ai_file.read_bytes())
    indicators = [dict(year=dim["time"], country="DEU", industry_code="",
                       indicator_id="enterprise_ai_any", value=observation,
                       unit="Percent of enterprises", source_url=AI,
                       definition="German enterprises with 10+ workers using AI, Eurostat survey coverage",
                       geography_level="country / surveyed sectors")
                  for dim, observation in eurostat(ai, {
                      "geo": ["DE"], "nace_r2": ["C10-S951_X_K"], "size_emp": ["GE10"],
                      "indic_is": ["E_AI_TANY"], "unit": ["PC_ENT"], "freq": ["A"],
                  }) if observation is not None]
    assert len(coverage) == 30 and len(panel) == len(MONTHS) * 30
    OUT.mkdir(parents=True, exist_ok=True)
    PROCESSED.mkdir(parents=True, exist_ok=True)
    write_csv(PROCESSED / "panel_monthly.csv", panel)
    write_csv(PROCESSED / "ai_indicators.csv", indicators)
    write_json(OUT / "source_manifest.json", dict(
        production=coverage, brent=receipt(brent_file, BRENT, None),
        ai=receipt(ai_file, AI, ai["updated"]),
    ))
    write_json(OUT / "coverage.json", coverage)
    write_json(OUT / "panel.json", dict(
        months=MONTHS, production=compact, brent=[brent.get(month) for month in MONTHS],
        ai=indicators, events=table(CONFIG / "event_windows.csv"), industries=table(CONFIG / "industry_isic4.csv"),
    ))


if __name__ == "__main__":
    main()
