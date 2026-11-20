# Methods, notebook catalogue, mathematical meaning and guardrails

## Flagship 1 — Event-window shock-resilience profiles
**Notebook:** `01_shock_profile.ipynb`.
**Research foundation:** Martin (2012) and Martin et al (2016) resistance/recoverability, adapted — NOT their exact original metric.
**Unit:** one country-industry-event. Features: mean pre-shock YoY growth, mean shock YoY growth, growth change in **percentage points**, lowest observed YoY value, negative-month share, shock YoY volatility, post-shock mean, and first sustained return of YoY growth to pre-shock mean (label **growth normalization**, never output-level recovery). For a stable normalized trend, require 3 consecutive observed months near or above baseline; calculate only if contiguous monthly data exists. Compare India, US, Germany with transparent sample counts.
**Output:** `data/processed/case_features.csv`, `reports/research/models/shock_profiles.json`. Reserve 2022 alternative-baseline sensitivity for a later documented run. Event dates are read from `config/event_windows.csv`; tag provisional 2025–26 outcomes separately. Supervised modeling excludes events with `training_eligible=false`.

## Flagship 2 — Exploratory dynamic-response regressions
**Notebook:** `02_dynamic_response.ipynb`.
**Research foundation:** Jordà (2005) local projections.
**Method:** for horizons h ∈ {0,3,6,9,12} months, regress future YoY growth `growth[i,t+h]` on contemporaneous monthly Brent return, lagged industry YoY growth and group fixed effects. Cluster standard errors by month because Brent is a shared global exposure. This is **not a causal impulse response** because oil-price changes include both supply and demand shocks, as emphasized by Kilian (2009). A stricter specification may include other covariates and shock origins if real data can support them.
**Gate:** >= 100 unique observed calendar months and >= 6 industry-country groups with sufficiently complete coverage; otherwise mark skipped. Note overlapping YoY measures/autocorrelation and omitted macro controls. Display confidence bands and negative findings too.
**Output:** `reports/research/models/dynamic_response.json`.

## Eight additional named methods (eight separate notebooks)
| Notebook | Algorithm | Real analytical question | Output / validation |
|---|---|---|---|
| `03_pca.ipynb` | PCA | Which shock features explain most cross-case variation? | explained variance/loadings; standardized features |
| `04_kmeans.ipynb` | K-Means | Which country-industry-event cases have similar shock profiles? | clusters, centroid profiles, silhouette if valid |
| `05_hierarchical.ipynb` | Agglomerative clustering | Are K-Means groupings stable under a second clustering algorithm? | clusters, ARI agreement (not 'ground truth') |
| `06_knn.ipynb` | K-nearest-neighbors classifier | Can pre-shock information identify cases that historically slowed? | group-based CV vs majority-class baseline; do NOT leak shock outcomes into predictors |
| `07_apriori.ipynb` | Apriori association rules | Which post-shock characteristics co-occur? | rules with support, confidence, lift; small sample warning |
| `08_random_forest.ipynb` | Random Forest classification | Do nonlinear pre-shock features help classify historical slowdowns? | group-CV metrics vs dummy baseline, feature importances |
| `09_logistic_regression.ipynb` | Logistic Regression | Does a linear supervised baseline generalize? | group-CV metrics, compare with KNN/RF |
| `10_isolation_forest.ipynb` | Isolation Forest | Which observed industry-shock responses were unusually extreme? | flagged outliers and reasons; not probabilities |

### Critical anti-leakage rule
Feature outcomes such as `shock_mean_yoy`, `delta_pp`, `worst_yoy`, `post_mean_yoy` and `negative_share` may be used for **descriptive clustering**, NOT as predictors in supervised models whose target is whether `delta_pp` is negative. For KNN, Random Forest and Logistic Regression, only use pre-shock features (`baseline_mean_yoy`, `baseline_std_yoy`, `baseline_negative_share`), known country/industry IDs, and known event type. Fit preprocessing inside CV folds. Group folds by `country + industry` to avoid leakage of repeated shock cases. Results from at most 210 target event-cases (many unavailable or overlapping) will have high uncertainty; compare against majority baseline, and describe results as exploratory classification rather than forecasting reliability.

### Compute hierarchy
Mandatory: coverage + flagship 1 + descriptive stats + PCA + K-Means + one supervised baseline. Next: hierarchy, KNN, Apriori, IsolationForest. Optional: flagship 2 if data and time allow.

### Useful presentation artifacts
- 3×10 coverage heatmap and observed-event case matrix (up to 210 target rows).
- PCA biplot or loadings and variance chart.
- K-Means clusters: 'relatively stable', 'volatile', 'shock sensitive' only if assigned from actual computed centroids, otherwise use neutral cluster labels.
- Explicit comparison of Logistic Regression vs KNN vs Random Forest under SAME CV folds.
- Dynamic-response horizons with uncertainty and caveat.
- Apriori association rules as exploratory patterns, not causal mechanisms.
- Example original hypothesis tested, a null or contradictory result, and a case that changed rank across events.
