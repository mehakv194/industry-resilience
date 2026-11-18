# Phase 00 decisions

- The canonical project specification supersedes the COVID-first starter described in the roadmap; no starter files were present in this workspace.
- The warehouse utility opens an empty DuckDB database; dimensional entities remain a design, not premature tables. See `ARCHITECTURE.md` for proposed grain and lineage.
- Crisis dates and windows are provisional metadata, not observations or causal claims. The ongoing 2026 event has no inferred end or recovery.
- The dashboard uses a single navigation shell and honest empty states until verified outputs exist.

## Phase 01 additions

- ADR-006: use bounded standard-library HTTPS acquisition and a source-specific WDI adapter. Preserve original bytes under SHA-256 paths and create exclusive per-run receipts; structural validation does not approve comparability.
- ADR-007: repository configuration is loaded from the working directory (or an explicit caller-supplied directory), supporting both editable and noneditable installations. Commands are documented from the repository root.
