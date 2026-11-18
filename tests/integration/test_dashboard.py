"""Exercise the five empty-state navigation sections without live economic data."""

from pathlib import Path

from streamlit.testing.v1 import AppTest


def test_all_dashboard_sections() -> None:
    root = Path(__file__).resolve().parents[2]
    app = AppTest.from_file(str(root / "dashboard/app.py"), default_timeout=60).run()
    options = app.sidebar.radio[0].options
    assert len(options) == 5
    for option in options:
        app.sidebar.radio[0].set_value(option).run()
        assert not app.exception
        assert app.title[0].value == option
        assert "No verified economic data or findings" in app.info[0].value
