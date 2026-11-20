# Economic events — expanded study plan (as of 2026-11-20)

## Research scope
Keep the **same ten ISIC manufacturing industries and three countries** (India, US, Germany). Seven event windows are defined in `config/event_windows.csv`; only four are initially eligible for supervised training, and even these are observational labels. An additional **AI structural transition** is separately defined in `config/structural_transitions.csv`. The target is **up to 210** event/country/industry rows, not a claim that 210 complete results exist.

## Event definitions (analyst-chosen, not official recession periods)
| Event ID | Baseline | Shock / analysis window | Post window | Priority | Main warning |
|---|---|---|---|---|---|
| `oil_collapse` | Jan 2013–Jun 2014 | Jul 2014–Feb 2016 | Mar 2016–Dec 2017 | Core | Energy price and global demand move together |
| `us_china_tariffs_2018` | Jan 2016–Jun 2018 | Jul 2018–Dec 2019 | Jan–Feb 2020 only | Core | No clean post-event recovery due to COVID |
| `covid_disruption_2020` | Jan 2018–Dec 2019 | Mar–Dec 2020 | 2021 | Core | 2021 YoY rebound and base effects; country-specific restrictions |
| `supply_chain_2021` | 2018–2019 | Jan 2021–Jan 2022 | Feb 2022–Dec 2023 | Secondary | Energy shock and COVID overlap; use NY Fed GSCPI |
| `energy_surge_2022` | 2019 | Feb–Dec 2022 | 2023–2024 | Core | 2019 far from shock, test alternate 2021 baseline |
| `tariff_wave_2025` | 2023–2024 | Apr 2025–Jan 2026 | None | Provisional | Tariffs changed legally and by product; no uniform duty rate |
| `tariff_regime_2026` | 2024–2025 | Mar–Oct 2026 | None | Exploratory | Very incomplete India 2026 observations; separate legal phases |

## Why separate the recent tariffs?
- The White House announced reciprocal duties on **April 2, 2025**; the initial order is not a correct description of all 2025–26 effective tariffs.
- A February 20, 2026 Supreme Court ruling invalidated use of IEEPA for those tariffs. A new Section 122 temporary regime followed, expiring July 24, 2026; subsequent Section 301 and Section 232 actions were used. Refer to the October 8, 2026 Congressional Research Service report for a dated summary.
- If actual tariff exposure data are available, split into effective-policy subperiods; do not impute one national tariff to every manufacturing division. The event window alone can support **observed timing comparison**, not tariff causal attribution.

## What to show for each event
- Observed `mean_shock_yoy - mean_baseline_yoy` in **percentage points**, worst observed YoY, fraction of negative-growth months, cross-country divergence, and uncertainty/data completeness indicators.
- For COVID, show 2020 trough and rebound separately if there is monthly coverage; never infer return of output **levels** from India's YoY-only series.
- For 2018 and 2025–26 tariffs, include observed USITC trade or tariff exposure when verified. Otherwise title the results 'industry performance during tariff period', not 'tariff impact'.
- For the supply crisis, optionally plot the NY Fed GSCPI alongside industrial YoY growth, with clearly independent scales and a non-causal label.

## Current 2026 data cut-off
- The study is prepared **20 November 2026**. Eurostat's overall monthly industrial database currently extends into 2026, but that does not mean all German industry groups have the same last month. India's existing 2011-base structured source has historically been available through March 2026; verify any extension. US observations may have different vintages.
- Any 2026 result is `provisional` until the specific three-country industry series is available with the required observed months.
- Never fill missing months or extrapolate beyond observed data. Show sample size, first/last valid observation and vintage in the UI.

## Research references
- WHO COVID dates: https://www.who.int/europe/emergencies/situations/covid-19/
- USITC retrospective tariffs: https://www.usitc.gov/press_room/news_release/2023/er0315_63679.htm
- White House 2025 order: https://www.whitehouse.gov/presidential-actions/2025/04/regulating-imports-with-a-reciprocal-tariff-to-rectify-trade-practices-that-contribute-to-large-and-persistent-annual-united-states-goods-trade-deficits/
- CRS 2026 legal changes: https://www.everycrsreport.com/reports/R49481.html
- NY Fed supply chain index: https://www.newyorkfed.org/research/policy/gscpi
