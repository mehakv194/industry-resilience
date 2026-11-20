SELECT country, industry_code, b.phase, count(*) AS observed,
       round(avg(production_yoy_pct), 2) AS mean_yoy_pct
FROM fact_production f JOIN bridge_event_month b USING (month)
WHERE b.event = 'energy_surge_2022' AND b.phase IN ('baseline', 'impact')
  AND country IN ('IND', 'USA') AND industry_code IN ('10', '29')
GROUP BY country, industry_code, b.phase ORDER BY country, industry_code, b.phase;
