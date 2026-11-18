"""Command-line access to implemented research workflows."""

import argparse
import json
import logging
from pathlib import Path

from industry_resilience.ingestion.http import AcquisitionError
from industry_resilience.ingestion.world_bank import acquire_gdp, verify_snapshot


def main() -> None:
    """Acquire official WDI GDP growth; leave later-phase commands unimplemented."""
    parser = argparse.ArgumentParser(description="IndustryResilience acquisition")
    parser.add_argument("command", choices=["acquire-world-bank-gdp", "verify-world-bank-gdp"])
    parser.add_argument(
        "receipt", type=Path, nargs="?", help="Receipt path for offline verification"
    )
    parser.add_argument("--root", type=Path, default=Path.cwd(), help="Repository/output root")
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    try:
        if args.command == "verify-world-bank-gdp":
            if args.receipt is None:
                parser.error("verify-world-bank-gdp requires a receipt path")
            print(json.dumps(verify_snapshot(args.root, args.receipt), indent=2))
        else:
            if args.receipt is not None:
                parser.error("acquire-world-bank-gdp does not accept a receipt path")
            report = acquire_gdp(args.root)
            print(report.read_text(encoding="utf-8"))
    except (AcquisitionError, OSError) as exc:
        parser.exit(1, f"Acquisition failed: {exc}\n")


if __name__ == "__main__":
    main()
