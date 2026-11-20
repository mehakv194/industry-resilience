# Data Mining and Data Warehousing Lab evidence

## Audit before implementation

| Area | Existing evidence | Lab addition |
| --- | --- | --- |
| DuckDB and dimensional model | Connection helper; empty SQL directories | Persistent production warehouse, constraints and event-month bridge |
| ETL and preprocessing | Offline source extraction, unit conversion, crosswalks, pinned panel, provenance and event coverage | Load into DuckDB and reconcile each series to its manifest |
| EDA and OLAP | Data audit notebook, coverage figure, descriptive shock profiles and model-level anomaly flags | SQL coverage, five-number summaries, IQR flags and four OLAP operations |
| Models and notebooks | Executed notebooks 00–12 and corresponding exports; the tariff notebook recorded a skip | Compare checked-in fold scores and surface verified results |
| Website | Existing Pipeline, Overview and case studies | Interactive table inspector, expandable SQL results and evaluation gallery |

## Warehouse grain and provenance

The warehouse uses the expanded research panel, with 30 country–industry series from January 2013 through October 2026. The original fixed-window study remains a separate existing dataset.

- **Fact** `fact_production` has one row per observed (country, industry_code, month), its composite primary key. The numeric measure is YoY production growth in percent.
- **Dimensions** `dim_country`, `dim_industry` and `dim_date` have primary keys country, industry_code and month. Each is a foreign key on the fact. Date includes calendar quarter and year.
- **Source** `dim_source` has one pinned series per (country, industry_code), referenced by the fact. It retains publisher, official reference, download URL, original and derived units, retrieval metadata, vintage where provided, matching grade and SHA-256.
- **Event** `dim_event` has one row per event. `bridge_event_month` has one row per (event, month) with phase and foreign keys to event/date. Calendar overlap is allowed across events. Filter to one event or group by event before counting observations after this join.
- Missing values have no fact row. Coverage uses source series × calendar months and a left join to the fact.

## Reproduction and SQL

The existing `research_expansion/scripts/build_panel.py` reads the cached source files. It keeps India's MoSPI growth rates from the Measure of India republication, converts US Federal Reserve G.17 and German Eurostat NSA indexes with the exact 12-month lag, harmonizes approximate divisions, and preserves gaps. For this audit, the cached files reproduced the checked-in panel byte for byte, and every production snapshot fingerprint matched. The lab commands below start from those checked-in inputs and need no network or source refresh.

With the project Python dependencies installed, run from the repository root:

```powershell
$env:PYTHONPATH = 'src'
python -m industry_resilience.warehouse.production
python research_expansion/scripts/export_warehouse.py
npm --prefix web run build
```

The load creates `data/processed/production.duckdb`. The export executes the SQL in `sql/olap/` and writes `reports/research/warehouse.json` for Vite. The quality totals reconcile to 4,870 observed and 110 missing series-month slots out of 4,980. India accounts for 100 missing slots, Germany for 10, and the US for zero. The 1.5× IQR fences are calculated separately per series and flag 231 observations; the highest-ranked flag is India's April 2021 motor-vehicle value. These are review flags and the published observations remain available.

The slice fixes the 2022 energy-surge impact window. The dice adds country, industry and phase filters. The drill-down shows the months for India's motor-vehicle series inside the impact window. The roll-up uses quarterly and annual grouping sets for the 2022 calendar year. The reported means weight available industry-months equally. They summarize YoY growth and do not measure aggregate output change or causal effects.

## Executed model evidence

The checked-in notebook runs and JSON artifacts establish the following results.

| Method | Result |
| --- | --- |
| PCA | First two components explain 72.9% of variance in 150 standardized shock profiles |
| K-Means | Three clusters sized 148, 1 and 1; silhouette 0.855 |
| Ward hierarchical clustering | Same partition as K-Means on these profiles; adjusted Rand index 1.00 |
| Apriori | 30 rules at 12% minimum support across 200 cases; the 2021 supply-chain event co-occurred with no slowdown and high volatility with 13% support, 86.7% confidence and 3.61 lift |
| Isolation Forest | 15 of 150 profiles flagged |
| Local projections | Five exploratory response horizons fitted; see the existing research report |

| Classifier | Fold 1 | Fold 2 | Fold 3 | Mean |
| --- | ---: | ---: | ---: | ---: |
| Majority baseline | 60.0% | 72.5% | 72.5% | 68.3% |
| K-nearest neighbors | 72.5% | 77.5% | 70.0% | 73.3% |
| Logistic regression | 65.0% | 75.0% | 85.0% | 75.0% |
| Random Forest | 70.0% | 77.5% | 82.5% | 76.7% |

The supervised notebook held out 30 country–industry groups across three folds and used 120 eligible historical cases. Scaling and category encoding were fitted within the folds. The outcome was the sign of the difference between impact and baseline mean YoY growth. Performance on an unseen shock remains untested because event identities recur across folds. The two singleton clusters reflect extreme profiles, and the association rules describe historical co-occurrence.

SVM remains a candidate. Tariff exposure was skipped because aligned observed trade and duty inputs were unavailable. The source series do not measure production loss, downtime or costs. Germany's structural AI survey is descriptive context.
