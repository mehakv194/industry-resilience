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

## Phase 4

Added src/industry_resilience/metrics/energy.py and reports/energy/case-metrics.json in the commit after 08b5d32. Exported 16 case summaries and eight matched deltas. Checked exact twelve-month lag, suppression at 9/12, acceptance at 10/12, percentage-point subtraction and consecutive-month rolling behavior. Equal shifts use alphabetical industry ID as the tie-break. Next: integrate static files when the React checkout is supplied.

## Phase 5

Blocked. Local inventory and GitHub main corroborate the Python project layout. The existing React/TypeScript/Netlify checkout is required for filters, charts, rankings, source and missing-case display. Preserved the Streamlit scaffold per the requested frontend scope. Continued with independent research documentation.

## Phase 6

Updated README.md with fixed windows, units, exact source links, research precedents, vintage and comparability limits, offline reproduction and one calculated motor-vehicle result. Checked the finding against the Phase 4 export. UI citation display depends on Phase 5. Next: verify the static data handoff and record release status.

## Phase 7

Rebuilt all four static JSON files from the downloaded bytes and compared SHA-256 hashes. The regenerated outputs matched byte for byte. The 12-month lag, 9/12 versus 10/12 threshold, percentage-point subtraction and 16 ready / eight matched results passed. Ruff lint and format checks passed for both new modules. The existing mypy launcher cannot start because its configured Python 3.12 executable is absent.

Release blocked at frontend integration: no package.json, static React production build, or linked Netlify configuration was found. Browser smoke and live deployment are pending. Next: open the existing React project and connect the four JSON outputs before building and deploying.

## Phase 5 frontend implemented

The supplied Phase 5 brief authorized creating the React app in web/. This resolves the missing frontend recorded above. Added a Vite/React/TypeScript frontend with a shared adapter for the Phase 4 case metrics, normalized monthly growth and Brent observations, and source manifest. Overview, Case Studies, and Risk Calculator share the supplied light theme. Added Netlify build and client routing configuration and documented local commands in README.md. Existing Python, Streamlit, and data outputs were preserved.

TypeScript and the production build passed. Browser smoke covered 2014 motor vehicles India versus US (+6.89 pp), 2022 US food with the impact-only chart and IPG311N source, and submitting the calculator and following its preselected case-study link. The narrow case-study layout had no horizontal overflow. The 2022 motor-vehicle highlight shows its baseline means so the magnitude of the pandemic-era base effect is visible.

Netlify is configured. A linked project and deployment token were unavailable, so no live deployment was verified. Vite reports a large client bundle warning (905 kB minified, 239 kB gzip). Next: link the intended Netlify site and verify the deployed routes.

## Research expansion

Reused the two extracted research packs and applied the newer seven-event calendar. Normalized 30 real country–industry panels and 4,870 observed production months, with Fed ISIC4 and Eurostat NSA indexes converted by exact calendar lag. Added Eurostat German AI survey observations and World Bank European gas context. Preserved the earlier energy data and fixed-window metrics.

Executed notebooks 00–12. The historical profiles yielded 200 eligible cases out of 210. India lacks seven of eight 2026 tariff impact months, so ten shifts are withheld. The tariff notebook executed its skipped-exposure path because the verified imports/duties extract was unavailable. All four classifier/dummy results, five horizon regressions and the other five descriptive model outputs are exported.

Expanded the existing React filters, charts, rankings, calculator and methods without adding routes or dependencies. Browser smoke verified Germany chemicals 2022 (-8.21 pp), India 2026 tariffs (1/8 with unavailable metrics), the preserved original 2014 comparison (+6.89 pp) and the expanded calculator. TypeScript and build passed. The compressed JS is about 304 kB. Netlify configuration is unchanged and live verification remains pending.

## Insight-first interpretation upgrade

Added a shared deterministic interpretation layer, an audited low-base note, and a reproducible 150-point PCA projection joined to existing K-Means assignments. The original data and model exports were preserved. The original 2022 motor-vehicle gap is inspectable in its case and omitted from headline findings. The clustering exhibit explains the 148-profile group and two singleton extremes. Overview now uses research discoveries, interactive industry bars, profile scatter, held-out accuracy, and association rules. Case Studies and Risk Calculator lead with conclusions and keep raw observations, sources and formulas in details.

Checks: reproduced the original -1,195.06 pp gap and the 31.65% India baseline sensitivity without April 2021. Confirmed the coordinate export matches stored PCA loadings and explained variance. TypeScript and production build passed. Browser smoke verified role guidance, Overview model displays, Germany chemicals drill-down, and the original India outlier evidence. Vite reports a large client bundle (319 kB gzip). Live deployment was outside this pass.

## Netlify production release

Published the static Vite build to https://delicate-torrone-e3876f.netlify.app/ via Netlify's project upload. The build includes the expanded study by default, ten industry options and Germany. The static redirect supports direct navigation to Case Studies and Risk Calculator. The deployment is a manual upload.

Verified the live homepage, the Germany chemicals deep link (-8.21 pp, Eurostat NACE C20), the original 2014 India–US motor-vehicle comparison (+6.89 pp), and an unauthenticated request to the calculator route. TypeScript/build and the three focused numerical checks passed. Original coverage remains 16 ready cases. Expanded coverage remains 200 eligible of 210.

## Dedicated Research Results page

Added the Model Results navigation and /results route in web/src/main.tsx, with the page in web/src/results.tsx, its scoped styles in web/src/results.css, and the static artifact adapter in web/src/results-data.ts. Reconciled the warehouse counts, classifier folds, PCA variance, cluster assignments, anomaly scores and leading Apriori rule against the checked-in exports. The page also shows the local projections, descriptive AI adoption, skipped tariff study, and notebook and warehouse evidence.

TypeScript and the Vite production build passed with a large-chunk warning. Numerical checks covered exact 12-month YoY, the 10/12 observation threshold and the percentage-point growth shift. The browser smoke covered direct navigation, classifier selection and fold details, country/industry/event filters, singleton exclusion and the warehouse deep link. Additional classification metrics and refined clustering exports were unavailable. Next release step is a separate Netlify publish and live /results smoke check.

Published commit 30dd4bd to Netlify (deploy 6b007be395f8903d3b21ca55). Verified direct navigation to https://industry-resilience.netlify.app/results, the deployed build asset, and the live fold table. Random Forest showed 76.7% mean accuracy against the 68.3% baseline. The page also showed 72.9% PCA variance and 15 flagged profiles. Cached research data is unchanged, with 16 original ready cases and 200 of 210 expanded cases eligible. Accuracy on unseen shocks remains untested.
