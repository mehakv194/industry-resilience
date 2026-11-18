"""Validate WDI GDP-growth responses without harmonizing or imputing observations."""

import csv
import io
import json
import math
import zipfile
from datetime import date
from typing import Any

from industry_resilience.ingestion.http import AcquisitionError

INDICATOR = "NY.GDP.MKTP.KD.ZG"
COUNTRIES = ("IND", "USA")
CHECK_YEARS = ("2008", "2013", "2022")


def parse_envelope(body: bytes) -> tuple[dict[str, Any], list[Any]]:
    """Require a complete single-page World Bank JSON response."""
    try:
        payload = json.loads(body)
    except (ValueError, UnicodeError) as exc:
        raise AcquisitionError("World Bank returned invalid JSON") from exc
    if (
        not isinstance(payload, list)
        or len(payload) != 2
        or not isinstance(payload[0], dict)
        or not isinstance(payload[1], list)
    ):
        raise AcquisitionError("Expected World Bank [pagination, records] response")
    header, records = payload
    if header.get("page") != 1 or header.get("pages") != 1 or header.get("total") != len(records):
        raise AcquisitionError("Incomplete or inconsistent pagination; refusing a partial dataset")
    return header, records


def validate_indicator(body: bytes) -> dict[str, Any]:
    """Require the exact WDI GDP growth definition and preserve upstream metadata."""
    _, records = parse_envelope(body)
    if len(records) != 1 or not isinstance(records[0], dict):
        raise AcquisitionError("Expected exactly one indicator definition")
    indicator: dict[str, Any] = records[0]
    if (
        indicator.get("id") != INDICATOR
        or not isinstance(indicator.get("source"), dict)
        or indicator["source"].get("id") != "2"
        or not all(
            isinstance(indicator.get(key), str) and indicator[key]
            for key in ("name", "sourceNote", "sourceOrganization")
        )
    ):
        raise AcquisitionError("Unexpected or incomplete WDI indicator metadata")
    return indicator


def validate_observations(body: bytes) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    """Check identity, coverage, uniqueness, annual labels and finite/null values."""
    header, records = parse_envelope(body)
    if header.get("sourceid") != "2":
        raise AcquisitionError("Response is not World Development Indicators (source 2)")
    try:
        date.fromisoformat(header["lastupdated"])
    except (KeyError, TypeError, ValueError) as exc:
        raise AcquisitionError("Missing or invalid dataset update date") from exc
    seen: set[tuple[str, str]] = set()
    checked: list[dict[str, Any]] = []
    for row in records:
        if not isinstance(row, dict) or not isinstance(row.get("indicator"), dict):
            raise AcquisitionError("Malformed observation record")
        country, year, value = row.get("countryiso3code"), row.get("date"), row.get("value")
        if (
            row["indicator"].get("id") != INDICATOR
            or country not in COUNTRIES
            or not isinstance(year, str)
            or len(year) != 4
            or not year.isascii()
            or not year.isdigit()
            or not 1900 <= int(year) <= date.today().year
            or "value" not in row
            or (value is not None and (type(value) not in (int, float) or not math.isfinite(value)))
        ):
            raise AcquisitionError("Unexpected country, indicator, annual period or value")
        key = (country, year)
        if key in seen:
            raise AcquisitionError(f"Duplicate country-period observation: {key}")
        seen.add(key)
        checked.append(row)
    if {key[0] for key in seen} != set(COUNTRIES):
        raise AcquisitionError("Both India and United States must be present")
    coverage = {}
    for country in COUNTRIES:
        rows = [row for row in checked if row["countryiso3code"] == country]
        observed = sorted(row["date"] for row in rows if row["value"] is not None)
        if not observed:
            raise AcquisitionError(f"No actual observations for {country}")
        coverage[country] = {
            "rows": len(rows),
            "non_null": len(observed),
            "null": len(rows) - len(observed),
            "first_observed_period": observed[0],
            "last_observed_period": observed[-1],
            "missing_periods": sorted(row["date"] for row in rows if row["value"] is None),
        }
    return {
        "row_count": len(checked),
        "dataset_last_updated": header["lastupdated"],
        "countries": coverage,
    }, checked


def check_csv_spot_values(body: bytes, rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Compare three shock-year values per country against the official CSV export.

    This checks format/parsing consistency, not independent statistical truth.
    No ZIP members are extracted to disk.
    """
    try:
        with zipfile.ZipFile(io.BytesIO(body)) as archive:
            names = [name for name in archive.namelist() if name.startswith(f"API_{INDICATOR}_")]
            if len(names) != 1 or archive.getinfo(names[0]).file_size > 10 * 1024 * 1024:
                raise AcquisitionError("Expected one bounded indicator CSV in the official ZIP")
            text = archive.read(names[0]).decode("utf-8-sig")
        reader = csv.reader(io.StringIO(text))
        header = next(row for row in reader if row and row[0] == "Country Name")
        if len(header) != len(set(header)):
            raise AcquisitionError("Duplicate CSV column names")
        csv_rows = {}
        for row in reader:
            if len(row) > 1 and row[1] in COUNTRIES:
                if row[1] in csv_rows:
                    raise AcquisitionError(f"Duplicate CSV country row: {row[1]}")
                csv_rows[row[1]] = dict(zip(header, row, strict=True))
        checks = []
        for country in COUNTRIES:
            if csv_rows[country]["Indicator Code"] != INDICATOR:
                raise AcquisitionError("CSV indicator does not match the requested indicator")
            for year in CHECK_YEARS:
                json_row = next(
                    row for row in rows if row["countryiso3code"] == country and row["date"] == year
                )
                csv_value = float(csv_rows[country][year])
                if json_row["value"] is None or not math.isclose(
                    json_row["value"], csv_value, rel_tol=1e-10, abs_tol=1e-10
                ):
                    raise AcquisitionError(f"JSON/CSV vintage or value mismatch: {country} {year}")
                checks.append({"country": country, "period": year, "value": json_row["value"]})
        return checks
    except (
        zipfile.BadZipFile,
        UnicodeError,
        KeyError,
        StopIteration,
        ValueError,
        csv.Error,
    ) as exc:
        raise AcquisitionError("Could not validate the official CSV export") from exc
