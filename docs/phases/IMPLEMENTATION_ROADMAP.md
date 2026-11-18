# Codex-First Phase Roadmap

Each phase ends with a verifiable artifact and small reviewed PR; no phase should claim unimplemented modules are complete.

| Phase | Scope | Evidence of completion | Suggested branch |
|---|---|---|---|
| 00 — Foundation | repo, uv, configs, AGENTS.md, CI, empty-state app, DuckDB check, docs | clean install, tests/CI pass, app loads with no invented results | `feat/phase-00-foundation` |
| 01 — Sources | source audit, exact official tables/IDs, download and manifest, integrity checks | two real country-industry source extracts, hashes and audited metadata | `feat/phase-01-sources` |
| 02 — Harmonization | sector crosswalks, base-year/period logic, data quality | explicit approved/excluded comparisons, validation report | `feat/phase-02-harmonization` |
| 03 — Warehouse | DuckDB star schema, loaders, source lineage, OLAP SQL | warehouse build reproducible and constrained; documented SQL outputs | `feat/phase-03-warehouse` |
| 04 — Analysis | growth, trend deviation, contraction, recovery and cross-event matrices | tested formulas, traceable metrics, two manually verified examples | `feat/phase-04-analysis` |
| 05 — Mining | EDA, clustering, association rules, limited ML and WEKA if valid | honest validation and sample-size discussion | `feat/phase-05-mining` |
| 06 — Dashboard | five Streamlit pages, Plotly plots, explanations, source labels | no fabricated figures, responsive navigation, screenshot QA | `feat/phase-06-dashboard` |
| 07 — Publication | PDF report, issue/PR evidence, reproducibility, deployment | fresh-clone build, verified statements, public release | `feat/phase-07-release` |

## Phase 00 instructions for Codex
Start by reading `PROJECT_SPEC.md`, `docs/architecture/ARCHITECTURE.md`, `docs/TECH_STACK.md`, `docs/data/OFFICIAL_SOURCES.md`, `docs/delivery/DELIVERABLES.md` and this roadmap. Check for existing files and preserve them. Create `AGENTS.md` reflecting the research integrity and module boundaries. Initialize the target structure in incremental commits, install dependencies, run tests and create a working empty-state app plus database health check. **Do not download or fabricate economic data, build a completed model, claim observed findings, or proceed to Phase 01 automatically.**

## Prior scaffold note
The earlier repository starter describes a COVID-first MVP. This roadmap and `PROJECT_SPEC.md` now supersede that scope. Phase 00 must reconcile the root README, existing `app.py`, package naming and tests with these revised specifications before future analytical work.
