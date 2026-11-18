# IndustryResilience — Project Specification

**Status:** Foundation and initial official macro-data acquisition implemented; no empirical findings or harmonized industry series are claimed. See the Phase 01 registry and acquisition report in `docs/INDEX.md`.  
**Primary economy:** India. **Benchmark:** United States. **Delivery:** public GitHub repository, hosted Streamlit application, research notebooks, reproducible warehouse, and final report.

## Executive summary
IndustryResilience studies whether the *same industry* behaves consistently across *different kinds of economic disruptions*. It quantifies industry contraction, deviations from normal performance, employment and production changes, and recovery; then compares Indian industries with equivalent US sectors. Its central contribution is a **cross-shock industry resilience profile**, not simply a ranking of industries in a single crisis.

## Core research questions
1. How did each comparable industry respond to financial, monetary, and energy/geopolitical shocks?
2. Does resilience in one shock predict resilience in another, or does it depend on the shock mechanism?
3. Which observed macro indicators (interest rates, credit, energy costs, inflation, exchange rates, trade) move with industry performance?
4. Where do comparable industries in India and the US respond differently, and what explanations are consistent with the evidence?
5. What India-focused economic risk and diversification lessons can cautiously be drawn?

## Selected events
| Event | Type | Treatment | Important caveat |
|---|---|---|---|
| 2008–09 global financial crisis | Banking / global recession | Primary completed case | Requires compatible historical industry series |
| 2013 taper tantrum | Capital flows / monetary uncertainty | Smaller-shock comparison | Not a worldwide recession; distinguish India versus US exposure |
| 2022 Russia–Ukraine war-related disruptions | Commodities / trade / energy | Primary completed-period analysis | Avoid attributing all 2022 movements to war alone |
| 2026 Middle East conflict / energy disruptions | Geopolitical / energy supply | Contemporary observation and monitoring | Ongoing: no completed recovery claim |
| 2020–21 COVID-19 | Pandemic + economy | Optional secondary benchmark | Not a centerpiece |

**Event timing policy:** Define event onset, pre-shock baseline, observation window, follow-up window, comparison period, and date rationale in `configs/crises.yaml`; do not silently treat a year as an instantaneous exposure. Distinguish outcome observation from causal attribution.

## Measurements
- **Core outcomes:** real industry GVA/value-added growth; baseline-index and maximum contraction; difference from national growth; industry share; recovery time (when observable).
- **Secondary outcomes:** employment and production/IIP when matched official historical data is available; report missing coverage rather than impute claims.
- **Explanatory factors:** GDP growth, CPI/inflation, interest rates, credit growth, exchange rates, energy prices, trade/export growth and freight where appropriate.
- **Optional 2026 narrative:** energy -> fertilizer/input costs -> food prices, evaluated with official series and time lags; exploratory, not a presumed established causal pathway.

## Research design
Unit of analysis is an *industry × country × observed period*; event exposure is linked through a separately documented event window. Compute a per-event response profile with comparable growth, decline and recovery measurements. Build cross-event matrices and examine changes in rank/response, correlations with controls and differences across countries. Explicitly account for short series, overlapping events, lag choice, multiple comparisons and confounding.

## Deliverables
1. **GitHub repository:** setup steps, source manifests, Python ingestion and validation, SQL warehouse, notebooks, code tests, CI, documented PRs.
2. **Interactive Streamlit dashboard:** Overview, Industry Explorer, Cross-Crisis Intelligence, India vs USA, Research Findings & Methods.
3. **Notebook collection:** data audit, harmonization, metric calculations, cross-shock tests, optional WEKA/scikit-learn experiments.
4. **Research report (PDF):** questions, source tables, methods, figures, cross-crisis findings, caveats and India implications.
5. **Reproducibility evidence:** source hashes/vintage metadata, command-line rebuild, test output and documented limitations.

## Definition of success
A fresh clone can install dependencies and run tests; available official inputs can be downloaded or manually provided in documented form; the processing pipeline validates and harmonizes them; DuckDB reproduces the analysis; dashboard charts show only verified results with source attribution; every headline claim points to a traceable figure or query.

## Out of scope for v1
Login system, paid cloud database, realtime streaming, prediction of war outcomes, policy causation claims, investment recommendations, fabricated datasets, and complicated ML on insufficient independent observations.
