"""Clearly synthetic response fixtures, used only by tests."""

import csv
import io
import json
import zipfile
from typing import Any

import pytest

from industry_resilience.validation.world_bank import CHECK_YEARS, COUNTRIES, INDICATOR


@pytest.fixture
def wdi_payload() -> list[Any]:
    """Synthetic GDP-growth-shaped records; these are not economic observations."""
    rows = [
        {
            "indicator": {"id": INDICATOR, "value": "Synthetic test indicator"},
            "countryiso3code": country,
            "date": year,
            "value": 1.25,
        }
        for country in COUNTRIES
        for year in CHECK_YEARS
    ]
    rows.append({**rows[0], "date": "1960", "value": None})
    return [
        {"page": 1, "pages": 1, "total": len(rows), "sourceid": "2", "lastupdated": "2025-01-01"},
        rows,
    ]


@pytest.fixture
def indicator_body() -> bytes:
    """Synthetic indicator metadata for offline tests only."""
    return json.dumps(
        [
            {"page": 1, "pages": 1, "total": 1},
            [
                {
                    "id": INDICATOR,
                    "name": "Synthetic test indicator",
                    "source": {"id": "2"},
                    "sourceNote": "Synthetic definition",
                    "sourceOrganization": "Test provider",
                }
            ],
        ]
    ).encode()


@pytest.fixture
def csv_zip() -> bytes:
    """Synthetic ZIP/CSV export, never written to production data paths."""
    text = io.StringIO(newline="")
    writer = csv.writer(text)
    writer.writerow(["Synthetic test data"])
    writer.writerow(["Country Name", "Country Code", "Indicator Code", *CHECK_YEARS])
    for country in COUNTRIES:
        writer.writerow([country, country, INDICATOR, 1.25, 1.25, 1.25])
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        archive.writestr(f"API_{INDICATOR}_synthetic.csv", text.getvalue())
    return buffer.getvalue()
