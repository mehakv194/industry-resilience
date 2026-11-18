# IndustryResilience

IndustryResilience investigates whether an industry resilient to one economic shock remains resilient to others, and which economic indicators are associated with differences in its performance. India is the primary economy; the United States is a benchmark.

The research covers the 2008–09 global financial crisis, 2013 taper tantrum, 2022 Russia–Ukraine war-related disruptions, and the ongoing 2026 Middle East conflict and energy shock. COVID-19 is an optional secondary comparison. Event windows are provisional research metadata, not causal claims or observations.

Only real data from official government and authoritative intergovernmental sources are used. Phase 01 preserves an authentic World Bank GDP-growth snapshot for India and the USA; no economic findings or harmonized industry panel are claimed. See the [source registry](docs/data/DATA_SOURCE_REGISTRY.md) and [comparability audit](docs/data/COMPARABILITY_AUDIT.md).

## Architecture and status

The modular Python foundation separates source ingestion → validation → harmonization → Parquet and DuckDB → metrics, analysis and mining → Streamlit/Plotly, notebooks and a report. Phase 01 adds official acquisition, provenance and source discovery. The warehouse remains an empty connection health check; its planned schema is documented in [architecture](docs/architecture/ARCHITECTURE.md). The dashboard shows empty states. Python 3.12, uv, pandas, NumPy, PyArrow, DuckDB, SciPy, statsmodels, scikit-learn, Streamlit, Plotly, Jupyter, pytest, Ruff and mypy comprise the stack; WEKA is for later academic analysis.

## Setup

Install Python 3.12 and [uv](https://docs.astral.sh/uv/), then from the repository root:

```sh
uv sync --locked
uv run pytest
uv run ruff check .
uv run ruff format --check .
uv run mypy
uv run streamlit run dashboard/app.py
```

Run commands from the repository root. Configuration lives in `configs/`; `load_config` also accepts an explicit directory. The database utility can initialize an empty local file or an in-memory connection.

## VS Code and notebooks

Open this folder in VS Code (`code .`) and install the recommended Python,
Jupyter and Ruff extensions. Select `.venv` as the Python interpreter and the
notebook kernel after `uv sync --locked`.

Start with `notebooks/00_project_setup.ipynb`, then
`notebooks/01_source_audit.ipynb`. Both run offline and reuse the package.
Alternatively, run `uv run jupyter lab` from the repository root.
Notebooks 02–05 are planning templates; later research phases are not implemented.
No notebook downloads data, writes a warehouse, or invents research results.

## Official acquisition

```sh
uv run python -m industry_resilience.cli acquire-world-bank-gdp
```

This retrieves WDI GDP growth (`NY.GDP.MKTP.KD.ZG`) for India and the USA, its official definition and a CSV ZIP cross-check. The recorded demonstration contains 65 non-null values per country, labelled 1961–2025, and one null each. It is a macroeconomic demonstration, not an industry resilience result. Fiscal/calendar alignment and national revision histories remain pending.

Original responses are preserved under `data/raw/world_bank_gdp/` using SHA-256 filenames. Timestamped receipts live in `data/metadata/acquisitions/`, and reports in `reports/acquisition/`. Raw files are Git-ignored; archive them with their receipts to retain the exact vintage. A later live download may change. Existing originals and receipts are not overwritten.

Recheck the acquired snapshot without network access:

```sh
uv run python -m industry_resilience.cli verify-world-bank-gdp data/metadata/acquisitions/world_bank_gdp/20261102T130604691809Z.json
```

That verification requires the original raw files on disk; a clone containing only metadata must first acquire a new snapshot. See [acquisition details](docs/data/ACQUISITION.md), [manual source procedures](docs/data/MANUAL_ACQUISITION.md), and the [machine-readable source registry](data/metadata/source_registry.json). No API key or additional dependency is required for the implemented workflow.

## Roadmap and deliverables

The [roadmap](docs/phases/IMPLEMENTATION_ROADMAP.md) describes phases 00–07: foundation, sources, harmonization, warehouse, analysis, mining, dashboard, and publication. Its two country-industry extracts remain outstanding: Prompt 02 permits GDP growth as the first acquisition demonstration. Further source work is required before industry analysis. No Phase 02 harmonization has begun. The [risk-indicator design](docs/methodology/RISK_INDICATOR_DESIGN.md) defines future evidence needs without calculating a score.

Planned final deliverables are a public repository, dashboard, notebooks, reproducible warehouse, and research report. Source hashes, vintages, explicit comparability decisions, tested methods, and documented limitations support reproducibility. No research findings or deployment are claimed.
