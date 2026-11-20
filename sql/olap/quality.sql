SELECT c.name AS country, count(f.month) AS observed,
       count(*) - count(f.month) AS missing,
       round(min(production_yoy_pct), 2) AS minimum,
       round(quantile_cont(production_yoy_pct, 0.25), 2) AS q1,
       round(median(production_yoy_pct), 2) AS median,
       round(quantile_cont(production_yoy_pct, 0.75), 2) AS q3,
       round(max(production_yoy_pct), 2) AS maximum
FROM dim_date d CROSS JOIN dim_source s
JOIN dim_country c USING (country)
LEFT JOIN fact_production f USING (country, industry_code, month)
GROUP BY c.name ORDER BY c.name;
