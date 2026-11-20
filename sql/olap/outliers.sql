WITH quartiles AS (
    SELECT country, industry_code, quantile_cont(production_yoy_pct, 0.25) AS q1,
           quantile_cont(production_yoy_pct, 0.75) AS q3
    FROM fact_production GROUP BY country, industry_code
), flagged AS (
    SELECT f.*, greatest(q1 - production_yoy_pct, production_yoy_pct - q3)
                 / nullif(q3 - q1, 0) AS iqr_distance
    FROM fact_production f JOIN quartiles USING (country, industry_code)
)
SELECT country, industry_code, CAST(month AS VARCHAR) AS month,
       round(production_yoy_pct, 2) AS yoy_pct, round(iqr_distance, 2) AS iqr_distance,
       count(*) OVER () AS total_flagged
FROM flagged WHERE iqr_distance > 1.5
ORDER BY flagged.iqr_distance DESC, country, industry_code, month LIMIT 8;
