"""Export static SQL results from the local laboratory warehouse."""

import json

from industry_resilience.warehouse.database import initialize_database
from industry_resilience.warehouse.production import REPORT, ROOT


def main():
    queries = {}
    with initialize_database(ROOT / "data/processed/production.duckdb") as db:
        for path in sorted((ROOT / "sql/olap").glob("*.sql")):
            sql = path.read_text(encoding="utf-8-sig").strip()
            result = db.execute(sql)
            queries[path.stem] = {
                "sql": sql,
                "columns": [column[0] for column in result.description],
                "rows": result.fetchall(),
            }
        observed = db.execute("SELECT count(*) FROM fact_production").fetchone()[0]
        expected = db.execute("""
            SELECT (SELECT count(*) FROM dim_source) * (SELECT count(*) FROM dim_date)
        """).fetchone()[0]
        quality = queries["quality"]["rows"]
        if (
            sum(row[1] for row in quality) != observed
            or sum(row[1] + row[2] for row in quality) != expected
        ):
            raise ValueError("Quality totals disagree with the warehouse")
        rollup = queries["roll-up"]["rows"]
        if sum(row[2] for row in rollup if row[1] is not None) != rollup[-1][2]:
            raise ValueError("Quarter counts do not reconcile with the annual roll-up")
        schema = db.execute("""
            SELECT table_name, column_name, data_type FROM information_schema.columns
            WHERE table_schema = 'main' ORDER BY table_name, ordinal_position
        """).fetchall()
    (REPORT / "warehouse.json").write_text(
        json.dumps(
            dict(observed=observed, expected=expected, schema=schema, queries=queries),
            indent=2,
            allow_nan=False,
        )
        + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
