"""Initialize an empty DuckDB connection without creating research tables."""

from pathlib import Path

import duckdb


def initialize_database(path: str | Path = ":memory:") -> duckdb.DuckDBPyConnection:
    """Connect to an in-memory or existing/new local DuckDB database."""
    return duckdb.connect(str(path))
