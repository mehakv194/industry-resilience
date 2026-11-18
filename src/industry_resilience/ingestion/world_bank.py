"""Acquire and report a small official GDP-growth demonstration for India and the USA."""

import hashlib
import json
import logging
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from industry_resilience.ingestion.http import AcquisitionError, check_url, fetch
from industry_resilience.ingestion.storage import save_original, write_json, write_new
from industry_resilience.validation.world_bank import (
    check_csv_spot_values,
    validate_indicator,
    validate_observations,
)

LOGGER = logging.getLogger(__name__)
DATA_URL = (
    "https://api.worldbank.org/v2/country/IND;USA/indicator/NY.GDP.MKTP.KD.ZG"
    "?format=json&per_page=20000&source=2"
)
INDICATOR_URL = "https://api.worldbank.org/v2/indicator/NY.GDP.MKTP.KD.ZG?format=json"
CSV_URL = "https://api.worldbank.org/v2/en/indicator/NY.GDP.MKTP.KD.ZG?downloadformat=csv"


def verify_snapshot(root: Path, receipt_path: Path) -> dict[str, Any]:
    """Recheck local originals and recorded validation evidence without network access."""
    root = root.resolve()
    try:
        receipt = json.loads(receipt_path.read_bytes())
        if (
            receipt["source_id"] != "WB_WDI_GDP_GROWTH"
            or receipt["validation_status"] != "passed_structure_and_csv_spot_checks"
        ):
            raise AcquisitionError("Receipt does not identify a successfully validated acquisition")
        bodies = {}
        for name, expected_url in (
            ("observations", DATA_URL),
            ("indicator_metadata", INDICATOR_URL),
            ("csv_crosscheck", CSV_URL),
        ):
            evidence = receipt["files"][name]
            path = (root / evidence["path"]).resolve()
            if not path.is_relative_to(root) or evidence["requested_url"] != expected_url:
                raise AcquisitionError(
                    "Receipt path or requested source URL is outside the contract"
                )
            check_url(evidence["final_url"], ("api.worldbank.org",))
            body = path.read_bytes()
            if (
                hashlib.sha256(body).hexdigest() != evidence["sha256"]
                or len(body) != evidence["bytes"]
            ):
                raise AcquisitionError(f"Snapshot integrity check failed: {path}")
            bodies[name] = body
        metadata = validate_indicator(bodies["indicator_metadata"])
        summary, rows = validate_observations(bodies["observations"])
        checks = check_csv_spot_values(bodies["csv_crosscheck"], rows)
        if (
            summary != receipt["coverage"]
            or checks != receipt["spot_checks"]
            or metadata != receipt["indicator_metadata"]
        ):
            raise AcquisitionError("Recorded validation evidence differs from the raw snapshot")
        return summary
    except (KeyError, TypeError, ValueError) as exc:
        raise AcquisitionError(f"Invalid acquisition receipt: {receipt_path}") from exc


def acquire_gdp(root: Path) -> Path:
    """Preserve originals, validate them and write an immutable run receipt/report."""
    root = root.resolve()
    run_id = datetime.now(UTC).strftime("%Y%m%dT%H%M%S%fZ")
    receipt_path = root / "data/metadata/acquisitions/world_bank_gdp" / f"{run_id}.json"
    receipt: dict[str, Any] = {
        "source_id": "WB_WDI_GDP_GROWTH",
        "run_id": run_id,
        "publisher": "World Bank, World Development Indicators",
        "indicator_id": "NY.GDP.MKTP.KD.ZG",
        "units": "annual percent change",
        "frequency": "annual; original year labels retained",
        "price_basis": "real GDP growth; underlying definition retained in indicator metadata",
        "base_year": None,
        "redistribution_status": "CC BY 4.0; attribute World Bank and upstream providers",
        "license_url": "https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG",
        "comparability_status": "pending",
        "validation_status": "incomplete",
        "files": {},
    }
    try:
        downloads = {}
        for name, url, suffix in (
            ("observations", DATA_URL, "json"),
            ("indicator_metadata", INDICATOR_URL, "json"),
            ("csv_crosscheck", CSV_URL, "zip"),
        ):
            download = fetch(url, ("api.worldbank.org",))
            receipt["files"][name] = save_original(root, download, suffix)
            downloads[name] = download
        receipt["indicator_metadata"] = validate_indicator(downloads["indicator_metadata"].body)
        summary, rows = validate_observations(downloads["observations"].body)
        receipt["coverage"] = summary
        receipt["spot_checks"] = check_csv_spot_values(downloads["csv_crosscheck"].body, rows)
        receipt["validation_status"] = "passed_structure_and_csv_spot_checks"
    except (AcquisitionError, OSError) as exc:
        receipt["validation_status"] = "failed"
        receipt["error"] = str(exc)
        write_json(receipt_path, receipt)
        LOGGER.error("Acquisition failed; receipt: %s", receipt_path)
        raise
    write_json(receipt_path, receipt)
    report_path = root / "reports/acquisition" / f"world_bank_gdp_{run_id}.md"
    lines = [
        "# Official acquisition report: World Bank GDP growth",
        "",
        f"Run: `{run_id}`. Receipt: `{receipt_path.relative_to(root).as_posix()}`.",
        "",
        "Original JSON, indicator definition and CSV ZIP are preserved byte-for-byte.",
        "Validation passed identity, schema, finite/null values, uniqueness and pagination.",
        "Six shock-year observations agree with the official CSV export (same upstream source).",
        "This is an acquisition check, not an economic conclusion or harmonized industry panel.",
        "",
        "| Country | Non-null | Null | First observed | Last observed |",
        "|---|---:|---:|---|---|",
    ]
    for country, coverage in summary["countries"].items():
        lines.append(
            f"| {country} | {coverage['non_null']} | {coverage['null']} | "
            f"{coverage['first_observed_period']} | {coverage['last_observed_period']} |"
        )
    lines += [
        "",
        f"WDI dataset update date: `{summary['dataset_last_updated']}` (not a per-row vintage).",
        "",
        "| Country | Original year label | GDP growth (annual %) |",
        "|---|---|---:|",
    ]
    for check in receipt["spot_checks"]:
        lines.append(f"| {check['country']} | {check['period']} | {check['value']} |")
    lines += [
        "",
        "Comparability remains pending: annual labels do not establish fiscal/calendar alignment,",
        "country-specific base-year histories, or whether historical values were revised.",
        "Nulls remain missing; no interpolation, sector mapping or recovery calculation occurred.",
        "A future fetch can change: use the receipt hashes to identify this exact snapshot.",
        "",
        "Source: https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG",
        "License: CC BY 4.0; World Bank and the upstream providers named in saved metadata.",
    ]
    write_new(report_path, ("\n".join(lines) + "\n").encode("utf-8"))
    LOGGER.info("Acquisition report: %s", report_path)
    return report_path
