"""Compute fixed-window production growth comparisons from the saved source audit."""

import argparse
import json
from statistics import mean
from typing import Any

from industry_resilience.ingestion.energy import OUT, WINDOWS, window_months


def summarize(windows: dict[str, list[float | None]]) -> dict[str, Any]:
    valid = {name: [v for v in values if v is not None] for name, values in windows.items()}
    counts = {name: len(values) for name, values in valid.items()}
    ready = min(counts.values()) >= 10
    means = {name: mean(values) if ready else None for name, values in valid.items()}
    baseline, impact, followup = (means[name] for name in WINDOWS)
    impact_months = windows["impact"]
    rolling = [
        mean(valid_triple)
        for start in range(len(impact_months) - 2)
        if len(valid_triple := [v for v in impact_months[start : start + 3] if v is not None]) == 3
    ]
    return {
        **{f"{name}_n": counts[name] for name in WINDOWS},
        **{f"{name}_growth_pct": means[name] for name in WINDOWS},
        "growth_shift_pp": impact - baseline
        if impact is not None and baseline is not None
        else None,
        "followup_shift_pp": followup - impact
        if followup is not None and impact is not None
        else None,
        "weakest_3mo_growth_pct": min(rolling, default=None) if ready else None,
        "rank_within_country_event": None,
        "compared_industries_n": None,
    }


def calculate(monthly: dict[str, Any], coverage: list[dict[str, Any]]) -> dict[str, Any]:
    events = {event["event_id"]: event for event in monthly["events"]}
    industries = {item["industry_id"]: item for item in monthly["industries"]}
    growth = {
        (row["country"], row["industry"], row["month"]): row["yoy_growth_pct"]
        for row in monthly["production"]
    }
    cases = []
    for audit in coverage:
        country, industry, event_id = (audit[key] for key in ("country", "industry", "event_id"))
        event = events[event_id]
        windows = {
            name: [
                growth.get((country, industry, month))
                for month in window_months(event[f"{name}_start"], event[f"{name}_end"])
            ]
            for name in WINDOWS
        }
        if any(
            len(windows[name]) != 12
            or sum(value is not None for value in windows[name]) != audit["coverage"][name]
            for name in WINDOWS
        ):
            raise ValueError(f"Coverage audit disagrees with monthly data: {audit}")
        cases.append(
            dict(
                audit,
                **summarize(windows),
                notes=[industries[industry]["comparison_warning"], event["notes"]],
            )
        )

    lookup = {(row["country"], row["industry"], row["event_id"]): row for row in cases}
    comparisons = []
    for event_id in events:
        for country in ("IND", "USA"):
            ranked = sorted(
                (
                    row
                    for row in cases
                    if row["country"] == country
                    and row["event_id"] == event_id
                    and row["growth_shift_pp"] is not None
                ),
                key=lambda row: (-row["growth_shift_pp"], row["industry"]),
            )
            for rank, row in enumerate(ranked, 1):
                row.update(rank_within_country_event=rank, compared_industries_n=len(ranked))
        for industry in industries:
            india, us = (
                lookup[country, industry, event_id]["growth_shift_pp"] for country in ("IND", "USA")
            )
            comparisons.append(
                dict(
                    event_id=event_id,
                    industry=industry,
                    india_minus_us_growth_shift_pp=(
                        india - us if india is not None and us is not None else None
                    ),
                )
            )
    return dict(cases=cases, comparisons=comparisons)


def main() -> None:
    argparse.ArgumentParser(description=__doc__).parse_args()
    monthly, coverage = (
        json.loads((OUT / f"{name}.json").read_text(encoding="utf-8"))
        for name in ("monthly", "coverage_audit")
    )
    result = calculate(monthly, coverage)
    (OUT / "case-metrics.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
