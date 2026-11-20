# Stretch research model — critical industry nodes and propagation risk

**Only attempt after the 10 standard notebooks actually run on observed industry data.** This is not part of MVP acceptance.

## Literature
- Acemoglu, Carvalho, Ozdaglar, Tahbaz-Salehi (2012), *The Network Origins of Aggregate Fluctuations*, Econometrica, https://doi.org/10.3982/ECTA9623.
- OECD Inter-Country Input-Output (ICIO) 2026, https://www.oecd.org/en/data/datasets/inter-country-input-output-tables.html.
- OECD 2025 domestic Input-Output Tables provide Leontief inverse matrices: https://www.oecd.org/en/data/datasets/input-output-tables.html.

## Question
Which sectors occupy *structurally important positions* in production networks, potentially transmitting upstream input-cost disturbances to multiple downstream industries? This is an industry-network version of 'finding important nodes'.

## Proposed method
Use a verified input-output transactions table with a clear year and country, and source-specific sector definitions. Let `Z[i,j]` be the monetary value of supplier sector i's output used by customer sector j; let `x[j]` be total production of j. Compute technical coefficients `A[i,j]=Z[i,j]/x[j]` (only if x[j] > 0) and the Leontief matrix `L=(I-A)^{-1}` when invertible. Compare direct and indirect production requirements using row/column sums and supplier centrality. Highlight sectors with high upstream reach and identify input-intensive downstream sector dependencies.

## Critical limitations
- OECD ICIO sectors will often NOT match the ten two-digit ISIC divisions one-for-one. Aggregate to common level; never pretend fine-grained industry centrality is observed where it is not.
- Static input-output multipliers assume fixed coefficients; they are neither measured losses nor accurate real-time crisis forecasts.
- 2014/2022 matrices may be from different structural years; record the vintage and use a consistent year for comparisons where possible.
- A sector with high centrality does not automatically have high measured shock vulnerability.

## Suggested optional notebook
`11_network_exposure.ipynb` only after OECD input-output tables are downloaded and a verified, sector-matched transactions matrix exists. Report network matrix dimensions, year, spectral/invertibility checks, centrality rankings and citation. Do NOT invent network edges or 'critical nodes'.
