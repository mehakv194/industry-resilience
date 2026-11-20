# Technical contract and integration into existing application

## Working source-of-truth files
`data/processed/panel_monthly.csv`:
```
date,country,industry_code,production_yoy_pct,brent_usd
2014-07-01,IND,10,...,...
```
The row shown above is a STRUCTURAL EXAMPLE, not an actual observation. Do not paste it as data. `country` ISO3: `IND`, `USA`, `DEU`; industry code strings with leading zeros preserved. Date first of month; `production_yoy_pct` percentage points; `brent_usd` nominal USD/bbl **level**. Source metadata separately in `reports/research/source_manifest.json` or extra columns.

`data/processed/case_features.csv` columns:
`country,industry_code,event,baseline_mean_yoy,baseline_std_yoy,baseline_negative_share,shock_mean_yoy,delta_pp,worst_yoy,negative_share,shock_std_yoy,post_mean_yoy,n_baseline,n_shock,n_post,baseline_window,shock_window,post_window`

## Derivations
- For monthly indexes in US/DE: `100*(index[t]/index[t-12]-1)`, only when both values exist and index[t-12] > 0.
- For India structured 2011-base: `production_yoy_pct = existing series numeric observation`, no second percent transformation.
- Brent monthly return: `100*ln(brent[t]/brent[t-1])` if values positive.
- `delta_pp = mean(production_yoy_pct during shock) - mean(production_yoy_pct during baseline)` (percentage points, descriptive).
- Count actual observations per window; minimum >= 6 baseline and >= 6 shock months for a case, record if not enough. 2014 has longer time windows; 2022 has 11 months.
- Case ranking = rank of observed `delta_pp`, not likelihood of firm survival. Do not label high score 'safe'.
- Baseline choice for 2022 is 2019 calendar year as primary (pre-pandemic comparator); document the structural distance, with `2021-07..2022-01` as sensitivity scenario that may reflect rebound distortions.

## Architecture
Raw source files (`data/raw/`, ideally with provenance) → one lightweight normalization script → `panel_monthly.csv` + source manifest → notebooks → JSON in `reports/research/models/` + `reports/research/research_summary.json` → existing React data adapter → existing three-page UI.

Event configuration: `config/event_windows.csv` is the single dated-window source; `config/structural_transitions.csv` tracks AI separately. Optional annual AI context `data/processed/ai_indicators.csv` and optional tariff exposure `data/processed/tariff_exposure.csv` must retain their own measurement units and provenance. See docs/10.

## UI extensions (small, no redesign)
- Overview: 'Research Lab' results widget, actual count of valid cases, 2 notable findings.
- Case Studies: add Germany to filters; add industries only where data really exists; charts based on real time series and same selected units; optional methodology tab for PCA/cluster output.
- Risk Calculator: retain historical exposure framing and data-driven comparisons; an optional peer cluster label and similarity examples. Do not add supervised prediction probabilities or arbitrary confidence levels.
- Research/Methodology drawer or section: model inventory, data provenance, performance/limitations table, citations and links to notebooks on GitHub.

## Frontend contract
JSON with stable `model_id, model_version, run_utc, input_series_vintage, status, sample_count, country_count, industry_count, metrics, findings, limitations, provenance`. Use `status:'skipped'` with reason for models without sufficient data. Never show 'completed' if notebook could not fit.
