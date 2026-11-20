# IndustryResilience

## India–US manufacturing during two energy-price episodes

The energy comparison asks whether food, chemicals, basic metals, and motor vehicles saw different changes in monthly year-over-year (YoY) production growth in India and the United States. The download snapshot supports all 16 country–industry–event cases, with 12 observations in each baseline, impact, and follow-up window. [Coverage audit](reports/energy/coverage_audit.json) · [Case metrics](reports/energy/case-metrics.json)

| Event | Baseline | Impact | Follow-up |
| --- | --- | --- | --- |
| 2014 oil-price collapse | Jul 2013–Jun 2014 | Jul 2014–Jun 2015 | Jul 2015–Jun 2016 |
| 2022 energy-price surge | Feb 2021–Jan 2022 | Feb 2022–Jan 2023 | Feb 2023–Jan 2024 |

### Data and methods

- India uses published YoY growth from a third-party republication of the MoSPI National Statistical Office IIP series, 2011–12 base, mirror vintage 2026-10-09. [Official IIP catalogue](https://microdata.gov.in/nada/index.php/catalog/148) · [JSON republication](https://measure.thisindianlife.today/data/iip-industries-2011.json)
- US growth is calculated as `100 × (current index / index 12 calendar months earlier − 1)` using monthly, non-seasonally-adjusted Federal Reserve G.17 indexes. [Food IPG311N](https://fred.stlouisfed.org/series/IPG311N) · [Chemicals IPG325N](https://fred.stlouisfed.org/series/IPG325N) · [Primary metals IPG331N](https://fred.stlouisfed.org/series/IPG331N) · [Motor vehicles and parts IPG3361T3N](https://fred.stlouisfed.org/series/IPG3361T3N)
- Brent is the EIA monthly spot price in nominal US dollars per barrel. It gives global crude-oil context. [Brent MCOILBRENTEU](https://fred.stlouisfed.org/series/MCOILBRENTEU)

Each inclusive 12-month window needs at least ten observed months. Means exclude missing observations. The impact shift subtracts the baseline mean from the impact mean, and the follow-up shift subtracts the impact mean from the follow-up mean. Both measure percentage-point changes in YoY growth. The weakest three-month average uses consecutive observed months wholly within the impact window. The industry ranking sorts complete cases by impact shift within each country and event, with alphabetical industry ID breaking ties. The India–US difference requires a complete case for both countries.

During the first 12 months of the 2014 oil-price collapse, average YoY motor-vehicle production growth shifted **+5.92 pp** from baseline in India and **−0.97 pp** in the United States. The India-minus-US difference was **+6.89 pp**. [Computed cases](reports/energy/case-metrics.json) · [India IIP republication](https://measure.thisindianlife.today/data/iip-industries-2011.json) · [US motor vehicles and parts](https://fred.stlouisfed.org/series/IPG3361T3N)

The comparison is descriptive. Several economic forces overlap with the Brent episodes, and the 2022 baseline includes pandemic rebound. The 2014 impact window captures the first year of a longer price decline. NIC and NAICS industry boundaries are approximate, especially for pharmaceuticals in the US chemicals series and the treatment of parts and trailers in motor vehicles. Observations reflect the source vintages in the manifest and can differ from initial releases. [Industry crosswalk](config/industry_mapping.csv) · [Source manifest](reports/energy/data_manifest.json)

### Research context

- Maroto Sánchez and Cuadrado-Roura motivate comparing sectors across crises. Martin and Sunley frame the distinction between initial response and subsequent adaptation. Kilian explains why oil-price movements can reflect different demand and supply shocks. [Maroto Sánchez and Cuadrado-Roura (2024)](https://doi.org/10.1007/s00168-024-01261-6) · [Martin and Sunley (2015)](https://doi.org/10.1093/jeg/lbu015) · [Kilian (2009)](https://doi.org/10.1257/aer.99.3.1053)
- Harvard’s economic complexity research and UNIDO’s industrial development report provide context on specialization and industrial structure. The input series come from the IIP, Federal Reserve and EIA sources above. [Hidalgo and Hausmann (2009)](https://doi.org/10.1073/pnas.0900943106) · [UNIDO Industrial Development Report 2024](https://www.unido.org/idr/idr2024)

### Reproduce the static data

From the repository root, regenerate metrics offline from the committed monthly data and coverage audit:

```sh
uv run python -m industry_resilience.metrics.energy
```

To refresh from current sources, run `uv run python -m industry_resilience.ingestion.energy` first. A refresh updates the source manifest, coverage audit, and monthly data under `reports/energy/` and may reflect revisions. The acquisition command also accepts `--snapshots` for a directory containing the original files named `ir-india` and `ir-<FRED series ID>`.

## Python research foundation

IndustryResilience investigates whether an industry resilient to one economic shock remains resilient to others, and which economic indicators are associated with differences in its performance. India is the primary economy; the United States is a benchmark.

The research covers the 2008–09 global financial crisis, 2013 taper tantrum, 2022 Russia–Ukraine war-related disruptions, and the ongoing 2026 Middle East conflict and energy shock. COVID-19 is an optional secondary comparison. Event windows are provisional research metadata, not causal claims or observations.

The original foundation preserves a World Bank GDP-growth snapshot for India and the USA. [Source registry](docs/data/DATA_SOURCE_REGISTRY.md) · [Comparability audit](docs/data/COMPARABILITY_AUDIT.md)

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

Planned deliverables for the original roadmap include a dashboard, notebooks, a reproducible warehouse, and a research report.
