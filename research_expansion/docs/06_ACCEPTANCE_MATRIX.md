# Fast acceptance checklist

## Inventory and data
- [ ] Existing Python, Phase 4 and React are unchanged unless extension essential; compare actual diff.
- [ ] Live source URLs/columns/units inspected once; no invented values.
- [ ] 30 expected country-industry combinations evaluated; unavailable ones explicitly flagged.
- [ ] 7 event windows configured plus 1 separate AI structural transition; at most 210 target event-case rows, only source-backed actual observed cases; each row has 6+ real monthly observations in baseline AND shock.
- [ ] Source provenance, vintage, unit and classification grade recorded.
- [ ] India rate is not differenced again; US and DE index levels converted to YoY correctly.

## Science and computation
- [ ] Flagship event-study notebook produces auditable delta_pp and counts.
- [ ] Exploratory dynamic-response notebook succeeds or is clearly marked skipped with rationale.
- [ ] Eight model notebooks contain real code and either generated observed outputs or report `skipped`; list exactly what executed.
- [ ] PCA/K-Means use standardized observed shock features; no invented cluster interpretations.
- [ ] KNN/RF/Logit do not use any shock or post-shock features in X, and CV groups by country–industry.
- [ ] Apriori rules give support/confidence/lift and warn sample size; Isolation Forest flags descriptive outliers.
- [ ] No terms 'causal', 'future-risk %', 'survival probability' without justified identification/validation.

## UI and release
- [ ] Existing homepage, case study, calculator routes still work.
- [ ] Germany and expanded sectors appear only if present in coverage manifest.
- [ ] New event choices and separate AI evidence section in existing 'Methods / Research' section shows genuine model status and observed findings; no filler scores.
- [ ] Only essential smoke tests: data schema/units assertion, one independently recalculated case, notebook run status, React production build and two navigation/filter checks.
- [ ] Publish real output file paths, exact result counts and limitations. Keep a record of model failures instead of deleting them.
