# Engineering instructions

- Follow `docs/INDEX.md` and the documented architecture; update documentation when it changes.
- Write clean, modular Python with type hints and appropriate docstrings. Avoid unnecessary dependencies.
- Keep business logic out of Streamlit pages and production calculations out of notebooks.
- Never fabricate economic data. Preserve source provenance and vintages.
- Never silently mix incompatible series, units, classifications, price bases or periods. Handle missing observations explicitly.
- Test core calculations. Use meaningful logging and actionable errors.
- Never claim a test passed unless it was executed.
- Do not implement future phases without explicit instructions.
