.PHONY: install test lint format-check typecheck run acquire
install:
	uv sync --locked
test:
	uv run pytest
lint:
	uv run ruff check .
format-check:
	uv run ruff format --check .
typecheck:
	uv run mypy
run:
	uv run streamlit run dashboard/app.py
acquire:
	uv run python -m industry_resilience.cli acquire-world-bank-gdp
