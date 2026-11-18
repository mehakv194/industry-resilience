"""Offline end-to-end acquisition tests; all injected records are synthetic."""

import hashlib
import json
from pathlib import Path
from typing import Any

import pytest

from industry_resilience.ingestion import world_bank
from industry_resilience.ingestion.http import AcquisitionError, Download


def test_acquisition_pipeline(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    wdi_payload: list[Any],
    indicator_body: bytes,
    csv_zip: bytes,
) -> None:
    bodies = {
        world_bank.DATA_URL: json.dumps(wdi_payload).encode(),
        world_bank.INDICATOR_URL: indicator_body,
        world_bank.CSV_URL: csv_zip,
    }

    def fake_fetch(url: str, allowed_hosts: tuple[str, ...]) -> Download:
        assert allowed_hosts == ("api.worldbank.org",)
        return Download(bodies[url], url, url, "2025-01-01T00:00:00Z", "test/synthetic", None, None)

    monkeypatch.setattr(world_bank, "fetch", fake_fetch)
    report = world_bank.acquire_gdp(tmp_path)
    assert report.exists()
    receipts = list(tmp_path.glob("data/metadata/acquisitions/world_bank_gdp/*.json"))
    receipt = json.loads(receipts[0].read_text(encoding="utf-8"))
    assert receipt["validation_status"] == "passed_structure_and_csv_spot_checks"
    assert receipt["comparability_status"] == "pending"
    assert len(receipt["spot_checks"]) == 6
    assert world_bank.verify_snapshot(tmp_path, receipts[0])["row_count"] == 7
    for evidence in receipt["files"].values():
        raw = (tmp_path / evidence["path"]).read_bytes()
        assert hashlib.sha256(raw).hexdigest() == evidence["sha256"]
        assert raw == bodies[evidence["requested_url"]]
    world_bank.acquire_gdp(tmp_path)
    assert len(list(tmp_path.glob("data/raw/world_bank_gdp/*"))) == 3
    assert len(list(tmp_path.glob("data/metadata/acquisitions/world_bank_gdp/*.json"))) == 2
    raw_path = tmp_path / receipt["files"]["observations"]["path"]
    raw_path.write_bytes(b"synthetic tampering")
    with pytest.raises(AcquisitionError, match="integrity"):
        world_bank.verify_snapshot(tmp_path, receipts[0])


def test_acquisition_failure_preserves_evidence(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    def fake_fetch(url: str, allowed_hosts: tuple[str, ...]) -> Download:
        return Download(
            b"synthetic invalid JSON", url, url, "2025-01-01T00:00:00Z", "text/plain", None, None
        )

    monkeypatch.setattr(world_bank, "fetch", fake_fetch)
    with pytest.raises(AcquisitionError):
        world_bank.acquire_gdp(tmp_path)
    receipt_path = next(tmp_path.glob("data/metadata/acquisitions/world_bank_gdp/*.json"))
    receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
    assert receipt["validation_status"] == "failed"
    assert "error" in receipt
    assert receipt["files"]
    assert not list(tmp_path.glob("reports/acquisition/*.md"))
