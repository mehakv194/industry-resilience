# Data Source Registry

Audit date: 2 November 2026. Machine-readable counterpart: [source_registry.json](../../data/metadata/source_registry.json).

Only WDI GDP growth was acquired and structurally validated. All comparisons remain pending. Unknown coverage, units, identifiers and terms are explicitly null in the manifest rather than guessed. Project source IDs are internal keys, not official table codes.

Statuses: `acquired_and_validated` = local raw bytes plus provenance and structural checks; `documentation_verified` = official documentation inspected, selected files not acquired; `candidate_unverified` = access or exact series unresolved.

## Inventory

| Project source ID | Official dataset | Countries | Frequency | Status |
|---|---|---|---|---|
| `WB_WDI_GDP_GROWTH` | [GDP growth (annual %)](https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG) | IND, USA | annual; original year labels retained | acquired_and_validated |
| `MOSPI_GVA_2022_23` | [New GDP/GVA series release, 27 February 2026](https://www.mospi.gov.in/uploads/latestReleases/latest_release_1772189865181_f040336d-bc57-4aed-b80f-586d9ccb279e_Press_Note_on_New_Series_of_GDP_Estimates_with_Base_Year_2022-23_27022026.pdf) | IND | annual fiscal year; quarterly tables also in release | documentation_verified |
| `MOSPI_NAS_2011_12_ARCHIVE` | [National Accounts Statistics 2025 release (archived base)](https://www.mospi.gov.in/sites/default/files/press_release/Press%20Release%20on%20National%20Accounts%20Statistics%20Publication%20-%202025.pdf) | IND | annual fiscal year | documentation_verified |
| `MOSPI_IIP_2011_12` | [Index of Industrial Production, base 2011-12](https://microdata.gov.in/NADA/index.php/catalog/148) | IND | monthly | documentation_verified |
| `MOSPI_PLFS` | [Periodic Labour Force Survey](https://microdata.gov.in/nada/index.php/catalog/PLFS?page=1) | IND | annual; quarterly/monthly designs differ | documentation_verified |
| `RBI_DBIE_FINANCIAL` | [DBIE macro-financial series discovery](https://data.rbi.org.in/) | IND | depends on selected series | candidate_unverified |
| `OEA_WPI` | [Wholesale Price Index discovery](https://eaindustry.nic.in/) | IND | unverified | candidate_unverified |
| `BEA_INDUSTRY_VALUE_ADDED` | [GDP by Industry: real value added and industry shares](https://www.bea.gov/itable/gdp-by-industry) | USA | annual and quarterly, select explicitly | documentation_verified |
| `BLS_CES_MANUFACTURING` | [CES manufacturing employment](https://data.bls.gov/timeseries/CES3000000001) | USA | monthly, seasonally adjusted | documentation_verified |
| `FED_G17` | [Industrial production and capacity utilization](https://www.federalreserve.gov/releases/g17/) | USA | monthly | documentation_verified |
| `FED_H15` | [Selected interest rates](https://www.federalreserve.gov/releases/h15/) | USA | daily; frequency-specific aggregates available | documentation_verified |
| `FED_H8` | [Assets and liabilities of commercial banks](https://www.federalreserve.gov/releases/h8/) | USA | weekly release | documentation_verified |
| `WB_CPI` | [Inflation, consumer prices (annual %)](https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG) | IND, USA | annual | documentation_verified |
| `WB_EXPORT_GROWTH` | [Exports of goods and services (annual % growth)](https://data.worldbank.org/indicator/NE.EXP.GNFS.KD.ZG) | IND, USA | annual | documentation_verified |
| `WB_TRADE_SHARE` | [Trade (% of GDP)](https://data.worldbank.org/indicator/NE.TRD.GNFS.ZS) | IND, USA | annual | documentation_verified |
| `WB_EXCHANGE_RATE` | [Official exchange rate (LCU per US$, period average)](https://data.worldbank.org/indicator/PA.NUS.FCRF) | IND, USA | annual | documentation_verified |
| `EIA_BRENT` | [Europe Brent spot price FOB](https://www.eia.gov/dnav/pet/hist/RBRTED.htm) | international_benchmark | daily; weekly/monthly/annual views available | documentation_verified |
| `EIA_HENRY_HUB` | [Henry Hub natural gas spot price](https://www.eia.gov/dnav/ng/hist/rngwhhdm.htm) | USA | monthly | documentation_verified |

## Dataset contracts

### WB_WDI_GDP_GROWTH

Publisher: World Bank — World Development Indicators. Official source: [GDP growth (annual %)](https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG).

- Table/series: NY.GDP.MKTP.KD.ZG; WDI source 2
- Original units: annual percent change
- Industry coverage: whole economy, not industry output
- Earliest/latest: 1961 / 2025. 65 non-null values and one null (1960) per country, from the saved JSON response.
- Price basis/base year: real GDP growth; exact upstream definition retained in acquisition receipt / Metadata describes underlying constant-price series with reference year 2015; country vintage history remains unverified..
- Formats/mechanism: JSON, CSV in ZIP. Implemented CLI: python -m industry_resilience.cli acquire-world-bank-gdp
- Release/vintage: WDI dataset lastupdated: 2026-10-08; not a per-observation vintage
- Access: No API key; three official API requests successfully acquired.
- Reuse: CC BY 4.0 as stated on indicator page; attribute World Bank and upstream providers.
- Limitations: Country period boundaries and national revisions need separate review. WDI can contain staff estimates; reported observations are not necessarily final releases. CSV agreement checks the same upstream source, not independent statistical truth.

Evidence: [official reference 1](https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG), [official reference 2](https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures).

### MOSPI_GVA_2022_23

Publisher: MoSPI / National Statistics Office. Official source: [New GDP/GVA series release, 27 February 2026](https://www.mospi.gov.in/uploads/latestReleases/latest_release_1772189865181_f040336d-bc57-4aed-b80f-586d9ccb279e_Press_Note_on_New_Series_of_GDP_Estimates_with_Base_Year_2022-23_27022026.pdf).

- Table/series: Part A, Statement 3A (annual GVA at constant prices); select revised Part B tables separately
- Original units: INR crore (levels); percent (growth)
- Industry coverage: broad economic activities; classification reconciliation pending
- Earliest/latest: FY2022-23 / FY2025-26. Bounds refer to this release, not the complete history; advance/revised status varies by year.
- Price basis/base year: constant prices for Statement 3A; current-price tables must remain separate / 2022-23.
- Formats/mechanism: PDF. Manual original PDF download; no automated parser implemented
- Release/vintage: 27 February 2026, includes advance and revised estimates; not asserted latest release
- Access: Official release text inspected via web; file not acquired locally.
- Reuse: Not yet verified; do not redistribute selected data before review.
- Limitations: Does not supply a validated 2008/2013 back-series. Do not splice with 2011-12-base series.

Evidence: [official reference 1](https://www.mospi.gov.in/uploads/latestReleases/latest_release_1772189865181_f040336d-bc57-4aed-b80f-586d9ccb279e_Press_Note_on_New_Series_of_GDP_Estimates_with_Base_Year_2022-23_27022026.pdf), [official reference 2](https://mospi.gov.in/faq).

### MOSPI_NAS_2011_12_ARCHIVE

Publisher: MoSPI / National Statistics Office. Official source: [National Accounts Statistics 2025 release (archived base)](https://www.mospi.gov.in/sites/default/files/press_release/Press%20Release%20on%20National%20Accounts%20Statistics%20Publication%20-%202025.pdf).

- Table/series: National Accounts Statistics 2025 release; detailed GVA table selection pending
- Original units: Unverified; inspect selected export.
- Industry coverage: No industry selection verified.
- Earliest/latest: FY2011-12 / FY2023-24. Release describes history from FY2011-12 and revisions through FY2023-24; exact GVA extract not acquired.
- Price basis/base year: constant and current tables, to be selected separately / 2011-12.
- Formats/mechanism: PDF. Manual release and linked NAS statement download
- Release/vintage: 2025 publication, historical vintage
- Access: Public source page; selected download not tested.
- Reuse: Not yet verified; do not redistribute selected data before review.
- Limitations: Table identifier, units and available sector rows still need file audit. 2008 coverage requires an official older/back-series.

Evidence: [official reference 1](https://www.mospi.gov.in/sites/default/files/press_release/Press%20Release%20on%20National%20Accounts%20Statistics%20Publication%20-%202025.pdf).

### MOSPI_IIP_2011_12

Publisher: MoSPI / NSO. Official source: [Index of Industrial Production, base 2011-12](https://microdata.gov.in/NADA/index.php/catalog/148).

- Table/series: Official catalogue 148: IIP with base year 2011-12
- Original units: index, 2011-12 = 100
- Industry coverage: mining, manufacturing, electricity; NIC 2008
- Earliest/latest: FY2011-12 / unverified. Official metadata describes history from FY2011-12; latest selected observation not checked.
- Price basis/base year: volume index, not value added / 2011-12.
- Formats/mechanism: catalogue metadata, release tables. Manual catalogue/release export; audit exact file before parsing
- Release/vintage: Not verified for a selected extract.
- Access: Public source page; selected download not tested.
- Reuse: Not yet verified; do not redistribute selected data before review.
- Limitations: Rebased vintages and weights cannot be silently linked. Not a service-sector output measure.

Evidence: [official reference 1](https://microdata.gov.in/NADA/index.php/catalog/148), [official reference 2](https://nmds.mospi.gov.in/).

### MOSPI_PLFS

Publisher: MoSPI / NSO. Official source: [Periodic Labour Force Survey](https://microdata.gov.in/nada/index.php/catalog/PLFS?page=1).

- Table/series: PLFS collection; specific historical industry table not selected
- Original units: Unverified; inspect selected export.
- Industry coverage: household employment by industry where published; not establishment payroll counts
- Earliest/latest: 2017-18 / unverified. Survey programme begins 2017-18; selected industry-series bounds unverified.
- Price basis/base year: unverified/not yet selected / unverified or not applicable; do not infer a base.
- Formats/mechanism: report tables, unit records subject to access terms. Manual survey report selection
- Release/vintage: Not verified for a selected extract.
- Access: Public source page; selected download not tested.
- Reuse: Not yet verified; do not redistribute selected data before review.
- Limitations: Cannot fill 2008/2013 industry employment gaps with PLFS. 2025 redesign and survey status definitions require review.

Evidence: [official reference 1](https://microdata.gov.in/nada/index.php/catalog/PLFS?page=1), [official reference 2](https://dsbb.imf.org/sdds/dqaf-base/country/IND/category/UEM00).

### RBI_DBIE_FINANCIAL

Publisher: Reserve Bank of India. Official source: [DBIE macro-financial series discovery](https://data.rbi.org.in/).

- Table/series: Unverified; no identifier assumed.
- Original units: Unverified; inspect selected export.
- Industry coverage: No industry selection verified.
- Earliest/latest: unverified / unverified. Selected-country coverage has not been audited.
- Price basis/base year: unverified/not yet selected / unverified or not applicable; do not infer a base.
- Formats/mechanism: interactive portal. Interactive DBIE export; no verified public API assumed
- Release/vintage: Not verified for a selected extract.
- Access: Public source page; selected download not tested.
- Reuse: Not yet verified; do not redistribute selected data before review.
- Limitations: JavaScript portal returned no readable series metadata in this audit. Repo/policy rates, bank credit growth and exchange-rate table IDs, units and history remain unverified.

Evidence: [official reference 1](https://data.rbi.org.in/).

### OEA_WPI

Publisher: Office of Economic Adviser, DPIIT. Official source: [Wholesale Price Index discovery](https://eaindustry.nic.in/).

- Table/series: Unverified; no identifier assumed.
- Original units: Unverified; inspect selected export.
- Industry coverage: No industry selection verified.
- Earliest/latest: unverified / unverified. Selected-country coverage has not been audited.
- Price basis/base year: unverified/not yet selected / unverified or not applicable; do not infer a base.
- Formats/mechanism: unverified. Manual official release/export after accessibility and metadata review
- Release/vintage: Not verified for a selected extract.
- Access: Public source page; selected download not tested.
- Reuse: Not yet verified; do not redistribute selected data before review.
- Limitations: Official portal timed out during this audit; no file or coverage is approved. WPI measures wholesale prices and is not IIP or CPI.

Evidence: [official reference 1](https://eaindustry.nic.in/).

### BEA_INDUSTRY_VALUE_ADDED

Publisher: US Bureau of Economic Analysis. Official source: [GDP by Industry: real value added and industry shares](https://www.bea.gov/itable/gdp-by-industry).

- Table/series: Real Value Added by Industry; Value Added by Industry as a Percentage of GDP (verified titles; numeric API TableIDs not selected)
- Original units: chained dollars (scale/reference year to verify in export); percent for current-dollar GDP shares
- Industry coverage: BEA industry groups; concordance required
- Earliest/latest: unverified / unverified. Selected-country coverage has not been audited.
- Price basis/base year: real chained measures; GDP shares are current-dollar measures / unverified or not applicable; do not infer a base.
- Formats/mechanism: interactive tables, download export. Manual iTable export; API requires separate key/parameter audit
- Release/vintage: Landing page shows 30 September 2026 release; no selected data extract acquired
- Access: Public source page; selected download not tested.
- Reuse: Not yet verified; do not redistribute selected data before review.
- Limitations: Chained-dollar components generally are not additive. Do not confuse industry GDP share with real growth or growth contribution. Historical quarterly corrections noted in 2026 update; preserve vintage.

Evidence: [official reference 1](https://www.bea.gov/itable/gdp-by-industry), [official reference 2](https://www.bea.gov/resources/guide-interactive-gdp-industry-accounts-tables).

### BLS_CES_MANUFACTURING

Publisher: US Bureau of Labor Statistics. Official source: [CES manufacturing employment](https://data.bls.gov/timeseries/CES3000000001).

- Table/series: CES3000000001
- Original units: thousands of employees
- Industry coverage: manufacturing aggregate
- Earliest/latest: unverified / unverified. Selected-country coverage has not been audited.
- Price basis/base year: not applicable / unverified or not applicable; do not infer a base.
- Formats/mechanism: series report download, JSON API. Manual series report; API documented but not implemented here
- Release/vintage: Not verified for a selected extract.
- Access: Public source page; selected download not tested.
- Reuse: Not yet verified; do not redistribute selected data before review.
- Limitations: Counts payroll jobs, not the same universe as PLFS employed persons. Series bounds and historical revision status not audited.

Evidence: [official reference 1](https://data.bls.gov/timeseries/CES3000000001), [official reference 2](https://www.bls.gov/developers/api_signature_v2.htm).

### FED_G17

Publisher: Board of Governors of the Federal Reserve System. Official source: [Industrial production and capacity utilization](https://www.federalreserve.gov/releases/g17/).

- Table/series: G.17
- Original units: index/reference base must be verified in chosen series
- Industry coverage: No industry selection verified.
- Earliest/latest: unverified / unverified. Selected-country coverage has not been audited.
- Price basis/base year: unverified/not yet selected / unverified or not applicable; do not infer a base.
- Formats/mechanism: release tables, data download. Manual release Data Download / text files; exact series not yet selected
- Release/vintage: Not verified for a selected extract.
- Access: Public source page; selected download not tested.
- Reuse: Not yet verified; do not redistribute selected data before review.
- Limitations: Coverage and seasonal adjustment differ from Indian IIP. Download programme transition announced for November 2026; recheck links before implementing.

Evidence: [official reference 1](https://www.federalreserve.gov/releases/g17/).

### FED_H15

Publisher: Board of Governors of the Federal Reserve System. Official source: [Selected interest rates](https://www.federalreserve.gov/releases/h15/).

- Table/series: H.15
- Original units: percent per annum
- Industry coverage: No industry selection verified.
- Earliest/latest: unverified / unverified. Selected-country coverage has not been audited.
- Price basis/base year: unverified/not yet selected / unverified or not applicable; do not infer a base.
- Formats/mechanism: release tables, data download. Manual release Data Download / text files; exact series not yet selected
- Release/vintage: Not verified for a selected extract.
- Access: Public source page; selected download not tested.
- Reuse: Not yet verified; do not redistribute selected data before review.
- Limitations: Effective rate is not the same construct as a policy target; lending rates differ. Download programme transition announced for November 2026; recheck links before implementing.

Evidence: [official reference 1](https://www.federalreserve.gov/releases/h15/).

### FED_H8

Publisher: Board of Governors of the Federal Reserve System. Official source: [Assets and liabilities of commercial banks](https://www.federalreserve.gov/releases/h8/).

- Table/series: H.8
- Original units: Unverified; inspect selected export.
- Industry coverage: No industry selection verified.
- Earliest/latest: unverified / unverified. Selected-country coverage has not been audited.
- Price basis/base year: unverified/not yet selected / unverified or not applicable; do not infer a base.
- Formats/mechanism: release tables, data download. Manual release Data Download / text files; exact series not yet selected
- Release/vintage: Not verified for a selected extract.
- Access: Public source page; selected download not tested.
- Reuse: Not yet verified; do not redistribute selected data before review.
- Limitations: Select bank credit definition, adjustments and units before computing growth. Download programme transition announced for November 2026; recheck links before implementing.

Evidence: [official reference 1](https://www.federalreserve.gov/releases/h8/).

### WB_CPI

Publisher: World Bank — World Development Indicators. Official source: [Inflation, consumer prices (annual %)](https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG).

- Table/series: FP.CPI.TOTL.ZG
- Original units: annual percent change
- Industry coverage: whole economy
- Earliest/latest: unverified / unverified. Selected-country coverage has not been audited.
- Price basis/base year: consumer price change / unverified or not applicable; do not infer a base.
- Formats/mechanism: CSV, XML, Excel. Official indicator page download; selected-country API acquisition not implemented for this indicator
- Release/vintage: Not verified for a selected extract.
- Access: Public source page; selected download not tested.
- Reuse: CC BY 4.0 shown on indicator page; retain upstream attribution
- Limitations: Indicator documentation verified, but India/USA non-null period coverage has not been checked. National macro proxy, not a measurement of an individual industry exposure.

Evidence: [official reference 1](https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG).

### WB_EXPORT_GROWTH

Publisher: World Bank — World Development Indicators. Official source: [Exports of goods and services (annual % growth)](https://data.worldbank.org/indicator/NE.EXP.GNFS.KD.ZG).

- Table/series: NE.EXP.GNFS.KD.ZG
- Original units: annual percent change
- Industry coverage: whole economy
- Earliest/latest: unverified / unverified. Selected-country coverage has not been audited.
- Price basis/base year: real export growth / unverified or not applicable; do not infer a base.
- Formats/mechanism: CSV, XML, Excel. Official indicator page download; selected-country API acquisition not implemented for this indicator
- Release/vintage: Not verified for a selected extract.
- Access: Public source page; selected download not tested.
- Reuse: CC BY 4.0 shown on indicator page; retain upstream attribution
- Limitations: Indicator documentation verified, but India/USA non-null period coverage has not been checked. National macro proxy, not a measurement of an individual industry exposure.

Evidence: [official reference 1](https://data.worldbank.org/indicator/NE.EXP.GNFS.KD.ZG).

### WB_TRADE_SHARE

Publisher: World Bank — World Development Indicators. Official source: [Trade (% of GDP)](https://data.worldbank.org/indicator/NE.TRD.GNFS.ZS).

- Table/series: NE.TRD.GNFS.ZS
- Original units: percent of GDP
- Industry coverage: whole economy
- Earliest/latest: unverified / unverified. Selected-country coverage has not been audited.
- Price basis/base year: current-price ratio; not export growth / unverified or not applicable; do not infer a base.
- Formats/mechanism: CSV, XML, Excel. Official indicator page download; selected-country API acquisition not implemented for this indicator
- Release/vintage: Not verified for a selected extract.
- Access: Public source page; selected download not tested.
- Reuse: CC BY 4.0 shown on indicator page; retain upstream attribution
- Limitations: Indicator documentation verified, but India/USA non-null period coverage has not been checked. National macro proxy, not a measurement of an individual industry exposure.

Evidence: [official reference 1](https://data.worldbank.org/indicator/NE.TRD.GNFS.ZS).

### WB_EXCHANGE_RATE

Publisher: World Bank — World Development Indicators. Official source: [Official exchange rate (LCU per US$, period average)](https://data.worldbank.org/indicator/PA.NUS.FCRF).

- Table/series: PA.NUS.FCRF
- Original units: local currency units per USD
- Industry coverage: whole economy
- Earliest/latest: unverified / unverified. Selected-country coverage has not been audited.
- Price basis/base year: nominal period-average exchange rate / unverified or not applicable; do not infer a base.
- Formats/mechanism: CSV, XML, Excel. Official indicator page download; selected-country API acquisition not implemented for this indicator
- Release/vintage: Not verified for a selected extract.
- Access: Public source page; selected download not tested.
- Reuse: CC BY 4.0 shown on indicator page; retain upstream attribution
- Limitations: Indicator documentation verified, but India/USA non-null period coverage has not been checked. National macro proxy, not a measurement of an individual industry exposure.

Evidence: [official reference 1](https://data.worldbank.org/indicator/PA.NUS.FCRF).

### EIA_BRENT

Publisher: US Energy Information Administration. Official source: [Europe Brent spot price FOB](https://www.eia.gov/dnav/pet/hist/RBRTED.htm).

- Table/series: RBRTE daily history page
- Original units: USD per barrel
- Industry coverage: commodity benchmark, not an industry outcome
- Earliest/latest: 1987-05-20 / unverified. First daily observation displayed; latest selected file period not audited.
- Price basis/base year: nominal spot price / unverified or not applicable; do not infer a base.
- Formats/mechanism: HTML, XLS. Manual Download Data link on official history page
- Release/vintage: Not verified for a selected extract.
- Access: Public source page; selected download not tested.
- Reuse: EIA public data may be reused with attribution; check protected third-party exceptions.
- Limitations: Brent is not a country-specific landed energy cost or firm energy exposure.

Evidence: [official reference 1](https://www.eia.gov/dnav/pet/hist/RBRTED.htm), [official reference 2](https://www.eia.gov/about/copyrights_reuse.php).

### EIA_HENRY_HUB

Publisher: US Energy Information Administration. Official source: [Henry Hub natural gas spot price](https://www.eia.gov/dnav/ng/hist/rngwhhdm.htm).

- Table/series: RNGWHHD monthly history page
- Original units: USD per million Btu
- Industry coverage: commodity benchmark, not an industry outcome
- Earliest/latest: 1997-01 / 2026-09. Displayed monthly history inspected; file not acquired.
- Price basis/base year: nominal spot price / unverified or not applicable; do not infer a base.
- Formats/mechanism: HTML, XLS. Manual XLS: https://www.eia.gov/dnav/ng/hist_xls/RNGWHHDm.xls
- Release/vintage: History page release date 28 October 2026
- Access: Public source page; selected download not tested.
- Reuse: EIA public data may be reused with attribution; check protected third-party exceptions.
- Limitations: US gas hub is not an Indian LNG import price; geographic basis risk remains.

Evidence: [official reference 1](https://www.eia.gov/dnav/ng/hist/rngwhhdm.htm), [official reference 2](https://www.eia.gov/about/copyrights_reuse.php).

## Decisions

The first extract is a macroeconomic acquisition demonstration, not the country-industry panel anticipated by the broader roadmap. The current Phase 01 prompt explicitly permits GDP growth as the initial dataset; two audited country-industry extracts remain outstanding before industry analysis.

MoSPI is the publisher of all-India IIP; OEA WPI is a wholesale-price measure and must not be labelled industrial production. RBI remains a source-discovery task because exact DBIE exports were not exposed to this audit. No unverified API is invented.

Three shock years per country were checked against the official WDI CSV export. This is a six-observation format check of the same upstream dataset, not an independent validation of national statistics. The [acquisition report](../../reports/acquisition/world_bank_gdp_20261102T130604691809Z.md) records actual rows and coverage.

For nonimplemented sources follow [manual acquisition](MANUAL_ACQUISITION.md); no source is analysis-ready solely because its landing page exists.
