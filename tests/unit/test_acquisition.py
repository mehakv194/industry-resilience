"""Acquisition boundary checks using explicitly synthetic test data."""

import hashlib
import io
import json
import zipfile
from pathlib import Path
from typing import Any
from unittest.mock import Mock
from urllib.error import HTTPError, URLError

import pytest

from industry_resilience.ingestion import http
from industry_resilience.ingestion.http import AcquisitionError, Download
from industry_resilience.ingestion.storage import save_original, write_new
from industry_resilience.validation.world_bank import (
    check_csv_spot_values,
    parse_envelope,
    validate_indicator,
    validate_observations,
)

URL = "https://api.worldbank.org/v2/test"


def test_validation_keeps_missing_values(wdi_payload: list[Any]) -> None:
    summary, rows = validate_observations(json.dumps(wdi_payload).encode())
    assert summary["row_count"] == 7
    assert summary["countries"]["IND"]["null"] == 1
    assert rows[-1]["value"] is None


@pytest.mark.parametrize("value", [True, "1.25", float("nan"), float("inf"), [], {}])
def test_invalid_values_rejected(wdi_payload: list[Any], value: Any) -> None:
    wdi_payload[1][0]["value"] = value
    with pytest.raises(AcquisitionError):
        validate_observations(json.dumps(wdi_payload).encode())


@pytest.mark.parametrize(
    "field,value",
    [
        ("countryiso3code", "GBR"),
        ("date", "2022Q1"),
        ("date", "２０２２"),
        ("date", "2999"),
        ("indicator", {"id": "OTHER"}),
    ],
)
def test_wrong_series_or_period_rejected(wdi_payload: list[Any], field: str, value: Any) -> None:
    wdi_payload[1][0][field] = value
    with pytest.raises(AcquisitionError):
        validate_observations(json.dumps(wdi_payload).encode())


def test_missing_value_field_is_not_treated_as_null(wdi_payload: list[Any]) -> None:
    del wdi_payload[1][0]["value"]
    with pytest.raises(AcquisitionError):
        validate_observations(json.dumps(wdi_payload).encode())


def test_duplicate_rejected(wdi_payload: list[Any]) -> None:
    wdi_payload[1].append(wdi_payload[1][0])
    wdi_payload[0]["total"] += 1
    with pytest.raises(AcquisitionError, match="Duplicate"):
        validate_observations(json.dumps(wdi_payload).encode())


@pytest.mark.parametrize("body", [b"<html>denied</html>", b"[]", b'{"message":"error"}'])
def test_invalid_envelope(body: bytes) -> None:
    with pytest.raises(AcquisitionError):
        parse_envelope(body)


def test_partial_page_rejected(wdi_payload: list[Any]) -> None:
    wdi_payload[0]["pages"] = 2
    with pytest.raises(AcquisitionError, match="pagination"):
        validate_observations(json.dumps(wdi_payload).encode())


def test_metadata_identity(indicator_body: bytes) -> None:
    assert validate_indicator(indicator_body)["source"]["id"] == "2"
    payload = json.loads(indicator_body)
    payload[1][0]["source"]["id"] = "99"
    with pytest.raises(AcquisitionError):
        validate_indicator(json.dumps(payload).encode())


def test_csv_crosscheck(wdi_payload: list[Any], csv_zip: bytes) -> None:
    _, rows = validate_observations(json.dumps(wdi_payload).encode())
    assert len(check_csv_spot_values(csv_zip, rows)) == 6
    rows[0]["value"] = 9.0
    with pytest.raises(AcquisitionError, match="mismatch"):
        check_csv_spot_values(csv_zip, rows)


def test_bad_zip_rejected(wdi_payload: list[Any]) -> None:
    with pytest.raises(AcquisitionError, match="CSV"):
        check_csv_spot_values(b"not a zip", wdi_payload[1])


def test_duplicate_csv_country_rejected(wdi_payload: list[Any], csv_zip: bytes) -> None:
    with zipfile.ZipFile(io.BytesIO(csv_zip)) as original:
        name = original.namelist()[0]
        text = original.read(name)
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as duplicate:
        duplicate.writestr(name, text + text.splitlines(keepends=True)[2])
    with pytest.raises(AcquisitionError, match="Duplicate CSV country"):
        check_csv_spot_values(buffer.getvalue(), wdi_payload[1])


def test_original_integrity_and_no_overwrite(tmp_path: Path) -> None:
    download = Download(
        b"synthetic test bytes", URL, URL, "2025-01-01T00:00:00Z", "text/plain", None, None
    )
    metadata = save_original(tmp_path, download, "txt")
    assert metadata["sha256"] == hashlib.sha256(download.body).hexdigest()
    assert save_original(tmp_path, download, "txt") == metadata
    raw = tmp_path / metadata["path"]
    with pytest.raises(FileExistsError):
        write_new(raw, b"replacement")
    assert raw.read_bytes() == download.body
    raw.write_bytes(b"simulated external corruption")
    with pytest.raises(AcquisitionError, match="integrity"):
        save_original(tmp_path, download, "txt")


@pytest.mark.parametrize(
    "url",
    [
        "http://api.worldbank.org/x",
        "https://example.com/x",
        "https://api.worldbank.org:444/x",
        "https://user:secret@api.worldbank.org/x",
    ],
)
def test_url_restrictions(url: str) -> None:
    with pytest.raises(AcquisitionError):
        http.check_url(url, ("api.worldbank.org",))


def test_redirect_is_checked_before_following() -> None:
    redirects = http.OfficialRedirects(("api.worldbank.org",))
    with pytest.raises(AcquisitionError):
        redirects.redirect_request(None, None, 302, "redirect", {}, "https://example.com/")


def test_timeout_and_retry(monkeypatch: pytest.MonkeyPatch) -> None:
    response = Mock()
    response.__enter__ = Mock(return_value=response)
    response.__exit__ = Mock(return_value=False)
    response.read.return_value = b"synthetic test response"
    response.url = URL
    response.headers = {"Content-Type": "application/json"}
    opener = Mock()
    opener.open.side_effect = [URLError("synthetic failure"), response]
    monkeypatch.setattr(http, "build_opener", lambda *args: opener)
    sleeper = Mock()
    monkeypatch.setattr(http.time, "sleep", sleeper)
    assert http.fetch(URL, ("api.worldbank.org",)).body == b"synthetic test response"
    assert opener.open.call_args.kwargs["timeout"] == 30
    sleeper.assert_called_once_with(1.0)


@pytest.mark.parametrize("code,attempts", [(403, 1), (404, 1), (503, 3), (429, 3)])
def test_http_failures_are_bounded(
    monkeypatch: pytest.MonkeyPatch, code: int, attempts: int
) -> None:
    opener = Mock()
    opener.open.side_effect = [
        HTTPError(URL, code, "synthetic error", {}, io.BytesIO()) for _ in range(attempts)
    ]
    monkeypatch.setattr(http, "build_opener", lambda *args: opener)
    monkeypatch.setattr(http.time, "sleep", Mock())
    with pytest.raises(AcquisitionError, match=f"HTTP {code}"):
        http.fetch(URL, ("api.worldbank.org",))
    assert opener.open.call_count == attempts


def test_long_retry_after_stops(monkeypatch: pytest.MonkeyPatch) -> None:
    opener = Mock()
    opener.open.side_effect = HTTPError(
        URL, 429, "synthetic error", {"Retry-After": "120"}, io.BytesIO()
    )
    monkeypatch.setattr(http, "build_opener", lambda *args: opener)
    sleeper = Mock()
    monkeypatch.setattr(http.time, "sleep", sleeper)
    with pytest.raises(AcquisitionError, match="retry manually later"):
        http.fetch(URL, ("api.worldbank.org",))
    sleeper.assert_not_called()
