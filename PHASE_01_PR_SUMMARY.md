# Phase 01: official source discovery and reproducible acquisition

## Problem and resulting behavior

IndustryResilience had an empty research foundation and no reproducible route to authentic official observations. Phase 01 now retrieves World Bank WDI GDP growth for India and the USA, preserves original responses, validates their structure, records provenance and checks six published values against the official CSV export. It also documents the industry and macroeconomic sources needed for later research without presenting unverified sources as acquired data.

## Phase 00 inspection and corrections

Read the repository engineering instructions, README, specification index, project specification, architecture, official source specification and roadmap. The Python package, configuration, DuckDB health check, empty-state app, CI and lockfile were present. The previously acknowledged configuration-schema gap was real: the loader checked only a top-level mapping. It now checks required metadata, identifiers, event statuses, ordered date windows and basic onset/baseline consistency while accepting explicit nulls for incomplete events.

Configuration is resolved from the repository working directory or an explicitly supplied directory, so a noneditable installation does not incorrectly search for repository configuration inside site-packages. Tests use pytest's importlib mode to avoid collisions between unit and integration module names.

## Architectural decisions

- Keep source-specific WDI behavior in `ingestion/world_bank.py`, bounded HTTPS retrieval in `ingestion/http.py`, original-file/receipt handling in `ingestion/storage.py`, response checks in `validation/world_bank.py`, and command dispatch in `cli.py`.
- Use the Python standard library for HTTP, hashing, JSON, CSV, ZIP and CLI handling. No additional dependencies were introduced; the existing uv lockfile installs successfully.
- Store unmodified originals with SHA-256 filenames and exclusive timestamped receipts. Repeated identical content is reused after integrity checking; previous vintages are not overwritten.
- Preserve missing values. Reject wrong countries/indicators, partial pagination, nonfinite values, duplicate country-year records in JSON, duplicate country rows in CSV, and JSON/CSV mismatches.
- Treat structural validation and analytical comparability as separate statuses. No resampling, concordance, economic metric, score, model, warehouse load or chart is implemented.
- Limit automatic acquisition to the verified GDP-growth contract. Other sources have documented manual routes or explicit unresolved access/selection steps.

## Source discovery and authentic demonstration

The [human-readable registry](docs/data/DATA_SOURCE_REGISTRY.md) and [machine-readable contracts](data/metadata/source_registry.json) contain 18 entries: one acquired/validated dataset, 15 with verified official documentation, and two unverified candidates (RBI DBIE exact exports and OEA WPI access). Unknown table IDs, country-specific coverage and reuse conditions remain explicit.

The live acquisition used only `api.worldbank.org`, with verified TLS and a restricted redirect host. It preserved 132 country-year records: each country has 65 non-null values labelled 1961–2025 and a null 1960 record. WDI reports a dataset update date of 8 October 2026. Original JSON, indicator metadata and the official CSV ZIP are stored locally. Six shock-year values (2008, 2013 and 2022 in each country) agree across formats. This checks the same upstream source, not independent statistical truth.

See the [acquisition report](reports/acquisition/world_bank_gdp_20261102T130604691809Z.md) and [immutable receipt](data/metadata/acquisitions/world_bank_gdp/20261102T130604691809Z.json).

The [comparability audit](docs/data/COMPARABILITY_AUDIT.md) addresses India's 2022–23 GDP rebasing, archived bases, fiscal/calendar boundaries, real/nominal concepts, industry classifications, revisions, missing employment histories and ongoing-event censoring. The [risk-indicator design](docs/methodology/RISK_INDICATOR_DESIGN.md) identifies evidence required for later measures without computing a composite score.

## Files created or modified

- Acquisition/validation/CLI: the five new production modules listed above; configuration validation in `src/industry_resilience/settings.py`.
- Data evidence: `data/metadata/source_registry.json`, the timestamped acquisition receipt, local Git-ignored originals and the generated acquisition report.
- Research documentation: source registry, comparability audit, manual procedures, acquisition guide and risk-indicator design.
- Engineering: unit/integration fixtures and tests, pytest import mode in `pyproject.toml`, a Makefile acquisition target, raw-directory placeholder exceptions in `.gitignore`, README, changelog, index and status corrections to the source/project specifications.
- Verification: `reports/verification/phase01_checks.txt` records actual command results.

## Verification performed

| Check | Actual result |
|---|---|
| Fresh Python 3.12 noneditable environment, `uv sync --locked --no-editable --offline` | Installed successfully from cached dependencies |
| Full tests in that environment | **47 passed**; unit and integration checks include all five dashboard sections |
| Ruff lint | Passed |
| Ruff formatting | Passed, 42 files checked |
| mypy | Passed, 16 production source files checked |
| Live official acquisition | Succeeded; original responses and receipt preserved |
| Offline replay against the real snapshot using the fresh environment | All three hashes/byte lengths, response contracts, coverage and six CSV spot checks passed |

The first fresh-environment test run encountered shared pytest temporary/cache directory permissions on this machine. Using an isolated temporary directory and disabling the shared cache resolved that environmental issue. Final verification output is retained in [the check log](reports/verification/phase01_checks.txt). CI has been configured but not executed on GitHub in this session.

## Known limitations and next steps

- The current Prompt 02 explicitly permits a GDP-growth demonstration; the broader roadmap's two real country-industry extracts remain outstanding. The MoSPI and BEA sources have not been parsed or approved for cross-country industry analysis.
- Documentation verification does not prove current file accessibility, complete history or reuse rights. DBIE requires interactive series selection; OEA access failed in this audit.
- WDI annual labels do not settle country fiscal/calendar conventions, country-specific base-year histories or observation-level revision status. Comparability remains pending. No 2026 annual record was present in the saved extract.
- Raw files are Git-ignored. Preserve/archive the originals together with receipts for the exact vintage; a future live request can return revised values. No dataset release was uploaded.
- Only local verification was performed. No GitHub CI run, public deployment or independent visual browser review was performed.
- Further source acquisition and metadata review are needed before harmonization. Phase 02 was not started.

Git state was inspected: the project files from Phase 00 and Phase 01 remain untracked in the initial repository. No staging, commit, push or GitHub pull request was performed. This document is a proposed PR description, not a claim that a PR exists.
