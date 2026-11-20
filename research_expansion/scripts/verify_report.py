"""Validate the research handoff and render the two report figures."""

import json
from collections import Counter
from pathlib import Path
from statistics import mean

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

ROOT = Path("reports/research")


def read(name):
    return json.loads((ROOT / f"{name}.json").read_bytes())


def main():
    panel = read("panel")
    audit = read("event_coverage")
    profile = read("models/shock_profiles")
    statuses = read("notebook_runs/statuses")
    assert len(panel["production"]) == 30
    assert len(audit) == len(panel["events"]) * 30 == 210
    assert len(statuses) == 13 and all(row["status"] == "executed" for row in statuses)
    assert all(len(series) == len(panel["months"]) for series in panel["production"].values())
    assert all(row["status"] in {"ready", "partial", "unavailable"} for row in audit)
    eligible = {
        tuple(row[key] for key in ("country", "industry_code", "event"))
        for row in audit
        if row["eligible"]
    }
    assert eligible == {
        tuple(row[key] for key in ("country", "industry_code", "event")) for row in profile["rows"]
    }
    event = next(row for row in panel["events"] if row["event"] == "energy_surge_2022")
    target = next(
        row
        for row in profile["rows"]
        if (row["country"], row["industry_code"], row["event"]) == ("DEU", "20", event["event"])
    )
    series = dict(zip(panel["months"], panel["production"]["DEU20"], strict=True))

    def avg(window):
        return mean(
            growth
            for month, growth in series.items()
            if growth is not None and event[f"{window}_start"] <= month <= event[f"{window}_end"]
        )

    assert abs((avg("shock") - avg("baseline")) - target["delta_pp"]) < 1e-10
    print(Counter(row["status"] for row in audit), len(eligible), "eligible cases")
    print(
        "Observed production months:",
        sum(v is not None for s in panel["production"].values() for v in s),
    )
    print("Germany chemicals 2022 independently computed:", avg("shock") - avg("baseline"))

    countries = ["IND", "USA", "DEU"]
    codes = [row["industry_code"] for row in panel["industries"]]
    counts = [
        [sum(v is not None for v in panel["production"][country + code]) for code in codes]
        for country in countries
    ]
    fig, ax = plt.subplots(figsize=(8.4, 2.55), layout="constrained")
    ax.imshow(counts, cmap="Blues", vmin=0, vmax=len(panel["months"]), aspect="auto")
    ax.set_xticks(range(len(codes)), codes)
    ax.set_yticks(range(3), ["India", "United States", "Germany"])
    for y, row in enumerate(counts):
        for x, count in enumerate(row):
            ax.text(x, y, str(count), color="white", ha="center", va="center")
    ax.set_title("Observed production growth months by country and industry")
    ax.set_xlabel("ISIC Rev. 4 division")
    fig.savefig(ROOT / "coverage.png", dpi=150)
    plt.close(fig)

    dynamic = read("models/dynamic_response")["coefficients"]
    fig, ax = plt.subplots(figsize=(7.5, 3.2), layout="constrained")
    estimate = [r["coef"] for r in dynamic]
    ax.errorbar(
        [r["horizon_months"] for r in dynamic],
        estimate,
        fmt="o-",
        color="#126f8b",
        yerr=[
            [r["coef"] - r["ci95_low"] for r in dynamic],
            [r["ci95_high"] - r["coef"] for r in dynamic],
        ],
        capsize=4,
    )
    ax.axhline(0, color="#64717c", linestyle="--")
    ax.set_xticks([r["horizon_months"] for r in dynamic])
    ax.set_xlabel("Horizon (months)")
    ax.set_ylabel("Growth pp per pp of Brent return")
    ax.set_title("Brent-response estimates and month-clustered 95% intervals")
    fig.savefig(ROOT / "dynamic-response.png", dpi=150)
    plt.close(fig)


if __name__ == "__main__":
    main()
