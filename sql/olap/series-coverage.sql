SELECT country, industry_code, min(f.month)::VARCHAR AS first_month, max(f.month)::VARCHAR AS last_month,
       count(f.month) AS observed, count(*) - count(f.month) AS missing
FROM dim_source CROSS JOIN dim_date d
LEFT JOIN fact_production f USING (country, industry_code, month)
GROUP BY country, industry_code ORDER BY country, industry_code;

