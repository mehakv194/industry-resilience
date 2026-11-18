# Data Comparability Audit

Audit date: 2 November 2026. This is a metadata and acquisition audit, not completed harmonization or economic analysis. The [source registry](DATA_SOURCE_REGISTRY.md) distinguishes inspected documentation from locally acquired files.

## What the acquired extract establishes

WDI indicator `NY.GDP.MKTP.KD.ZG` contains 65 non-null annual GDP-growth values per country, labelled 1961–2025, plus a null 1960 record for each. JSON identity, uniqueness, finite/null values and completeness pass; six values agree with the official CSV export. The [receipt](../../data/metadata/acquisitions/world_bank_gdp/20261102T130604691809Z.json) records exact bytes, URLs and dataset update date. No 2026 annual observation is present in that response.

This supports a reproducible acquisition demonstration. It does not establish an industry panel, validate each national statistical estimate, or approve cross-country shock alignment. World Bank metadata includes upstream national/OECD sources and staff estimates. A published value must not automatically be called final or directly observed. The API's dataset update date is not the vintage of every country-year observation. See the [indicator definition](https://api.worldbank.org/v2/indicator/NY.GDP.MKTP.KD.ZG?format=json).

## Compatibility decisions

| Pair or use | Current decision | Conditions before analysis |
|---|---|---|
| WDI GDP-growth records within the preserved snapshot | Structurally usable as reported metadata/values | Retain country, original year label, update date, indicator definition and snapshot hash; no event attribution yet |
| India versus USA annual GDP growth | Requires transformation/review | Verify the national reporting boundaries behind each WDI year label; do not assume both represent January–December |
| India 2011–12-base GVA versus 2022–23-base GVA | Keep separate | Require official comparable back-series and reconciliation of definitions, sectors and revisions |
| MoSPI industry real GVA versus BEA industry real value added | Pending | Map industry boundaries, valuation conventions and time periods; compare compatible growth/index measures rather than unmatched currency levels |
| IIP versus Federal Reserve industrial production | Pending | Match covered industries, weights, seasonal adjustment, base revisions and monthly boundaries; neither is economy-wide GVA |
| PLFS employed persons versus BLS CES payroll employment | Keep separate as direct levels | Household versus establishment universe, self-employment, multiple jobs and coverage differ; narrower comparable changes need explicit justification |
| CPI inflation versus WPI inflation | Keep separate | Different price baskets and transaction stages; neither can replace a real-output deflator without evidence |
| Trade/GDP versus real export growth | Keep separate | Ratio of nominal flows and GDP versus growth in real exports; national aggregates do not measure sector export dependence |
| Brent/Henry Hub versus industry energy exposure | Context variables only | Match local landed prices, taxes, exchange rates and industry input shares; Henry Hub is a US gas benchmark |
| RBI policy rates versus US effective funds or lending rates | Requires definition review | Distinguish administered target, effective overnight rate, market yield and bank lending rate |
| Raw bank-credit levels across countries | Pending | Match institutional perimeter, sector, seasonal/break adjustments, currency units and revision vintage before deriving growth |

## India's base-year and historical coverage problem

MoSPI's [27 February 2026 release](https://www.mospi.gov.in/uploads/latestReleases/latest_release_1772189865181_f040336d-bc57-4aed-b80f-586d9ccb279e_Press_Note_on_New_Series_of_GDP_Estimates_with_Base_Year_2022-23_27022026.pdf) provides the new 2022–23-base series and revised/advance estimates. The [official FAQ](https://mospi.gov.in/faq) describes a back-series expected by December 2026. An announced release is not an available, validated back-series as of this audit.

Therefore the new release cannot by itself supply compatible 2008 and 2013 industry histories. Preserve the archived 2011–12-base publication and investigate the older official back-series separately. A rescaled index does not cure changed coverage or methodology. Overlapping periods in two bases are useful for auditing differences, not permission to splice them. The acquired WDI series is retained exactly as published; its historical country-level rebasing lineage remains unresolved.

## Time, frequency and classification

India fiscal years run April–March; US annual national accounts use calendar years. Source labels must retain explicit start/end dates only after the publisher's convention is verified. Do not attach an instantaneous event date to every annual observation. Annual data cannot reliably identify a recovery month or isolate the 2013 taper episode. Quarterly annualized rates, year-on-year growth and annual percent change are distinct measures. Monthly-to-annual aggregation depends on whether a measure is a flow, stock, index or rate.

The [IIP metadata](https://nmds.mospi.gov.in/) describes mining, manufacturing and electricity under NIC 2008 for the inspected base. The broad `configs/industries.yaml` labels are project concepts, not a completed NIC–NAICS concordance. Future mappings need versioned source codes, exclusions and mapping quality. Do not infer equivalence from similar names.

## Real versus nominal and industry contributions

[BEA's guide](https://www.bea.gov/resources/guide-interactive-gdp-industry-accounts-tables) distinguishes real value added, chain-type indexes, current-dollar industry shares and contributions to growth. Chained-dollar industry components generally cannot be summed as ordinary additive amounts. GDP at market prices and GVA at basic prices also need valuation reconciliation. Currency conversion alone does not produce comparable real industry levels. Growth, contribution in percentage points and share in percent must retain distinct indicator IDs and units.

## Employment and revision gaps

PLFS began in 2017–18; the [official dissemination metadata](https://dsbb.imf.org/sdds/dqaf-base/country/IND/category/UEM00) also describes earlier NSS rounds. It does not establish a continuous comparable industry-employment series across 2008, 2013 and later shocks. Report unavailable employment coverage rather than interpolating survey rounds. Review the later survey redesign before linking vintages. [BLS manufacturing CES](https://data.bls.gov/timeseries/CES3000000001) is seasonally adjusted payroll employment, not the same population as a household employment survey.

Keep original releases, hashes and revision statuses. The [BEA interactive landing page](https://www.bea.gov/itable/gdp-by-industry) flags historical quarterly corrections in its 2026 update. A latest download is a revised-history dataset, not necessarily information available during the original crisis. Preserve nulls and distinguish no observation, suppressed value, provisional estimate and unavailable industry coverage.

## Ongoing events and phase gate

No 2026 event dates, onset mechanisms or recovery outcomes were verified by this data acquisition. Keep its incomplete metadata explicit. Do not infer causality from a contemporaneous price movement. A missing post-trough crossing is an unobserved or right-censored recovery, never a fabricated recovered/not-recovered measurement.

Before Phase 02 is authorized, the remaining acquisition priorities are exact MoSPI/BEA industry extracts, their reuse terms, country-specific period definitions, and historical compatibility evidence. This phase implements no concordance, resampling, warehouse loading or economic metrics.
