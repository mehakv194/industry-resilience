SELECT year, quarter, count(*) AS observed, round(avg(production_yoy_pct), 2) AS mean_yoy_pct
FROM fact_production JOIN dim_date USING (month)
WHERE country = 'IND' AND industry_code = '29' AND year = 2022
GROUP BY GROUPING SETS ((year, quarter), (year))
ORDER BY year, quarter NULLS LAST;
