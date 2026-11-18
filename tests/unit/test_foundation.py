from pathlib import Path

import pytest

import industry_resilience
from industry_resilience.settings import CONFIG_NAMES, load_config, validate_config
from industry_resilience.warehouse.database import initialize_database


def test_import() -> None:
    assert industry_resilience.__version__


@pytest.mark.parametrize("name", CONFIG_NAMES)
def test_configs_load(name: str) -> None:
    assert load_config(name)


def test_invalid_config(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="Unknown configuration"):
        load_config("../other", tmp_path)
    (tmp_path / "settings.yaml").write_text("[]", encoding="utf-8")
    with pytest.raises(ValueError, match="non-empty mapping"):
        load_config("settings", tmp_path)


def test_database_initialization(tmp_path: Path) -> None:
    path = tmp_path / "test.duckdb"
    with initialize_database(path) as connection:
        assert connection.execute("SELECT 1").fetchone() == (1,)
    with initialize_database(path) as connection:
        assert connection.execute("SHOW TABLES").fetchall() == []


def test_config_schema_and_event_windows() -> None:
    from datetime import date

    data = load_config("crises")
    assert data["crises"][3]["observation_end"] is None
    data["crises"][0]["analysis_window"] = [date(2010, 1, 1), date(2007, 1, 1)]
    with pytest.raises(ValueError, match="ordered date pair"):
        validate_config("crises", data)
    with pytest.raises(ValueError, match="non-empty"):
        validate_config("countries", {"countries": []})
    with pytest.raises(ValueError, match="Duplicate"):
        validate_config("industries", {"industries": ["manufacturing", "manufacturing"]})
