# Research hypotheses: falsifiable, interesting, and not obvious

The aim is to test these possibilities, not encode them as predetermined UI copy.

| ID | Hypothesis | Data and method | Null/contradiction that matters |
|---|---|---|---|
| H1 | Countries' resilience rankings for the same industry change between falling-oil and rising-energy events | flagship event profiles and ordinal rank comparison | Same country ranks consistently better in both events |
| H2 | Energy- and feedstock-intensive categories show greater historical response magnitude than relatively low-exposure categories | ISIC industries 20/22/24 vs control groups; PCA and descriptive profile | Similar or smaller amplitude, or effects differ sharply by country |
| H3 | Germany's 2022 manufacturing response differs more from India's than from the US in selected energy-sensitive sectors | paired country differences and case-study charts | No coherent ordering across sectors |
| H4 | A single 'industry resilience score' hides different types of vulnerability | KMeans/hierarchical plus side-by-side two-event rankings | Stable one-dimensional ordering, weak cluster separation |
| H5 | Pre-shock growth behavior alone offers limited classification signal for crisis slowdowns | group-CV logistic, KNN, RF vs DummyClassifier | A model beats dummy baseline consistently, with caveats |
| H6 | Large response outliers cluster in particular country-industry-event cases | Isolation Forest and visual review | Outliers distributed broadly without pattern |
| H7 | Change in oil prices is associated with a lagged manufacturing response at some horizons, but not universally | exploratory local projections; sign and confidence intervals | Broad CIs and non-significant estimates suggest low evidence |

## Required final research artifacts
1. Coverage and missingness figure: 3 countries × 10 industries, with observed months.
2. Rank-reversal comparison between 2014 collapse and 2022 surge, if any observed.
3. At least one figure explicitly reporting *no useful relationship* if results support that.
4. Model comparison table containing train inputs, held-out evaluation approach, majority baseline, sample count, and limitation.
5. Provenance list with source vintage and DOI of cited methodological papers.
6. One industry case narrative explaining observed data, competing explanations, and why causality is NOT claimed.

## Sensitivity checks (lightweight)
- Use baseline windows documented in `01_SCOPE_AND_COMPARABILITY.md` and perform one alternative 2022 baseline sensitivity if time permits.
- Compare seasonal adjustment of US/DE data if exact alternate series are available. Do not silently mix raw seasonal changes with adjusted month-on-month changes.
- Report all actual case counts, including unavailable German sub-industries.

## New questions for expanded timeline
- Were sector responses during the 2018–19 US–China trade conflict different in India/Germany compared with the US? (Trade exposure requires product-level tariff data.)
- Did 2020 industry growth collapse and 2021 YoY rebound produce distinct PCA or K-Means clusters? (Strong base-effect caution.)
- Did the NY Fed GSCPI co-move with production slowdowns during the 2021–22 bottleneck period? (Correlation only.)
- Did any country-industry exhibit a change in YoY production growth after 2025 tariff announcements, and do source date gaps or policy changes prevent attribution?
- Where harmonized annual AI adoption indicators exist, do electronics/machinery/automotive industries appear systematically different from other sectors? (Avoid generalizing EU-only sources to India/US.)
