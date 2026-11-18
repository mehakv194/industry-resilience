# Contributing

Read `AGENTS.md` and the specifications in `docs/INDEX.md`. Use Python 3.12 and uv, then run `uv sync --locked`. Before submitting changes run `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, and `uv run mypy`. Explain data sources, limitations and verification in changes. Do not commit raw data, secrets, or unsupported findings.
