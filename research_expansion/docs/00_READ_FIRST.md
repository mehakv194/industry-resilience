# IndustryResilience — Research Expansion (Phase 7+)

## November 2026 expansion addendum
- Read `docs/09_EXPANDED_EVENT_TIMELINES.md` and `docs/10_AI_AND_TARIFF_MODULE.md` before implementing new events.
- `config/event_windows.csv` now holds 7 economic event windows; `config/structural_transitions.csv` has the AI analysis window separately.
- The original two-case notebooks have been adapted to load date rules from this CSV; observed data and source integrity checks remain mandatory.
- 2025–26 tariffs have no validated complete recovery; some 2026 countries/industries may not have six months.
- **Do not treat all 7 as independent causal shocks or put AI adoption into the monthly production shock model.**

## Mission
Extend the EXISTING working web app and historical Python analysis to 3 countries (India, USA, Germany), 10 ISIC Rev 4 two-digit manufacturing industries, seven separate economic-event windows, including two contrasting energy-market events, plus an independently analyzed AI transition, 2 research-grounded flagship methods and 8 classic data-mining methods. This package is a specification and runnable notebook scaffold, not a claim that any new models have been fitted.

## Critical rule: preserve completed work
- Never recreate React/Netlify, previous Phase 4 JSON, existing source files or Phase 6 research results.
- Inspect repository once, record actual paths and schemas in `reports/research/repo-inventory.md`.
- Extend ingestion; materialize a single monthly panel and event-features table; run notebooks; export JSON summaries; then add a slim research/models section to existing UI.
- A method is only 'implemented' when it successfully runs on observed real data. A notebook scaffold alone is not evidence of an analysis.
- Do not invent numbers, missing observations, confidence, model accuracy or causes. Distinguish growth rate from level and association from causation.
- If time is short: build country/industry coverage and event-features first, run flagship 1, then PCA/K-Means/Apriori, then all remaining algorithms.

## Files
- `docs/01_SCOPE_AND_COMPARABILITY.md` — industries, countries, dates and comparability rules.
- `docs/02_VERIFIED_DATA_LINKS.md` — concrete URLs, API guidance and access status.
- `docs/03_RESEARCH_LITERATURE.md` — exact papers and claims they do/do not support.
- `docs/04_METHODS_AND_NOTEBOOKS.md` — flagship models, 8 methods, leakage controls.
- `docs/05_DATA_CONTRACT_AND_UI.md` — schema, derived metrics, outputs, existing UI integration.
- `docs/06_ACCEPTANCE_MATRIX.md` — strict but fast completion gates.
- `docs/07_HYPOTHESES_AND_FINDINGS.md` — falsifiable research hypotheses and useful negative results.
- `docs/08_OPTIONAL_NETWORK_NODES.md` — research-grounded input-output network model for important industry nodes (stretch, not implemented).
- `prompts/MASTER_CODEX_PROMPT.md` and `prompts/PHASE_PROMPTS.md` — short prompts to execute.
- `notebooks/00..10_*.ipynb` — individual runnable analyses (require prepared real-data files).
- `config/industry_isic4.csv`, `config/event_windows.csv` — small centralized config.

## Required data contracts
1. `data/processed/panel_monthly.csv` with `date,country,industry_code,production_yoy_pct,brent_usd`. Observed non-missing values only. US and Germany index levels should be converted into YoY percentages. Indian current structured 2011-base file already contains **YoY growth percentages**, NOT index levels.
2. `data/processed/case_features.csv` created by notebook 01, with up to 210 target event rows (3 countries × 10 industries × 7 events), fewer if sources are incomplete, fewer if honest source gaps.

## Execution sequence
1. Run repository inventory, verify actual sources, add source status and observations. No wholesale refactors.
2. Generate real-data panel and reproducible `reports/research/coverage.json`.
3. Run `01_shock_profile.ipynb` (flagship: adapted resistance/normalization framework).
4. Run `02_dynamic_response.ipynb` (flagship: exploratory local projections if data enough).
5. Run 8 supporting notebooks and export results into `reports/research/models/`.
6. Update existing React pages by reading exported metrics; do not add model fitting to the browser.

## Honest status as delivered
Official sources and research links were independently located online on 2026-11-20. Dataset coverage by each 3×10 combination and the contents of the US ISIC workbook and German filtered API data have NOT been programmatically validated in this package. Container networking did not allow downloading and fitting datasets here. The notebooks are actual analysis code, but cannot produce study results until Codex ingests real observations.
