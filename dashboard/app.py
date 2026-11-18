"""Empty-state research application; no economic observations are included."""

import streamlit as st

st.set_page_config(page_title="IndustryResilience", page_icon="◈", layout="wide")
st.sidebar.title("IndustryResilience")
page = st.sidebar.radio(
    "Explore",
    [
        "Economic Overview",
        "Industry Explorer",
        "Cross-Crisis Intelligence",
        "India vs USA",
        "Research Findings",
    ],
)
st.title(page)
st.caption("IndustryResilience · India and United States")
st.info(
    "No verified economic data or findings are available yet. "
    "This page will be populated as the research progresses."
)
st.markdown(
    "This project studies how industries respond across different economic shocks. "
    "All future results will identify their sources, methods and limitations."
)
