# Implementation ledger

## Repository map

1. Checkout: main at ee71035 before this work. GitHub listed only main.
2. pyproject.toml / uv.lock: Python 3.12 project and dependencies.
3. src/industry_resilience/cli.py: World Bank acquisition and verification.
4. src/industry_resilience/ingestion/http.py: bounded HTTPS downloader.
5. src/industry_resilience/ingestion/storage.py: immutable GDP snapshots and receipts.
6. src/industry_resilience/ingestion/world_bank.py: existing GDP adapter.
7. config/: supplied CSV crosswalk, window definitions and source registry.
8. src/industry_resilience/metrics/: package available for event calculations.
9. dashboard/app.py: Streamlit entry point. No React/TypeScript entry point, package.json or Netlify config exists in this checkout.
10. reports/energy/: normalized production and Brent, source manifest, coverage audit and static metrics.

## Phase 3

Added the energy-source adapter and the three audit outputs under reports/energy. Reused the existing HTTP acquisition utility and preserved the World Bank workflow. Parsed six downloaded files into nine series. The four India series each have 153 valid months (April 2013 to December 2025). The four US series and Brent each have 165 valid months (April 2012 to December 2025). All 16 cases have 12/12 in all three windows. The India mirror identifies its vintage as 2026-10-09. Manifest timestamps and SHA-256 digests describe this run. Next: calculate event metrics.

The original Python 3.12 environment points to an absent interpreter. The standalone phase scripts were run with installed Python 3.13. Frontend integration requires the intended existing React checkout.
