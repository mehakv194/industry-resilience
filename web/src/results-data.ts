import pca from '../../reports/research/models/pca.json'
import coordinates from '../../reports/research/models/profile_coordinates.json'
import kmeans from '../../reports/research/models/kmeans.json'
import hierarchical from '../../reports/research/models/hierarchical.json'
import knn from '../../reports/research/models/knn.json'
import logistic from '../../reports/research/models/logistic_regression.json'
import forest from '../../reports/research/models/random_forest.json'
import apriori from '../../reports/research/models/apriori.json'
import isolation from '../../reports/research/models/isolation_forest.json'
import dynamic from '../../reports/research/models/dynamic_response.json'
import shocks from '../../reports/research/models/shock_profiles.json'
import adoption from '../../reports/research/models/ai_transition.json'
import tariff from '../../reports/research/models/tariff_exposure.json'
import warehouse from '../../reports/research/warehouse.json'
import runs from '../../reports/research/notebook_runs/statuses.json'
import { countries, industryName, researchEvents, type Country } from './data'

export { pca, kmeans, hierarchical, apriori, isolation, dynamic, shocks, adoption, tariff, warehouse }
export const pct = (fraction: number) => (100 * fraction).toFixed(1) + '%'
export const number = (value: number) => value.toLocaleString('en', { maximumFractionDigits: 2 })
export const eventName = (id: string) => researchEvents.find(row => row.event_id === id)?.event ?? id
export const countryName = (id: string) => countries[id as Country] ?? id
type CaseKey = { country: string; industry_code: string; event: string }
const caseKey = (row: CaseKey) => [row.country, row.industry_code, row.event].join('/')
export const caseName = (row: CaseKey) => [countryName(row.country), industryName(row.industry_code), eventName(row.event)].join(' · ')

export const classifiers = [
  { model: 'Majority-class baseline', mean: knn.dummy_accuracy_mean, folds: knn.dummy_accuracy_folds },
  ...([[ 'KNN', knn ], [ 'Logistic Regression', logistic ], [ 'Random Forest', forest ]] as const)
    .map(([model, report]) => ({ model, mean: report.cv_accuracy_mean, folds: report.cv_accuracy_folds })),
]
export const best = classifiers.reduce((top, row) => row.mean > top.mean ? row : top)
export const evaluation = { cases: knn.n_cases, groups: knn.n_groups, folds: classifiers[0].folds.length }
const scores = new Map(isolation.outliers.map(row => [caseKey(row), row.anomaly_score]))
const ward = new Map(hierarchical.assignments.map(row => [caseKey(row), row.hier_cluster]))
export const points = coordinates.map(row => ({
  ...row, id: caseKey(row), name: caseName(row), ward: ward.get(caseKey(row)), score: scores.get(caseKey(row)),
}))
export const clusters = kmeans.cluster_summary.map(({ cluster }) => ({
  cluster, size: kmeans.assignments.filter(row => row.cluster === cluster).length,
}))
export const anomalies = points.filter(row => row.score !== undefined).sort((a, b) => a.score! - b.score!)
export const variance = pca.explained_variance_ratio[0] + pca.explained_variance_ratio[1]
export const featureNames = {
  delta_pp: 'Impact growth shift', shock_std_yoy: 'Impact volatility', negative_share: 'Negative months',
  worst_yoy: 'Lowest monthly growth', post_mean_yoy: 'Mean follow-up growth',
}
export function profileValues(row: typeof points[number]) {
  return [
    [featureNames.delta_pp, number(row.delta_pp) + ' pp'],
    [featureNames.shock_std_yoy, number(row.shock_std_yoy) + ' pp'],
    [featureNames.negative_share, pct(row.negative_share)],
    [featureNames.worst_yoy, number(row.worst_yoy) + '%'],
    [featureNames.post_mean_yoy, number(row.post_mean_yoy) + '%'],
  ]
}

const profileInputs = Object.values(featureNames).join(', ')
const classifierInputs = knn.features.map(feature => feature.replaceAll('_', ' ')).join(', ')
const entries = [
  ['PCA', 'Unsupervised', '03_pca', 'pca', pca.status, 'Summarize five correlated response measures on fewer axes.', profileInputs, 'Component loadings and profile coordinates.', pct(variance) + ' variance on PC1 and PC2.'],
  ['K-Means', 'Unsupervised', '04_kmeans', 'kmeans', kmeans.status, 'Find groups of profiles with similar standardized features.', profileInputs, 'Cluster assignments and centroids.', 'Silhouette ' + kmeans.silhouette.toFixed(3) + '. Two groups contain only one profile each.'],
  ['Hierarchical Clustering', 'Unsupervised', '05_hierarchical', 'hierarchical', hierarchical.status, 'Check whether Ward linkage recovers the same partition.', profileInputs, 'Ward cluster assignments.', 'Adjusted Rand Index ' + hierarchical.adjusted_rand_vs_kmeans.toFixed(2) + ' against K-Means.'],
  ['KNN', 'Supervised', '06_knn', 'knn', knn.status, 'Classify slowdowns using similar historical cases.', classifierInputs, 'Grouped fold accuracies.', pct(knn.cv_accuracy_mean) + ' mean accuracy.'],
  ['Logistic Regression', 'Supervised', '09_logistic_regression', 'logistic_regression', logistic.status, 'Compare with a linear decision boundary.', classifierInputs, 'Grouped fold accuracies.', pct(logistic.cv_accuracy_mean) + ' mean accuracy.'],
  ['Random Forest', 'Supervised', '08_random_forest', 'random_forest', forest.status, 'Capture nonlinear relationships and feature interactions.', classifierInputs, 'Grouped fold accuracies.', pct(forest.cv_accuracy_mean) + ' mean accuracy, highest among the evaluated models.'],
  ['Apriori', 'Association', '07_apriori', 'apriori', apriori.status, 'Search for combinations that recur across historical cases.', 'Event, slowdown and volatility categories', 'Rules with support, confidence and lift.', apriori.rules.length + ' rules met the experiment thresholds.'],
  ['Isolation Forest', 'Unsupervised', '10_isolation_forest', 'isolation_forest', isolation.status, 'Flag profiles that are unusually easy to isolate.', profileInputs, 'Flagged profiles and anomaly scores.', isolation.outlier_count + ' flags with contamination set to 10%.'],
  ['Local Projections', 'Statistical', '02_dynamic_response', 'dynamic_response', dynamic.status, 'Estimate how the Brent–production relationship varies with horizon.', 'Monthly Brent log returns, lagged production YoY growth and country–industry fixed effects', 'Horizon coefficients and month-clustered 95% intervals.', dynamic.coefficients.length + ' fitted horizons. Estimates are exploratory associations.'],
  ['Shock Profiles', 'Statistical', '01_shock_profile', 'shock_profiles', shocks.status, 'Measure how growth changed across each event window.', 'Monthly production YoY growth and configured event windows', 'Baseline, impact and follow-up statistics and within-country ranks.', shocks.cases + ' cases met baseline and impact coverage requirements.'],
  ['AI Adoption Study', 'Statistical', '11_ai_transition', 'ai_transition', adoption.status, 'Describe observed changes in AI use.', 'German enterprise AI adoption survey observations', 'First and last adoption readings and change.', 'Adoption increased in the surveyed series.'],
  ['Tariff Exposure', 'Statistical', '12_tariff_exposure', 'tariff_exposure', tariff.status, 'Compare production changes by measured tariff exposure.', 'Aligned observed trade and duty records', 'Skip report.', tariff.reason + '.'],
  ['SVM', 'Supervised', '', '', 'Not evaluated', 'Candidate classifier for comparison with the fitted models.', 'No evaluated inputs', 'No trained export.', 'Historical accuracy is unavailable.'],
] as const

export const inventory = entries.map(([name, category, notebook, artifact, status, purpose, inputs, output, result]) => ({
  name, category, status, purpose, inputs, output, result,
  notebook: notebook && 'research_expansion/notebooks/' + notebook + '.ipynb',
  executed: runs.find(run => run.notebook === notebook + '.ipynb')?.executed_notebook,
  artifact: artifact && 'reports/research/models/' + artifact + '.json',
}))
