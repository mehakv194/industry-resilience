"""Load pinned research production into DuckDB and query the laboratory evidence."""

import argparse
import json
from datetime import date
from pathlib import Path
from uuid import uuid4

from .database import initialize_database

ROOT = Path(__file__).resolve().parents[3]
REPORT = ROOT / "reports/research"
COUNTRIES = {"IND": "India", "USA": "United States", "DEU": "Germany"}


def load(db, panel, sources):
    db.execute((ROOT / "sql/ddl/production.sql").read_text(encoding="utf-8"))
    db.executemany("INSERT INTO dim_country VALUES (?, ?)", COUNTRIES.items())
    db.executemany(
        "INSERT INTO dim_industry VALUES (?, ?, ?, ?, ?)",
        [
            tuple(
                row[key]
                for key in (
                    "industry_code",
                    "industry_name",
                    "india_nic2008",
                    "germany_nace_r2",
                    "us_preferred",
                )
            )
            for row in panel["industries"]
        ],
    )
    db.executemany(
        "INSERT INTO dim_date SELECT m, year(m), quarter(m) FROM (SELECT CAST(? AS DATE) m)",
        [(month + "-01",) for month in panel["months"]],
    )
    columns = [
        "country",
        "industry_code",
        "series_id",
        "publisher",
        "source_url",
        "download_url",
        "unit_raw",
        "unit_derived",
        "match_grade",
        "vintage",
        "sha256",
        "retrieved_at_utc",
        "retrieval_timestamp_basis",
        "valid_count",
    ]
    db.executemany(
        f"INSERT INTO dim_source VALUES ({', '.join('?' for _ in columns)})",
        [tuple(row[column] for column in columns) for row in sources],
    )
    source_keys = {row["country"] + row["industry_code"] for row in sources}
    if source_keys != set(panel["production"]):
        raise ValueError("Panel series and source manifest disagree")
    db.executemany(
        "INSERT INTO fact_production VALUES (?, ?, ?, ?)",
        [
            (key[:3], key[3:], date.fromisoformat(month + "-01"), value)
            for key, series in panel["production"].items()
            for month, value in zip(panel["months"], series, strict=True)
            if value is not None
        ],
    )
    for row in panel["events"]:
        db.execute(
            "INSERT INTO dim_event VALUES (?, ?, ?)", [row["event"], row["category"], row["note"]]
        )
        for prefix, phase in (("baseline", "baseline"), ("shock", "impact"), ("post", "follow-up")):
            if row[prefix + "_start"]:
                db.execute(
                    """INSERT INTO bridge_event_month
                    SELECT ?, month, ? FROM dim_date WHERE month BETWEEN ? AND ?""",
                    [
                        row["event"],
                        phase,
                        row[prefix + "_start"] + "-01",
                        row[prefix + "_end"] + "-01",
                    ],
                )
    mismatches = db.execute("""
        SELECT count(*) FROM (
            SELECT s.country, s.industry_code FROM dim_source s
            LEFT JOIN fact_production f USING (country, industry_code)
            GROUP BY s.country, s.industry_code, s.valid_count
            HAVING count(f.month) <> s.valid_count
        )
    """).fetchone()[0]
    if mismatches:
        raise ValueError(f"{mismatches} warehouse series differ from source manifest counts")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--database", type=Path, default=ROOT / "data/processed/production.duckdb")
    args = parser.parse_args()
    panel = json.loads((REPORT / "panel.json").read_bytes())
    sources = json.loads((REPORT / "source_manifest.json").read_bytes())["production"]
    args.database.parent.mkdir(parents=True, exist_ok=True)
    temporary = args.database.with_name(f".{args.database.name}.{uuid4().hex}.duckdb")
    try:
        with initialize_database(temporary) as db:
            load(db, panel, sources)
        temporary.replace(args.database)
    finally:
        temporary.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
