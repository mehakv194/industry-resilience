# Publication and Showcase Specification

## Audience
1. Professor / evaluation committee: understand validity, syllabus coverage and reproducibility.
2. GitHub visitor / recruiter: quickly understand objective, techniques, engineering quality and what was learned.
3. Economic-curious reader: explore grounded comparisons without needing to inspect code.

## Public Streamlit app (five pages)
1. **Economic Overview:** purpose, event timeline, KPI coverage, publication dates, source badges and explicit limitations.
2. **Industry Explorer:** countries, industries, real output levels (if comparable), baseline-index trajectories, growth, employment where available and recovery markers.
3. **Cross-Crisis Intelligence:** signature heatmap (industry × shock), shock-response fingerprint, rank changes, sensitivity analysis and confidence/missingness indicators.
4. **India vs USA:** normalized comparable industry traces and explanatory macro charts; clearly explain classification and time alignment.
5. **Research Findings & Methods:** research story cards, real vs hypothesized relationships, verification results, source registry, downloads and methods.

## Visualization requirements
- Each graph includes indicator name, unit, time frequency, price basis (if any), agency + source id, vintage, filters, missingness, and footnote on comparability.
- No dummy numbers in the deployed dashboard. Before data exists show honest empty states.
- Prefer normalized index `pre-shock = 100` for cross-country level comparisons; keep actual rates separate.
- Recovery period is shown only for completed and observable events. Mark `not yet observed` and right-censored outcomes distinctly.
- Show shock-event boundaries as annotations without implying that the event alone caused measured changes.

## Main research outputs
- Cross-shock industry heatmap with metrics behind every cell.
- Per-industry shock fingerprints including contraction, trend gap and recovery.
- India/US small-multiple comparison charts.
- Scatterplots or lag analysis of candidate macro drivers.
- One 2026 energy -> fertilizers -> food-prices *hypothesis test* if data coverage supports it.
- Supporting statistical robustness, model-validation and missingness reports.

## Reproducible notebooks
`01_source_audit.ipynb`, `02_harmonization.ipynb`, `03_industry_metrics.ipynb`, `04_cross_shock_relationships.ipynb`, `05_optional_data_mining.ipynb`. Notebook computations must import the tested package rather than reimplement formulas.

## Research report chapters
Cover & abstract; objectives; literature/economic rationale; source inventory; country and industry mapping; methods; event-specific analysis; cross-event analysis; US comparison; optional mining evaluation; 2026 case investigation; limitations and non-causal interpretation; India-focused implications; references and reproducibility appendix.

## GitHub README essentials
Clear headline; research thesis; events table; data ethics; architecture diagram; instructions to set up and rebuild; screenshots *only after true data is processed*; findings with source links; CI badge when created; roadmap; license and attribution; exact deployed app link once live.

## GitHub PR expectations
Purpose, scope, files changed, source choices, architecture trade-offs, tests/commands executed, screenshots if appropriate, unresolved risks, citations, and next phase. No staged or fictitious completion claims.

## Definition of done
All headline findings derived from recorded official-series inputs; tested end-to-end data rebuild; functioning five-page app; downloadable written report; code/SQL/notebooks committed with documentation; clear versioning and limitations.
