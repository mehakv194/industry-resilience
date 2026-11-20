CREATE TABLE dim_country (
    country VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL
);
CREATE TABLE dim_industry (
    industry_code VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    india_nic2008 VARCHAR NOT NULL,
    germany_nace_r2 VARCHAR NOT NULL,
    us_preferred VARCHAR NOT NULL
);
CREATE TABLE dim_date (
    month DATE PRIMARY KEY CHECK (day(month) = 1),
    year INTEGER NOT NULL,
    quarter INTEGER NOT NULL
);
CREATE TABLE dim_source (
    country VARCHAR REFERENCES dim_country(country),
    industry_code VARCHAR REFERENCES dim_industry(industry_code),
    series_id VARCHAR NOT NULL,
    publisher VARCHAR NOT NULL,
    source_url VARCHAR NOT NULL,
    download_url VARCHAR NOT NULL,
    unit_raw VARCHAR NOT NULL,
    unit_derived VARCHAR NOT NULL CHECK (unit_derived = 'YoY percent'),
    match_grade VARCHAR NOT NULL,
    vintage VARCHAR,
    sha256 VARCHAR NOT NULL CHECK (length(sha256) = 64),
    retrieved_at_utc TIMESTAMPTZ NOT NULL,
    retrieval_timestamp_basis VARCHAR NOT NULL,
    valid_count INTEGER NOT NULL,
    PRIMARY KEY (country, industry_code)
);
CREATE TABLE dim_event (
    event VARCHAR PRIMARY KEY,
    category VARCHAR NOT NULL,
    note VARCHAR NOT NULL
);
CREATE TABLE bridge_event_month (
    event VARCHAR REFERENCES dim_event(event),
    month DATE REFERENCES dim_date(month),
    phase VARCHAR NOT NULL CHECK (phase IN ('baseline', 'impact', 'follow-up')),
    PRIMARY KEY (event, month)
);
CREATE TABLE fact_production (
    country VARCHAR REFERENCES dim_country(country),
    industry_code VARCHAR REFERENCES dim_industry(industry_code),
    month DATE REFERENCES dim_date(month),
    production_yoy_pct DOUBLE NOT NULL CHECK (isfinite(production_yoy_pct)),
    PRIMARY KEY (country, industry_code, month),
    FOREIGN KEY (country, industry_code) REFERENCES dim_source(country, industry_code)
);
