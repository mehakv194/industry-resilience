# Technology Stack & Decisions

| Layer | Preferred tool | Decision and reason |
|---|---|---|
| Runtime | Python 3.12 | Single-language analytics codebase |
| Packaging | `uv`, `pyproject.toml`, `uv.lock` | Reproducible developer setup |
| Download/import | `requests`, Python stdlib, `pandas` | Mixed government web/API/Excel data |
| Dataframes | `pandas`, `numpy`, `pyarrow` | Cleaning and Parquet interoperability |
| Warehouse | DuckDB + SQL | Local analytical DB with no server to operate |
| Statistics | SciPy, statsmodels | EDA, trend/lags/correlation and uncertainty |
| Data mining | scikit-learn | Clustering, interpretable models, validation |
| Academic compatibility | WEKA ARFF export | Reproduce selected DMDW lab experiments |
| Exploration | Jupyter | Transparent experimental notebooks |
| Visuals | Plotly | Interactive industry time-series and matrices |
| Web app | Streamlit | Fast Python-based published data exploration |
| Quality | pytest, Ruff, optional mypy | Unit tests and style/type checks |
| Version control | Git, GitHub, GitHub Actions | Reviewed commits, PRs and CI |
| Hosting | Streamlit Community Cloud | Starter deployment from public GitHub |
| Publication | Markdown + PDF report | Human-readable research and downloadable findings |

## Not using in MVP
No React/Next.js frontend, FastAPI service, Supabase, MongoDB, authentication, distributed jobs, Docker orchestration or paid cloud infrastructure. Add components only when requirements justify them.

## Hosting strategy
Deploy the Streamlit viewer with a compact versioned analytical export (Parquet or DuckDB read-only artifact) generated offline. Data collection/transformation runs as a documented build workflow, not on every web page load. If datasets or licenses prohibit committing processed records, publish a reproducible release artifact only where permitted, or require user-provided source files. Protect API keys with environment variables and `.env.example`, not committed `.env`.

## Development environments
Windows + VS Code + Codex supported. Keep scripts cross-platform where feasible; avoid shell-only commands as the sole documented workflow. A single Python CLI entrypoint can later expose `sources`, `validate`, `build-warehouse`, `analyze` and `export` subcommands.

## Decision log (initial)
- ADR-001: Python modular monolith, not distributed services.
- ADR-002: DuckDB embedded warehouse, not production PostgreSQL.
- ADR-003: Streamlit viewer, no custom frontend.
- ADR-004: No synthetic economic observations; tests can use synthetic fixtures.
- ADR-005: Strict data-vintage and harmonization provenance.
