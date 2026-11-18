"""Load and check project metadata configuration."""

from datetime import date
from pathlib import Path
from typing import Any

import yaml

CONFIG_DIR = Path("configs")
CONFIG_NAMES = ("countries", "crises", "industries", "indicators", "settings")


def validate_config(name: str, data: dict[str, Any]) -> None:
    """Check the foundation metadata contract, including incomplete event windows."""
    key = "project" if name == "settings" else name
    value = data.get(key)
    if name == "settings":
        if not isinstance(value, dict) or not all(
            isinstance(value.get(field), str) and value[field]
            for field in ("name", "primary_country", "benchmark_country", "warehouse_path")
        ):
            raise ValueError("settings.project requires non-empty project fields")
        if value["primary_country"] != "IND" or value["benchmark_country"] != "USA":
            raise ValueError("Project countries must be IND and USA")
        return
    if not isinstance(value, list) or not value:
        raise ValueError(f"{name} requires a non-empty {key} list")
    if name in ("industries", "indicators"):
        if not all(isinstance(item, str) and item.strip() for item in value):
            raise ValueError(f"{name} requires non-empty string identifiers")
        if len(set(value)) != len(value):
            raise ValueError(f"Duplicate identifiers in {name}")
        return
    identity = "code" if name == "countries" else "id"
    seen = set()
    for item in value:
        fields = (
            ("code", "name", "calendar")
            if name == "countries"
            else ("id", "name", "category", "status", "date_rationale")
        )
        if not isinstance(item, dict) or not all(
            isinstance(item.get(field), str) and item[field].strip() for field in fields
        ):
            raise ValueError(f"Missing or invalid fields in {name}")
        if item[identity] in seen:
            raise ValueError(f"Duplicate {identity} in {name}")
        seen.add(item[identity])
        if name == "countries":
            if item["calendar"] not in ("fiscal_year", "calendar_year"):
                raise ValueError("Invalid country calendar")
            continue
        if item["status"] not in ("completed", "completed_period", "ongoing", "optional"):
            raise ValueError("Invalid crisis status")
        for field in ("onset_date", "observation_end"):
            if field not in item or (item[field] is not None and type(item[field]) is not date):
                raise ValueError(f"{field} must be a YAML date or explicit null")
        for field in (
            "baseline_window",
            "analysis_window",
            "follow_up_window",
            "comparison_period",
        ):
            if field not in item:
                raise ValueError(f"Missing event window: {field}")
            window = item[field]
            if window is not None and (
                not isinstance(window, list)
                or len(window) != 2
                or not all(type(bound) is date for bound in window)
                or window[0] > window[1]
            ):
                raise ValueError(f"{field} must be an ordered date pair or explicit null")
        onset, end = item["onset_date"], item["observation_end"]
        if item["status"].startswith("completed") and any(
            item[field] is None
            for field in (
                "onset_date",
                "observation_end",
                "baseline_window",
                "analysis_window",
                "follow_up_window",
                "comparison_period",
            )
        ):
            raise ValueError("Completed event definitions require dates and windows")
        if onset and end and end < onset:
            raise ValueError("Observation end precedes event onset")
        if onset and item["baseline_window"] and item["baseline_window"][1] >= onset:
            raise ValueError("Baseline must precede event onset")
        if (
            onset
            and item["analysis_window"]
            and not (item["analysis_window"][0] <= onset <= item["analysis_window"][1])
        ):
            raise ValueError("Analysis window must include event onset")
    if name == "countries" and seen != {"IND", "USA"}:
        raise ValueError("Countries must contain IND and USA")


def load_config(name: str, directory: Path = CONFIG_DIR) -> dict[str, Any]:
    """Load a named configuration mapping from the project configuration directory."""
    if name not in CONFIG_NAMES:
        raise ValueError(f"Unknown configuration: {name}")
    path = directory / f"{name}.yaml"
    with path.open(encoding="utf-8") as stream:
        data = yaml.safe_load(stream)
    if not isinstance(data, dict) or not data:
        raise ValueError(f"Configuration must be a non-empty mapping: {path}")
    validate_config(name, data)
    return data
