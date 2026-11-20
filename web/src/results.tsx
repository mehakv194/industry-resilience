import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar, BarChart, CartesianGrid, Cell, ErrorBar, Legend, ReferenceLine,
  ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis,
} from 'recharts'
import { countries, industries, industryName, researchEvents } from './data'
import { Select } from './shared'
import {
  adoption, anomalies, apriori, best, classifiers, clusters, countryName, dynamic,
  evaluation, eventName, featureNames, hierarchical, inventory, isolation, kmeans,
  number, pca, pct, points, profileValues, shocks, tariff, variance, warehouse,
} from './results-data'
import './results.css'

const colors = ['#126f8b', '#e97661', '#49bed4', '#64717c']
const percentAxis = (value: number) => Math.round(value * 100) + '%'

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return <section id={id} className="card results-section" aria-labelledby={id + '-title'}>
    <h2 id={id + '-title'}>{title}</h2>{children}
  </section>
}

function Classification() {
  const [detail, setDetail] = useState(false)
  const [selected, setSelected] = useState(best.model)
  const baseline = classifiers[0]
  const model = classifiers.find(row => row.model === selected)!
  const folds = baseline.folds.map((accuracy, i) => ({
    fold: 'Fold ' + (i + 1), [baseline.model]: accuracy, [model.model]: model.folds[i],
  }))
  const improvement = ((model.mean - baseline.mean) * 100).toFixed(1)
  return <Section id="classification" title="Model performance comparison">
    <p>{best.model} had the highest observed accuracy ({pct(best.mean)}) in the historical slowdown experiment, {(100 * (best.mean - baseline.mean)).toFixed(1)} percentage points above the majority-class baseline.</p>
    <p className="muted">{evaluation.cases} eligible cases · {evaluation.groups} country–industry groups · {evaluation.folds} GroupKFold splits</p>
    <div className="results-controls">
      <Select label="Compare a model with the baseline" value={selected} change={setSelected} options={classifiers.map(row => [row.model, row.model])} />
      <button type="button" className="button" onClick={() => setDetail(!detail)}>{detail ? 'View charts' : 'View detailed results'}</button>
    </div>
    {detail ? <div className="results-table" tabIndex={0} role="region" aria-label="Accuracy by model and fold">
      <table><thead><tr><th scope="col">Model</th><th scope="col">Mean</th><th scope="col">Gain (pp)</th>{folds.map(row => <th scope="col" key={row.fold}>{row.fold}</th>)}</tr></thead>
        <tbody>{classifiers.map(row => <tr key={row.model}><th scope="row">{row.model}</th><td>{pct(row.mean)}</td><td>{((row.mean - baseline.mean) * 100).toFixed(1)}</td>{row.folds.map((value, i) => <td key={i}>{pct(value)}</td>)}</tr>)}</tbody>
      </table>
    </div> : <>
      <div className="results-bars" aria-label="Mean classifier accuracy">
        {classifiers.map(row => <button key={row.model} type="button" aria-pressed={model === row} onClick={() => setSelected(row.model)}>
          <span>{row.model}{row === best && <small> Highest observed</small>}</span>
          <span className="results-track" aria-hidden="true"><span style={{ width: pct(row.mean), background: row === best ? 'var(--teal)' : row === baseline ? '#64717c' : 'var(--cyan)' }} /></span>
          <strong>{pct(row.mean)}</strong>
        </button>)}
      </div>
      <h3>Accuracy by fold</h3>
      <ResponsiveContainer width="100%" height={235}>
        <BarChart data={folds} accessibilityLayer>
          <CartesianGrid vertical={false} stroke="#e6eaed" />
          <XAxis dataKey="fold" /><YAxis domain={[0, 1]} tickFormatter={percentAxis} width={48} />
          <Tooltip formatter={value => pct(Number(value))} /><Legend />
          <Bar dataKey={baseline.model} fill={colors[3]} maxBarSize={42} />
          {model !== baseline && <Bar dataKey={model.model} fill={colors[0]} maxBarSize={42} />}
        </BarChart>
      </ResponsiveContainer>
    </>}
    <p aria-live="polite"><strong>{model.model}</strong> · {pct(model.mean)} mean accuracy · {improvement} pp versus baseline</p>
    <details><summary>Evaluation methodology and metric availability</summary>
      <p>Each split holds out whole country–industry groups. The same economic shocks can appear in training and test folds. Generalization to an entirely unseen shock remains untested.</p>
      <p>The exports provide accuracy only. Precision, recall, F1, balanced accuracy and confusion matrices are unavailable. SVM was not evaluated.</p>
    </details>
  </Section>
}

type Point = typeof points[number]

function ProfilePlot({ rows, clustered = false }: { rows: Point[]; clustered?: boolean }) {
  if (!rows.length) return <p role="status">No exported profiles match these filters.</p>
  const series = clustered
    ? clusters.map(({ cluster }) => ({ name: 'Cluster ' + (cluster + 1), rows: rows.filter(row => row.cluster === cluster), color: colors[cluster] }))
    : [{ name: 'Profiles', rows, color: colors[0] }]
  return <ResponsiveContainer width="100%" height={320}>
    <ScatterChart margin={{ bottom: 22, right: 20 }} accessibilityLayer>
      <CartesianGrid stroke="#e6eaed" />
      <XAxis type="number" domain={['auto', 'auto']} dataKey="x" name="PC1" label={{ value: 'PC1 · ' + pct(pca.explained_variance_ratio[0]), position: 'insideBottom', offset: -13 }} />
      <YAxis type="number" domain={['auto', 'auto']} dataKey="y" name="PC2" width={55} label={{ value: 'PC2 · ' + pct(pca.explained_variance_ratio[1]), angle: -90, position: 'insideLeft' }} />
      <Tooltip content={({ active, payload }) => {
        const row = payload?.[0]?.payload as Point | undefined
        return active && row ? <div className="results-tooltip"><strong>{row.name}</strong>
          <div>PC1 {number(row.x)} · PC2 {number(row.y)}</div>
          {clustered && <div>K-Means {row.cluster + 1} · Ward label {row.ward}</div>}
          {profileValues(row).map(([label, value]) => <div key={label}>{label} · {value}</div>)}
        </div> : null
      }} />
      {series.map(item => <Scatter key={item.name} name={item.name} data={item.rows} fill={item.color} fillOpacity={.77} isAnimationActive={false} />)}
    </ScatterChart>
  </ResponsiveContainer>
}

function Profiles() {
  const [country, setCountry] = useState('')
  const [industry, setIndustry] = useState('')
  const [event, setEvent] = useState('')
  const [zoom, setZoom] = useState(false)
  const [anomalyId, setAnomalyId] = useState('')
  const singletons = points.filter(row => clusters.some(cluster => cluster.size === 1 && cluster.cluster === row.cluster))
  const matches = (row: Point) => (!country || row.country === country) && (!industry || row.industry_code === industry) && (!event || row.event === event)
  const filtered = points.filter(matches)
  const flagged = anomalies.filter(matches)
  const anomaly = flagged.find(row => row.id === anomalyId) ?? flagged[0]
  const loadings = pca.loadings.map(row => ({ ...row, feature: featureNames[row.variable as keyof typeof featureNames] }))
  return <>
    <Section id="pca" title="How did PCA simplify industry behavior?">
      <p><strong>{pct(variance)} of variation</strong> is captured by two axes across {pca.n_cases} standardized profiles. PCA compresses five features so that profiles with similar measured responses can be viewed together.</p>
      <div className="filter-grid">
        <Select label="Country" value={country} change={setCountry} options={[[ '', 'All countries' ], ...Object.entries(countries)]} />
        <Select label="Industry" value={industry} change={setIndustry} options={[[ '', 'All industries' ], ...industries.map(row => [row.industry_id, row.industry] as [string, string])]} />
        <Select label="Economic shock" value={event} change={setEvent} options={[[ '', 'All profile events' ], ...researchEvents.filter(row => points.some(point => point.event === row.event_id)).map(row => [row.event_id, row.event] as [string, string])]} />
      </div>
      <p className="muted">Filters also apply to cluster membership and anomaly inspection.</p>
      <label className="results-check"><input type="checkbox" checked={zoom} onChange={e => setZoom(e.target.checked)} /> Exclude singleton profiles from PCA view</label>
      <ProfilePlot rows={zoom ? filtered.filter(row => !singletons.includes(row)) : filtered} />
      <p>Two extreme India motor-vehicle profiles stretch the axes. Excluding them from the view reveals the main point cloud using the original fitted coordinates.</p>
      <details><summary>Inspect component loadings</summary>
        <p>Larger absolute loadings indicate stronger contributions. The sign gives the direction along that axis.</p>
        <ResponsiveContainer width="100%" height={265}>
          <BarChart layout="vertical" data={loadings} accessibilityLayer>
            <XAxis type="number" domain={[-1, 1]} /><YAxis type="category" dataKey="feature" width={120} tick={{ fontSize: 11 }} />
            <ReferenceLine x={0} stroke="#64717c" /><Tooltip formatter={v => number(Number(v))} /><Legend />
            <Bar dataKey="PC1" fill={colors[0]} /><Bar dataKey="PC2" fill={colors[1]} />
          </BarChart>
        </ResponsiveContainer>
        <ul>{loadings.map(row => <li key={row.feature}>{row.feature} · PC1 {number(row.PC1)} · PC2 {number(row.PC2)}</li>)}</ul>
      </details>
    </Section>
    <Section id="clustering" title="Which industries showed similar behavior?">
      <p>K-Means groups profiles by feature similarity. Ward hierarchical clustering provides a second partition to compare.</p>
      <div className="results-stats">
        {clusters.map(({ cluster, size }) => <span key={cluster}><i style={{ background: colors[cluster] }} />Cluster {cluster + 1} <strong>{size} {size === 1 ? 'profile' : 'profiles'}</strong></span>)}
        <span>Silhouette <strong>{kmeans.silhouette.toFixed(3)}</strong></span>
        <span>Ward agreement (ARI) <strong>{hierarchical.adjusted_rand_vs_kmeans.toFixed(2)}</strong></span>
      </div>
      <ProfilePlot rows={filtered} clustered />
      <p>The 148/1/1 split isolates two exceptional cases. Their separation drives the high silhouette score. Agreement between the methods reproduces that imbalance.</p>
      <div className="auto-grid">{singletons.map(row => <div key={row.id} className="results-inset">
        <h3>Cluster {row.cluster + 1} · {row.name}</h3>
        <dl className="results-values">{profileValues(row).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </div>)}</div>
      <p className="muted">The April 2021 motor-vehicle spike enters the supply-chain impact window and the COVID follow-up window, inflating different features in the two profiles.</p>
      <details><summary>Inspect cluster membership ({filtered.length} {filtered.length === 1 ? 'profile' : 'profiles'})</summary>
        <ul className="results-members">{filtered.map(row => <li key={row.id}>{row.name} · K-Means {row.cluster + 1} · Ward label {row.ward}</li>)}</ul>
      </details>
    </Section>
    <Section id="anomalies" title="Which industry responses were unusual?">
      <p>Isolation Forest flagged <strong>{isolation.outlier_count} of {isolation.n_cases}</strong> profiles with a 10% contamination setting. More negative scores indicate more unusual feature combinations under the fitted model.</p>
      {anomaly ? <>
        <Select label="Flagged profile (most unusual first)" value={anomaly.id} change={setAnomalyId} options={flagged.map(row => [row.id, row.name + ' · ' + row.score!.toFixed(4)])} />
        <div className="results-inset"><h3>{anomaly.name}</h3><p>Isolation Forest score · {anomaly.score!.toFixed(4)}</p>
          <dl className="results-values">{profileValues(anomaly).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        </div>
      </> : <p role="status">No flagged profiles match these filters.</p>}
      <p>These scores reflect unusual combinations of growth, volatility and follow-up behavior. The model supplies no per-feature attribution. Check source vintage and low-base effects before interpreting a flag as economic damage or a data error.</p>
      <Link to="/pipeline#pipeline-warehouse">Inspect source provenance and monthly outliers →</Link>
    </Section>
  </>
}

const ruleLabel = (item: string) => {
  const [field, value] = item.split('=')
  if (field === 'event') return eventName(value)
  if (field === 'country') return countryName(value)
  if (field === 'negative_share') return value === 'high' ? 'High share of negative months' : 'Low share of negative months'
  if (field === 'slowdown') return value === 'no' ? 'No slowdown' : 'Slowdown'
  return value.charAt(0).toUpperCase() + value.slice(1) + ' ' + field
}
const ruleSide = (items: string[]) => items.map(ruleLabel).join(' + ')
const rules = [...apriori.rules].sort((a, b) => b.lift - a.lift)

function Associations() {
  const [index, setIndex] = useState(0)
  const rule = rules[index]
  return <Section id="associations" title="What patterns frequently appeared together?">
    <p>Apriori searches for combinations of event, country and production-response categories. The export contains <strong>{rules.length} rules from {apriori.n_cases} cases</strong> at {pct(apriori.min_support)} minimum support.</p>
    <Select label="Association rule (ranked by lift)" value={String(index)} change={value => setIndex(Number(value))}
      options={rules.map((row, i) => [String(i), ruleSide(row.antecedent) + ' → ' + ruleSide(row.consequent)])} />
    <div className="results-rule"><strong>{ruleSide(rule.antecedent)}</strong><span aria-label="associated with">→</span><strong>{ruleSide(rule.consequent)}</strong></div>
    <div className="results-stats"><span>Support <strong>{pct(rule.support)}</strong></span><span>Confidence <strong>{pct(rule.confidence)}</strong></span><span>Lift <strong>{number(rule.lift)}×</strong></span></div>
    <p>Among cases matching the left side, {pct(rule.confidence)} also matched the right side. Both occurred together in {pct(rule.support)} of all cases. This describes co-occurrence and cannot establish causation.</p>
    <details><summary>Inspect the rule metrics</summary><p>Support is the joint case share. Confidence is the joint share among antecedent cases. Lift compares confidence with the overall frequency of the consequent. Repeated countries and industries limit independence.</p></details>
  </Section>
}

function Advanced() {
  const coefficients = dynamic.coefficients.map(row => ({
    ...row, interval: [row.coef - row.ci95_low, row.ci95_high - row.coef] as [number, number],
  }))
  const survey = adoption.series[0]
  return <Section id="advanced" title="Advanced research models">
    <div className="auto-grid">
      <article className="results-inset"><h3>Shock-resilience profiles</h3>
        <p><strong>{shocks.cases} / {shocks.target_case_grid} eligible cases.</strong> Compare mean YoY growth before, during and after each event. Impact minus baseline is a percentage-point shift. Follow-up describes subsequent change where observed.</p>
        <Link to="/case-studies">Inspect historical windows →</Link>
      </article>
      <article className="results-inset"><h3>AI adoption study</h3>
        <p><strong>{number(survey.first_value)}% → {number(survey.last_value)}%</strong> · {survey.first}–{survey.last}</p>
        <p>{survey.definition}. The {number(survey.value_change)} pp rise describes the survey series. Its coverage does not support a cross-country or productivity effect estimate.</p>
      </article>
      <article className="results-inset"><h3>Tariff exposure · Skipped</h3>
        <p>Aligned trade and tariff inputs were unavailable. {tariff.reason}.</p>
      </article>
    </div>
    <h3>Dynamic local projections</h3>
    <p>{coefficients.length} fitted horizons show how the association with Brent varies over time. Estimates are in YoY growth pp per 1 pp Brent monthly log return, with month-clustered 95% intervals.</p>
    <ResponsiveContainer width="100%" height={245}>
      <BarChart data={coefficients} accessibilityLayer>
        <CartesianGrid vertical={false} stroke="#e6eaed" />
        <XAxis dataKey="horizon_months" tickFormatter={value => value + ' mo'} />
        <YAxis width={52} tickFormatter={number} domain={[Math.min(...coefficients.map(row => row.ci95_low)), Math.max(...coefficients.map(row => row.ci95_high))]} /><ReferenceLine y={0} stroke="#64717c" />
        <Tooltip labelFormatter={value => 'Horizon · ' + value + ' months'} formatter={v => number(Number(v))} />
        <Bar dataKey="coef" name="Coefficient" maxBarSize={30}>
          {coefficients.map(row => <Cell key={row.horizon_months} fill={row.coef < 0 ? colors[1] : colors[0]} />)}
          <ErrorBar dataKey="interval" width={6} stroke="#071b2a" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    <p>These are exploratory associations. Brent mixes supply and demand changes, and the regression does not identify a causal response.</p>
    <details><summary>Show coefficients and uncertainty</summary>
      <ul>{coefficients.map(row => <li key={row.horizon_months}>{row.horizon_months} months · {row.coef.toFixed(3)} (95% CI {row.ci95_low.toFixed(3)} to {row.ci95_high.toFixed(3)}) · {number(row.n_rows)} rows</li>)}</ul>
    </details>
  </Section>
}

function Inventory() {
  const [selected, setSelected] = useState(best.model)
  const model = inventory.find(row => row.name === selected)!
  return <Section id="inventory" title="Model inventory and implementation evidence">
    <Select label="Select a model" value={selected} change={setSelected} options={inventory.map(row => [row.name, row.name])} />
    <article className="results-inset" aria-live="polite">
      <h3>{model.name}</h3>
      <p className="muted">{model.category} · <span className="capitalize">{model.status}</span>{model.executed && ' · Executed notebook recorded'}</p>
      <p>{model.purpose}</p>
      <dl className="results-evidence">
        <div><dt>Inputs</dt><dd>{model.inputs}</dd></div>
        <div><dt>Output</dt><dd>{model.output}</dd></div>
        <div><dt>Result</dt><dd>{model.result}</dd></div>
      </dl>
      {model.notebook && <details key={model.name}><summary>Repository paths and reproduction</summary>
        <dl className="results-evidence">
          <div><dt>Notebook</dt><dd><code>{model.notebook}</code></dd></div>
          {model.executed && <div><dt>Executed notebook</dt><dd><code>{model.executed}</code></dd></div>}
          <div><dt>Artifact</dt><dd><code>{model.artifact}</code></dd></div>
          <div><dt>Notebook runner</dt><dd><code>python research_expansion/scripts/run_notebooks.py</code></dd></div>
        </dl>
      </details>}
    </article>
  </Section>
}

export function Results() {
  const metrics = [
    [number(warehouse.observed), 'Production observations'],
    [warehouse.queries['series-coverage'].rows.length, 'Country–industry series'],
    [pca.n_cases, 'PCA and clustering profiles'],
    [pct(warehouse.observed / warehouse.expected), 'Observation coverage'],
    [inventory.filter(row => row.status === 'fitted' && row.executed).length, 'Fitted model outputs'],
  ]
  return <>
    <header className="page-header results-header">
      <h1>Model Performance &amp; Research Findings</h1>
      <p>How our algorithms performed and what they discovered.</p>
    </header>
    <div className="results-kpis">{metrics.map(([value, label]) => <div className="card scope" key={label}>
      <strong>{value}</strong><span>{label}</span>
    </div>)}</div>
    <div className="card results-section">
      <p>Monthly manufacturing production from India (MoSPI IIP via a republication), Germany (Eurostat) and the United States (Federal Reserve). The warehouse covers {industries.length} industries. Brent provides energy-price context for local projections.</p>
      <Link to="/pipeline#pipeline-sources">Inspect the production and Brent sources →</Link>
      <details><summary>Configured historical windows</summary>
        <ul>{researchEvents.map(row => <li key={row.event_id}><strong>{eventName(row.event_id)}</strong> · {row.status}<br />
          Baseline {row.baseline_start} to {row.baseline_end} · Impact {row.impact_start} to {row.impact_end}{row.followup_end && ' · Follow-up ' + row.followup_start + ' to ' + row.followup_end}</li>)}</ul>
      </details>
      <nav className="results-links" aria-label="Research result sections">
        {Object.entries({ classification: 'Classification', pca: 'PCA', clustering: 'Clustering', associations: 'Apriori', anomalies: 'Anomalies', advanced: 'Advanced models', inventory: 'Model inventory', warehouse: 'Warehouse' }).map(([id, label]) => <a key={id} href={'#' + id}>{label}</a>)}
      </nav>
    </div>
    <Classification />
    <Profiles />
    <Associations />
    <Advanced />
    <Inventory />
    <Section id="warehouse" title="Data warehousing evidence">
      <p>DuckDB stores <strong>{number(warehouse.observed)}</strong> production observations in <code>fact_production</code> with country, industry, date, source and event dimensions. <strong>{number(warehouse.expected - warehouse.observed)}</strong> series-month slots are missing. Source fingerprints, vintages and series units document the ETL provenance.</p>
      <p>Four OLAP demonstrations show slice, dice, drill-down and roll-up with the executed queries and their result rows.</p>
      <Link to="/pipeline#pipeline-warehouse">Open the warehouse schema and SQL demonstrations →</Link>
    </Section>
  </>
}
