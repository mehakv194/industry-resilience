SELECT year, quarter, CAST(d.month AS VARCHAR) AS month,
       round(production_yoy_pct, 2) AS yoy_pct
FROM dim_date d JOIN bridge_event_month b USING (month)
LEFT JOIN fact_production f ON f.month = d.month AND country = 'IND' AND industry_code = '29'
WHERE b.event = 'energy_surge_2022' AND b.phase = 'impact'
ORDER BY d.month;
