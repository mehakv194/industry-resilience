# Risk Indicator Design

This document proposes evidence requirements for later research. No composite risk score, prediction, business risk explorer or economic result is calculated in Phase 01.

The unit of a future assessment is a documented industry × country × event/window, with a method version and coverage status. A national GDP-growth extract cannot establish a particular industry's resilience. All proposed measures must first pass the [comparability audit](../data/COMPARABILITY_AUDIT.md).

| Dimension | Candidate evidence and future measure | Requirements and limits |
|---|---|---|
| Output vulnerability | MoSPI real GVA and BEA real industry value added: contraction relative to a specified baseline; growth deviation from the national economy | Comparable industry/time definitions and real-price basis; retain source vintage; separate peak/trough choice from causal claims |
| Employment vulnerability | PLFS industry employment where available and BLS CES employment changes | Align employment universe, survey status and frequency; document missing historical India coverage; do not equate persons and payroll jobs |
| Recovery difficulty | Subsequent observations in the same validated real-output or employment series | Define a baseline crossing and persistence rule before calculating; right-censor incomplete follow-up; annual data support period-level, not month-level, duration |
| Macroeconomic sensitivity | Industry response associated with GDP growth, CPI inflation, RBI/Federal Reserve financing indicators, exchange rates and EIA energy prices | Align lags and frequencies; address trends, confounders and overlap; association is not causal sensitivity; a short sample may make estimation inappropriate |
| Cross-crisis consistency | Industry response profiles across separately specified financial, monetary and energy events | Common methods and coverage across events; report rank/response uncertainty and small independent event count; no arbitrary sample inflation from overlapping periods |
| Evidence quality | Source manifests, checksums, provenance, definitions, missingness, mapping quality and revision status | Publish a coverage/limitations assessment separately from economic vulnerability; lack of evidence is not low risk |

## Exposure variables are distinct from outcomes

- **Energy exposure:** Brent and Henry Hub are price/context series. Actual industry sensitivity needs expenditure/input shares, local price transmission and relevant fuel definitions. [BEA's industry-account guide](https://www.bea.gov/resources/guide-interactive-gdp-industry-accounts-tables) describes energy-input measures that may support later source selection; matching Indian inputs has not been acquired.
- **Financing exposure:** RBI DBIE and Federal Reserve H.15/H.8 can describe financial conditions after exact series selection. Industry debt dependence or credit availability requires sector-specific evidence. Do not label a national policy-rate change as an industry financing loss.
- **External trade exposure:** WDI real export growth and trade/GDP provide national context. Sector-specific export dependence requires an official product/industry mapping and the correct denominator; it cannot be inferred from national trade/GDP.
- **Employment volatility:** requires sufficient comparable observations under a fixed population definition. Frequency, seasonal adjustment and survey redesign can change apparent volatility. Cross-country pooled variation must not substitute for an industry history.
- **Historical contraction and recovery:** are proposed measured outcomes, not independent exposure inputs known before an event. Keep descriptive retrospective assessments separate from prospective predictions to avoid leakage.

## Method safeguards for later phases

Specify event onset, pre-event baseline, observation and follow-up windows before inspecting results. Keep the uncertain 2026 event incomplete until official timing and series evidence support a defined window. Consider overlapping shocks and revision vintages; contemporaneous co-movement alone cannot identify an event effect.

Document sufficient independent sample size, missing observations, outlier treatment, comparison set and sensitivity to window/lag choices. Do not choose weights for a combined score or convert missingness into zero vulnerability. Refuse a country/industry comparison when its definitions cannot be reconciled. Evidence should expose uncertainty and exclusions alongside any later measurement.

Implementation belongs to the later metrics/analysis phases after source and harmonization gates pass. No formulas or analytical outputs are added to the acquisition pipeline or dashboard in this phase.
