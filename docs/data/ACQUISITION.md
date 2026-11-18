# Official acquisition workflow

From the repository root, install with `uv sync --locked` and run:

```sh
uv run python -m industry_resilience.cli acquire-world-bank-gdp
```

`--root <directory>` selects an explicit output root. No credentials are needed. The command supports exactly WDI `NY.GDP.MKTP.KD.ZG` for India and the United States. Do not change the indicator constant to collect an unrelated series: its schema and units need a dedicated reviewed adapter contract.

The adapter uses the official HTTPS API for country observations, the indicator definition, and the official CSV ZIP export. It makes requests sequentially with a 30-second socket timeout, at most three attempts, exponential backoff and bounded handling of `Retry-After`. HTTP 401/403 and other permanent errors are not retried. A server-requested delay beyond 60 seconds stops the run for a later retry. The socket timeout is not a strict total wall-clock deadline. Bodies and uncompressed CSV members are limited to 10 MiB. Redirects must stay on the approved World Bank API host; TLS verification remains enabled.

The command preserves original response bytes before structural validation:

- `data/raw/world_bank_gdp/<sha256>.json` or `.zip`: exact originals, content-addressed; an identical response is reused only after integrity comparison.
- `data/metadata/acquisitions/world_bank_gdp/<UTC-run-id>.json`: exclusive per-run provenance, URLs, retrieval UTC, HTTP metadata where provided, byte lengths, checksums, upstream definition, dataset update date and validation status.
- `reports/acquisition/world_bank_gdp_<UTC-run-id>.md`: successful coverage report and six published values checked against the CSV export.

Failures produce a receipt with an error and any originals retrieved so far. A failure to write even the receipt (for example, disk permissions) remains a command error. Files are never intentionally overwritten. Keep raw data and its receipt together when archiving or sharing the exact snapshot; receipts alone cannot reconstruct a superseded upstream vintage. Raw inputs remain Git-ignored. Only the small metadata/report evidence is intended for version control, subject to review; no release upload occurs automatically.

Validation checks the complete single-page JSON envelope, exact source/indicator/countries, annual year labels, unique country-year keys, finite numbers or explicit nulls, nonempty country coverage, indicator definitions, and six JSON/CSV values in 2008, 2013 and 2022. If the source starts paginating or its structure changes, the command fails rather than publishing an incomplete result. Nulls are not imputed. Values are not transformed or rounded in the originals. The global CSV ZIP is retained solely as the official cross-check export; the demonstrated JSON panel is limited to the two countries.

Matching JSON and CSV tests two official delivery formats of the same upstream statistics, not independent national estimates. The WDI update date describes the dataset, not an observation-specific release. Comparability remains `pending` even after structural validation passes. No analytical table is loaded, no shock is assigned to rows, and the dashboard remains an empty state.

## Verification

```sh
uv run pytest
uv run ruff check .
uv run ruff format --check .
uv run mypy
```

Tests exercise the pipeline without live network calls using clearly synthetic fixtures inside `tests/`. The live CLI acquisition is a separate, explicit integration demonstration. To recheck an existing real snapshot without downloading again, run:

```sh
uv run python -m industry_resilience.cli verify-world-bank-gdp data/metadata/acquisitions/world_bank_gdp/<run-id>.json
```

Source discovery and manual procedures are in the [registry](DATA_SOURCE_REGISTRY.md) and [manual acquisition guide](MANUAL_ACQUISITION.md).
