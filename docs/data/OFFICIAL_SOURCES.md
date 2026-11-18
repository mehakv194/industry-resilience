# Official Source Registry and Acquisition Specification

**Status:** This is the original acquisition specification. Phase 01 evidence is recorded in [DATA_SOURCE_REGISTRY.md](DATA_SOURCE_REGISTRY.md): WDI GDP growth has been acquired and structurally checked; other source contracts distinguish verified documentation from unverified candidates. Industry compatibility remains pending. This specification alone does not approve a dataset.

## Primary official sources
| Code | Institution | Coverage / intended indicators | Official entry point | Verification needed |
|---|---|---|---|---|
| MOSPI | Ministry of Statistics & Programme Implementation, India | real sector GVA, GDP, national accounts; possibly industrial production and labor publications | https://mospi.gov.in/ | select series/table, base year, vintage, frequency; identify historical back-series |
| RBI | Reserve Bank of India, DBIE | inflation, interest/credit, exchange rates and macro financial series | https://data.rbi.org.in/ | exact series identifiers, source periods and downloads |
| BEA | US Bureau of Economic Analysis | GDP by industry, real value added, compensation, other industry output | https://www.bea.gov/data/gdp/gdp-industry | real-series tables, frequency, definitions, chain-type nonadditivity |
| BEA_API | BEA official API | programmatic GDPByIndustry data | https://apps.bea.gov/api/signup/ | API key, endpoint, parameter and quota policy |
| BLS | US Bureau of Labor Statistics | historical industry employment and labor measures | https://www.bls.gov/ | appropriate *historical* employment series, not projections |
| WB | World Bank WDI | standardized macro indicator checks for India/US | https://api.worldbank.org/v2/ | indicator metadata, unit, missing coverage, statistical source |

## Potential event-specific government/official sources (not preapproved datasets)
- Indian fertilizer: Department of Fertilizers and relevant Ministry publications (verify series).
- Indian food prices: Ministry of Consumer Affairs / MoSPI CPI releases (verify market-price and CPI distinction).
- Oil and natural gas: official energy statistics and recognized intergovernmental datasets, subject to source licensing and coverage checks.
- Shipping/freight: Indian port statistics and corresponding official US freight/port data where definitional compatibility permits.

## Source-selection protocol
1. State the indicator's exact definition and research purpose.
2. Identify the *original* issuing agency; do not use Kaggle or third-party mirrors as data sources.
3. Record dataset name, table/series ID, frequency, vintage, first/last available observation, download URL, retrieval UTC, format, checksum, unit, base year, and redistribution terms.
4. Inspect at least three observations against the published table, including one shock-period value.
5. Assign comparability status: `approved`, `approved_with_caveats`, `not_comparable`, or `pending`.
6. Do not claim the source is analysis-ready until parsing, units, mapping, fiscal/calendar and revision checks pass.
7. Preserve originals; transformations must be reproducible without manually editing source files.

## Sample metadata contract (`data/metadata/sources.csv`)
`source_id,publisher,country,dataset,table_or_series,official_url,retrieved_at_utc,vintage,frequency,units,price_basis,base_year,start_period,end_period,sha256,redistribution_status,comparability_status,notes`

## Priority by analysis phase
1. **First:** country-industry real GVA / value added: MoSPI + BEA.
2. **Second:** macro factors: RBI + World Bank (and direct USA sources where needed).
3. **Third:** comparable employment / output series: respective statistical agencies.
4. **Fourth:** 2026 geopolitical chain: energy, fertilizer and food costs, only after proving exact usable series.

## Non-comparability traps
- Indian national accounts include series revisions and base-year transitions; 2008, 2013 and 2022 must not be automatically spliced across bases.
- US BEA industry definitions are not identical to India's; maintain an explicitly versioned concordance with excluded categories.
- Some national data use fiscal rather than calendar years; event mapping must retain their reporting boundaries.
- GDP and GVA are conceptually related but not identical aggregates; compare industry real-value-added growth when possible.
- Correlations at short time lags may be spurious; seasonality, trends and common shocks require checks.
- Forecasts and current incomplete releases must be labeled separately from confirmed observations.

## Useful official documentation verified at drafting
- BEA GDP by Industry https://www.bea.gov/data/gdp/gdp-industry
- BEA API https://apps.bea.gov/api/signup/
- World Bank API docs https://datahelpdesk.worldbank.org/knowledgebase/articles/889392
- MoSPI national accounts methodology / data FAQs https://mospi.gov.in/faq
- RBI official data portal https://data.rbi.org.in/
- MoSPI 2004–05 to 2011–12 national accounts back-series press release https://www.mospi.gov.in/sites/default/files/press_release/Press-Note-28Nov2018.pdf

**No findings or data availability claims are implied by listing a source here.**
