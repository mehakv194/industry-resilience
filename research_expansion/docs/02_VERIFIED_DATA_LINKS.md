# Data sources and access links — checked for discovery, not full download validation

## Mandatory monthly industrial series

### India — MoSPI via structured republication
- Original official catalogue: https://esankhyiki.mospi.gov.in/catalogue-main/catalogue
- MoSPI IIP metadata: https://nmds.mospi.gov.in/
- Usable structured monthly 23-division JSON: https://measure.thisindianlife.today/data/iip-industries-2011.json
- Series inventory: https://measure.thisindianlife.today/data/iip-industries-2011/
- Data vintage stated 2026-10-09, periods through March 2026; 23 industry series contain *published YoY percent changes* from April 2013 onward.
- This is a **third-party republishing** of government statistics. Cite MoSPI as underlying publisher AND Measure of India as the compiling website. Cross-check one or two selected observations against official MoSPI monthly table before shipping.

### United States — Federal Reserve ISIC4 industrial production
- Official download and descriptions: https://www.federalreserve.gov/releases/g17/download.htm
- ISIC Rev. 4 seasonally adjusted file: https://www.federalreserve.gov/releases/g17/related_data/ip_sa_isic4.xlsx
- ISIC Rev. 4 not-seasonally-adjusted file: https://www.federalreserve.gov/releases/g17/related_data/ip_nsa_isic4.xlsx
- The Fed explicitly identifies these as ISIC Rev. 4 series supplied for UN statistical purposes. **Audit workbook sheets/series IDs/units and historical coverage before extracting divisions 10, 13, 20, 21, 22, 24, 25, 27, 28, 29**.
- Alternative series finder: https://fred.stlouisfed.org/ ; G.17 NAICS series are a fallback only with explicit concordance mapping.
- Verify Excel sheet structure before choosing index columns. No assumption all 10 series exist.

### Germany — Eurostat monthly industrial production
- Primary dataset `sts_inpr_m`: https://ec.europa.eu/eurostat/databrowser/view/sts_inpr_m/default/table?lang=en
- API documentation: https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started/api
- API base: https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sts_inpr_m
- Suggested FILTERS (verify dimension code/values in live metadata): `geo=DE`, `freq=M`, `indic_bt=PRD`, `nace_r2=C10` (change division), `unit=I21` (2021=100), `s_adj=SCA` or `CA` (verify), `sinceTimePeriod=2013-01`.
- Germany and ISIC share related classification system but not identical survey methodology. The dataset's overall coverage extending back to 1953 DOES NOT imply every selected German NACE series is present back to 2013.

## Macroeconomic event signals
- Brent crude monthly: https://fred.stlouisfed.org/series/MCOILBRENTEU ; CSV example https://fred.stlouisfed.org/graph/fredgraph.csv?id=MCOILBRENTEU
- World Bank commodity markets Pink Sheet (Brent, European natural gas, coal, fertilizers): https://www.worldbank.org/en/research/commodity-markets
- 2022 case narrative: https://www.worldbank.org/en/news/press-release/2022/04/26/food-and-energy-price-shocks-from-ukraine-war
- 2014 event: identify energy price declines using observed Brent curve; treat July 2014–Feb 2016 as a chosen study window, not a causal clean experiment.
- If German gas is used, record currency/units and do not merge raw $/mmbtu with raw oil $/barrel. Use standardized percent changes or individual explanatory covariates.

## Stretch sources — after core pipeline works
- UNIDO INDSTAT and monthly IIP, source https://stat.unido.org/data/download — employment and value-added enrichments only after date and detail validation; different frequencies.
- OECD 2026 ICIO: https://www.oecd.org/en/data/datasets/inter-country-input-output-tables.html — sector-network exposure, annual large files; optional only, not a seven-hour requirement.
- Harvard Atlas data: https://atlas.hks.harvard.edu/data-downloads/ — trade dependence and classification methodology, not a monthly IIP replacement.
- RBI KLEMS: https://www.rbi.org.in/Scripts/KLEMS.aspx — annual structural input factors for India, do not merge as though monthly.

## Source manifest required
For each `country × industry` record exact URL, source name, raw unit, adjusted status, start/end, last nonmissing date, valid observation count, checked vintage, match grade (`exact`, `approximate`, `unavailable`), and failed-download reason. Generate `reports/research/coverage.json` automatically from observed rows.

## Operational fallback
If a particular US ISIC series or Germany API subseries cannot be fetched, keep the industry as `unavailable` and finish the app/other cases. Never invent matching data. Report 30 target industry-country panels and actual confirmed number.

## Added 2018–2026 events and AI sources
See `config/new_sources.csv` and `docs/10_AI_AND_TARIFF_MODULE.md` for USITC, WHO, NY Fed GSCPI, CRS, Eurostat/JRC AI, Stanford AI Index and IFR robot links. These are source discovery URLs; not all are one-click unrestricted programmatic raw data downloads. Preserve the source method and avoid claiming downloaded observations until verified.
