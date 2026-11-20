# Interpretation audit

The original 2022 India motor-vehicle case uses February 2021 through January 2022 as its baseline. India enters as published year-over-year growth in percent. The US rate uses Federal Reserve NSA index levels divided by the level in the same month a year earlier. No second growth conversion was applied to India.

The India republication reports April 2021 growth of 14,500%. It lifts the 12-month baseline mean to 1,237.35%. Omitting that month as a sensitivity check yields 31.65% over the remaining 11 months. The recorded India shift was −1,216.27 percentage points, versus −21.21 in the US, producing the published −1,195.06 percentage-point gap. These are differences in growth rates. The result is unusually sensitive to the baseline and should not be used as a headline measure of exposure.

The initial government release reports an index of 0.7 in April 2020 and 103.6 in April 2021. The rounded initial values imply roughly 14,700% growth and corroborate the scale of the low-base effect. The third-party republication reports 14,500% for its vintage. The two figures differ and this audit does not independently establish the revised numerator. The government cautioned that the April indexes were not strictly comparable because many establishments reported no production during lockdown. [Official release](https://www.pib.gov.in/PressReleasePage.aspx?PRID=1726259&lang=2&reg=48) · [India republication](https://measure.thisindianlife.today/data/iip-industries-2011.json)

The original calculations are preserved. The Overview uses complete, interpretable discoveries, and the industry ranking chart separates cases with absolute monthly rates of 1,000% or more. This is a display rule, not a change to the data, ranks, or model fit. The expanded 2022 study uses its originally configured pre-pandemic 2019 baseline.

The scatterplot reconstructs the first two coordinates from the same standardized five features and checks variance and loadings against the stored PCA output. It joins coordinates to the existing K-Means assignments by country, industry and event. The fit groups 148 cases together and puts the two extreme India motor-vehicle profiles in separate singleton groups. The visualization identifies their data sensitivity and does not treat the three groups as stable risk categories.

Reproduce the coordinate export from the repository root with `python research_expansion/scripts/export_profile_coordinates.py` using the research dependencies.
