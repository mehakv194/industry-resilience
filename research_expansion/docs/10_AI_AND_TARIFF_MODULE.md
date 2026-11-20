# AI and tariff exposure: two separate analytical modules

## A. AI is **not** a single dated economic shock
**Window:** 2023–2026 AI acceleration, interpreted against 2021–2022 where suitable; annual evidence, no fixed end or recovery. Do NOT put `ai_diffusion` into `event_windows.csv` or run the normal shock resilience computation on it. It is a parallel evidence explorer.

### Credible questions
1. Which sectors have the greatest documented AI adoption or industrial automation uptake?
2. Does observed automation adoption co-move with output growth or industry labor productivity, **where compatible longitudinal measures exist**?
3. Are AI investment and electrical equipment / machinery production changing together, without attributing that change solely to AI?

### Real source options
- Eurostat survey (`isoc_eb_ai` and `isoc_eb_ain2`), annual adoption and some manufacturing breakdowns: https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Use_of_artificial_intelligence_in_enterprises
- European Commission JRC strategic-sector adoption trends 2021–2025: https://joint-research-centre.ec.europa.eu/jrc-news-and-updates/ai-adoption-more-doubles-almost-every-eu-strategic-sector-2026-10-14_en
- Stanford 2026 AI Index economic investment series, mostly broader geographic levels: https://hai.stanford.edu/ai-index/2026-ai-index-report/economy
- IFR robot installations, India/USA/Germany country data; detailed cross-sector records may not be openly downloadable: https://ifr.org/ifr-press-releases/news/global-robot-demand-in-factories-doubles-over-10-years
- IEA AI-energy report provides global data center demand context (forecasts are **not observed industrial output**): https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary

### Data contract
Optional `data/processed/ai_indicators.csv`:
`year,country,industry_code,indicator_id,value,unit,source_url,definition,geography_level`
- `industry_code` may be blank for country-level measurements. Do **not** distribute country-level AI investment over ten industries.
- Only compare same `indicator_id` and compatible `definition`, `unit`, `geography_level` and source methodology.
- Report coverage and missingness first. `status=unavailable` is allowed. No invented country rankings or productivity causality.
- First notebook target: descriptive adoption trends / differences; a correlation with output requires at least several genuinely repeated comparable observations and strong caveats.

## B. Tariff *exposure* is different from production change during tariff window
- Production growth during 2018, 2025 or 2026 alone cannot tell which industry faced higher duties.
- For US import exposure use observed USITC monthly trade imports and customs duties, by product / partner / month, with verified HTS→industry mapping. Some tariff data may require interactive export; do not assume a free automated endpoint exists.
- Form an exploratory `effective_duty_pct = 100 * duties_collected_usd / import_value_usd` only where numerator/denominator refer to the **same goods, country and window**. This is a collected effective-duty measure, not a statutory rate or causal effect.
- Optional `data/processed/tariff_exposure.csv`: `month,country,industry_code,import_value_usd,duties_collected_usd,source_url,classification_method`.
- Do not apply US importer tariff rates to Indian/German domestic production as if those manufacturers directly paid them; analyze market exposure, export dependency and trade diversion separately.
- Explain trade policy timeline breaks in February and July 2026; legal regime changes mean the raw 2025 policy should not be forward-filled across 2026.

## UI additions — minimal light mode updates
- Case Studies event selector gets historical/secondary/provisional grouped labels, so past complete windows and emerging events do not look equally mature.
- The same 10 industries × 3 countries are available **only where observed coverage exists**.
- Add one `AI & Automation` contextual research panel linked from Case Studies; show actual annual indicators when available, otherwise a compact no-data panel with sources.
- Add `Trade & Tariff Exposure` optional secondary metric for 2018 and 2025/26 only when verified data is ingested.
- Preserve existing white background/navy teal coral, previous findings and three routes. No new website, no fabricated risk score.
