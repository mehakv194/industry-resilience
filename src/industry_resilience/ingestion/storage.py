"""Immutable, content-addressed originals and exclusive acquisition receipts."""

import hashlib
import json
from dataclasses import asdict
from pathlib import Path
from typing import Any

from industry_resilience.ingestion.http import AcquisitionError, Download


def write_new(path: Path, content: bytes) -> None:
    """Write a new file without replacing an existing one."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("xb") as stream:
        try:
            stream.write(content)
        except BaseException:
            stream.close()
            path.unlink()
            raise


def save_original(root: Path, download: Download, suffix: str) -> dict[str, Any]:
    """Preserve exact bytes; identical content is reused after integrity checking."""
    digest = hashlib.sha256(download.body).hexdigest()
    relative_path = Path("data/raw/world_bank_gdp") / f"{digest}.{suffix}"
    path = root / relative_path
    try:
        write_new(path, download.body)
    except FileExistsError:
        if path.read_bytes() != download.body:
            raise AcquisitionError(f"Existing raw file failed integrity check: {path}") from None
    metadata = asdict(download)
    del metadata["body"]
    return {
        **metadata,
        "path": relative_path.as_posix(),
        "sha256": digest,
        "bytes": len(download.body),
    }


def write_json(path: Path, data: dict[str, Any]) -> None:
    """Write a human-readable JSON receipt without replacing previous evidence."""
    write_new(path, (json.dumps(data, indent=2, ensure_ascii=False) + "\n").encode("utf-8"))
