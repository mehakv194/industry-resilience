# Scope, countries, industries and shocks

## Countries
- India (`IND`): MoSPI NIC 2008 (based on ISIC Rev. 4), industrial production, underlying publisher MoSPI.
- United States (`USA`): Federal Reserve G.17 **ISIC Rev. 4** monthly workbook is preferred to manually summing NAICS series. Inspect workbook before committing to this route.
- Germany (`DEU`): Eurostat `sts_inpr_m`, `geo=DE`, `nace_r2=C10` etc. NACE Rev. 2 aligns closely to ISIC Rev. 4 at two-digit manufacturing level but the exact coverage and methodology require notes.

## Ten target ISIC Rev.4 divisions
| ISIC | Industry | India NIC | Germany NACE Rev.2 | Main hypothesis |
|---|---|---|---|---|
| 10 | Food products | 10 | C10 | Essential demand, food input costs |
| 13 | Textiles | 13 | C13 | Labor and export demand |
| 20 | Chemicals | 20 | C20 | Energy/feedstock sensitivity |
| 21 | Pharmaceuticals | 21 | C21 | Specialized demand / distinct supply chains |
| 22 | Rubber and plastics | 22 | C22 | Petroleum-derived intermediates |
| 24 | Basic metals | 24 | C24 | Energy/commodity intensity |
| 25 | Fabricated metal products | 25 | C25 | Industrial downstream demand |
| 27 | Electrical equipment | 27 | C27 | Capital goods demand |
| 28 | Machinery and equipment n.e.c. | 28 | C28 | Industrial capital investment |
| 29 | Motor vehicles | 29 | C29 | Credit, energy, supply-chain exposure |

US: use exact ISIC division ID in Fed workbook if genuinely present. Otherwise document an appropriate NAICS aggregation; do not conflate motor vehicles (NAICS 3361) with ISIC division 29 when a broader group is needed.

## Primary / expanded study windows
- Oil price collapse: baseline `2013-01..2014-06`; shock `2014-07..2016-02`; follow-up `2016-03..2017-12`.
- 2022 energy surge: reference baseline `2019-01..2019-12` (pre-COVID) and sensitivity alternative `2021-07..2022-01` (COVID-rebound distorted); shock `2022-02..2022-12`; follow-up `2023-01..2024-12`.
- Historical analysis `2013-01..2025-12`, with provisional observation windows through `2026-10` where confirmed actual data exist and NEVER assumed present in every source.
- COVID may be a confounding/intervening episode. Exclude it from sensitive estimation windows or report sensitivity.

For additional windows (2018–19 trade conflict, 2020 COVID, 2021 supply chain, 2025 tariffs, 2026 revised tariffs) see `docs/09_EXPANDED_EVENT_TIMELINES.md` and the authoritative `config/event_windows.csv`. AI 2023–26 is separate structural context, not a shock. Current 2026 coverage is provisional.

## Comparability gates
1. All country datasets must be transformed to the **same measured unit**: monthly **year-over-year production growth in percent**, using 12-month lagged index values for source series in levels.
2. Do not compare raw index levels across countries (their base-year indexes are not comparable scales).
3. Do not transform India's YoY growth series as if it were a level: an additional percent-change operation is WRONG.
4. Do not claim recovered output *level* from the India YoY-only source. Use 'growth normalization' or obtain official level data separately.
5. Distinguish raw monthly index from seasonally adjusted index. For aligned YoY, prefer unadjusted/calendar-adjusted consistently where possible, and record the method.
6. Preserve missing values. Do not pad future months, fill missing country-industry data with zero or interpolate event periods without explicit provenance.
7. Document vintage, country coverage, series selection and classification mapping. Verify Germany 2014 and 2022 coverage per NACE division.
