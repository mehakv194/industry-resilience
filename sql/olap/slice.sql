SELECT d.name AS country, count(*) AS observed, round(avg(production_yoy_pct), 2) AS mean_yoy_pct
FROM fact_production f JOIN bridge_event_month b USING (month)
JOIN dim_country d USING (country)
WHERE b.event = 'energy_surge_2022' AND b.phase = 'impact'
GROUP BY d.name ORDER BY d.name;
