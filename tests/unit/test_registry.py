"""Check source-discovery contracts without downloading candidate datasets."""

import json
from pathlib import Path
from urllib.parse import urlsplit


def test_machine_readable_registry() -> None:
    root = Path(__file__).resolve().parents[2]
    registry = json.loads((root / "data/metadata/source_registry.json").read_text(encoding="utf-8"))
    required = {
        "source_id",
        "dataset_name",
        "publisher",
        "exact_source_url",
        "publication_or_table_id",
        "original_units",
        "frequency",
        "countries",
        "industry_coverage",
        "earliest_available_period",
        "latest_available_period",
        "coverage_evidence",
        "price_basis",
        "base_year",
        "formats",
        "acquisition_mechanism",
        "release_or_vintage",
        "access_conditions",
        "reuse_conditions",
        "verification_status",
        "verification_date",
        "comparability_status",
        "known_limitations",
        "evidence_urls",
        "manual_procedure",
    }
    seen = set()
    for source in registry["sources"]:
        assert required <= source.keys()
        assert source["source_id"] not in seen
        seen.add(source["source_id"])
        assert urlsplit(source["exact_source_url"]).scheme == "https"
        assert source["verification_status"] in {
            "acquired_and_validated",
            "documentation_verified",
            "candidate_unverified",
        }
        assert source["comparability_status"] == "pending"
        if source["verification_status"] == "acquired_and_validated":
            assert source["source_id"] == "WB_WDI_GDP_GROWTH"
            assert (root / source["acquisition_receipt"]).is_file()
