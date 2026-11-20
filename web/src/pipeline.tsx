import { ArrowDown, ArrowRight, ChevronDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { countries, events, industries } from './data'
import { models, outputs, stages } from './pipeline-content'
import warehouse from '../../reports/research/warehouse.json'
import pca from '../../reports/research/models/pca.json'
import kmeans from '../../reports/research/models/kmeans.json'
import hierarchical from '../../reports/research/models/hierarchical.json'
import knn from '../../reports/research/models/knn.json'
import logistic from '../../reports/research/models/logistic_regression.json'
import forest from '../../reports/research/models/random_forest.json'
import apriori from '../../reports/research/models/apriori.json'
import isolation from '../../reports/research/models/isolation_forest.json'
import './pipeline.css'

function PipelineHero() {
  const counts = [
    [Object.keys(countries).length, 'Countries'],
    [industries.length, 'Manufacturing industries'],
    [events.length, 'Event studies'],
    [models.filter(model => !('candidate' in model)).length, 'Published ML methods'],
  ]
  return <header className="card pipeline-hero">
    <h1>Project Pipeline</h1>
    <p>How IndustryResilience turns raw economic data into business-ready insights.</p>
    <p className="muted">Follow the evidence from official datasets to case studies, comparisons and historical risk insights.</p>
    <ul className="pipeline-stats">
      {counts.map(([count, label]) => <li key={label}><strong>{count}</strong> {label}</li>)}
    </ul>
  </header>
}

function PipelineStageCard({ stage, children }: { stage: typeof stages[number]; children?: ReactNode }) {
  return <section id={stage.id} className="card pipeline-stage" aria-labelledby={stage.id + '-title'}>
    <header>
      <span className="pipeline-icon"><stage.icon size={22} aria-hidden="true" /></span>
      <div><h2 id={stage.id + '-title'}>{stage.title}</h2><p className="muted">{stage.description}</p></div>
    </header>
    {stage.nodes.length > 0 && <ul className="pipeline-grid">
      {stage.nodes.map(([label, description]) => <li className="pipeline-node" key={label}>
        <strong>{label}</strong><p>{description}</p>
      </li>)}
    </ul>}
    {children}
    <details className="pipeline-detail">
      <summary>Method details <ChevronDown size={15} aria-hidden="true" /></summary>
      <p>{stage.detail}</p>
      {stage.id === 'pipeline-sources' && <Link to="/#sources">View source registry <ArrowRight size={14} aria-hidden="true" /></Link>}
    </details>
  </section>
}

const percent = (value: number) => `${(value * 100).toFixed(1)}%`
const topRule = apriori.rules[0]
const modelResults: Record<string, string> = {
  PCA: `The first two axes explain ${percent(pca.explained_variance_ratio[0] + pca.explained_variance_ratio[1])} of variance across ${pca.n_cases} standardized profiles.`,
  'K-Means': `${kmeans.k} clusters, silhouette ${kmeans.silhouette.toFixed(3)}. Two clusters each contain one extreme profile.`,
  'Hierarchical clustering': `Ward clustering matched the K-Means partition on ${hierarchical.n_cases} profiles (adjusted Rand index ${hierarchical.adjusted_rand_vs_kmeans.toFixed(2)}).`,
  Apriori: `${apriori.rules.length} rules across ${apriori.n_cases} profiles. For the 2021 supply-chain event → no slowdown and high volatility, support was ${percent(topRule.support)}, confidence ${percent(topRule.confidence)}, and lift ${topRule.lift.toFixed(2)}×. The rule describes co-occurrence.`,
  'Isolation Forest': `${isolation.outlier_count} of ${isolation.n_cases} profiles flagged for review.`,
}
const classifiers = [
  ['Majority baseline', forest.dummy_accuracy_mean, forest.dummy_accuracy_folds],
  ['K-nearest neighbors', knn.cv_accuracy_mean, knn.cv_accuracy_folds],
  ['Logistic regression', logistic.cv_accuracy_mean, logistic.cv_accuracy_folds],
  ['Random Forest', forest.cv_accuracy_mean, forest.cv_accuracy_folds],
] as const

function ModelPurposeGrid() {
  return <div className="pipeline-models">
    <h3>Model evaluation gallery</h3>
    <p>Accuracy across three held-out country–industry folds, covering {forest.n_cases} historical cases and {forest.n_groups} groups. Each fold fits preprocessing and the majority baseline on training data. A slowdown means the impact mean YoY growth was below the baseline mean.</p>
    <EvidenceTable columns={['Classifier', 'Mean accuracy', 'Fold 1', 'Fold 2', 'Fold 3']}
      rows={classifiers.map(([name, mean, folds]) => [name, percent(mean), ...folds.map(percent)])} />
    <p className="muted">The same events occur across folds. Accuracy on an unseen event remains untested.</p>
    <div className="pipeline-grid">
      {models.map(model => <details className="pipeline-node pipeline-model" key={model.name}>
        <summary><span>{model.name}{'candidate' in model && <small>Candidate method</small>}</span><ChevronDown size={15} aria-hidden="true" /></summary>
        <p>{model.purpose}</p>
        <p><strong>Output</strong> · {model.output}</p>
        {modelResults[model.name] && <p>{modelResults[model.name]}</p>}
        {'to' in model && model.to ? <Link to={model.to}>{model.surface} <ArrowRight size={14} aria-hidden="true" /></Link> : <p>{model.surface}</p>}
      </details>)}
    </div>
  </div>
}

const relationships = {
  fact_production: 'Primary key (country, industry_code, month). One row per observed monthly YoY production value. Country, industry, month and the source pair are foreign keys.',
  dim_country: 'Primary key country. One row per reporting country.',
  dim_industry: 'Primary key industry_code. One row per manufacturing division with approximate national crosswalks.',
  dim_date: 'Primary key month. One row per calendar month with quarter and year.',
  dim_source: 'Primary key (country, industry_code). One pinned series per pair, with publisher, units, download URL, snapshot fingerprint and vintage where available.',
  dim_event: 'Primary key event. One row per expanded research event.',
  bridge_event_month: 'Primary key (event, month). Foreign keys point to the event and date dimensions. A month may belong to multiple events.',
}

function EvidenceTable({ columns, rows }: { columns: string[]; rows: (string | number | null)[][] }) {
  return <div className="pipeline-table" tabIndex={0} role="region" aria-label={columns.join(', ')}>
    <table><thead><tr>{columns.map(column => <th scope="col" key={column}>{column.replaceAll('_', ' ')}</th>)}</tr></thead>
      <tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell ?? '—'}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

function WarehouseSchema() {
  const [table, setTable] = useState<keyof typeof relationships>('fact_production')
  return <>
    <p>{warehouse.observed.toLocaleString()} observed production values across {warehouse.expected.toLocaleString()} expected series-month slots. Event windows join through the calendar, so the same production observation can serve multiple studies.</p>
    <label className="field"><span>Inspect a warehouse table</span>
      <select value={table} onChange={event => setTable(event.target.value as keyof typeof relationships)}>
        {Object.keys(relationships).map(name => <option key={name}>{name}</option>)}
      </select>
    </label>
    <p>{relationships[table]}</p>
    <EvidenceTable columns={['Column', 'DuckDB type']} rows={warehouse.schema.filter(([name]) => name === table).map(([, name, type]) => [name, type])} />
  </>
}

const queries = {
  quality: 'Country distributions and missing months',
  'series-coverage': 'Coverage by country and industry',
  outliers: 'Largest within-series IQR outliers',
  slice: 'Slice · 2022 energy-surge impact',
  dice: 'Dice · India and US food and motor vehicles',
  'drill-down': 'Drill-down · India motor-vehicle months in the 2022 energy-surge impact',
  'roll-up': 'Roll-up · India motor-vehicle quarters and annual total',
}

function WarehouseQueries() {
  return <>
    <h3>Data quality and OLAP</h3>
    <p>Results use the expanded research windows. Means weight each observed industry-month equally. The annual roll-up uses all observed months in 2022. IQR fences flag observations for review and retain them in the warehouse.</p>
    {Object.entries(queries).map(([id, label]) => {
      const { columns, rows, sql } = warehouse.queries[id as keyof typeof queries]
      return <details className="pipeline-node" key={id}>
        <summary>{label}</summary>
        {id === 'roll-up' && <p>A blank quarter marks the annual total.</p>}
        {id === 'outliers' && <p>The eight most extreme readings by distance beyond the nearest quartile in IQR units.</p>}
        <EvidenceTable columns={columns} rows={rows} />
        <details><summary>View DuckDB SQL</summary><pre className="pipeline-sql"><code>{sql}</code></pre></details>
      </details>
    })}
  </>
}

function PipelineNav() {
  return <nav className="card pipeline-nav" aria-label="On this page">
    {stages.map(stage => <a href={'#' + stage.id} key={stage.id}>{stage.nav}</a>)}
  </nav>
}

export function Pipeline() {
  return <>
    <PipelineHero />
    <div className="pipeline-layout">
      <PipelineNav />
      <div className="pipeline-flow">
        {stages.map(stage => <div className="pipeline-step" key={stage.id}>
          <PipelineStageCard stage={stage}>
            {stage.id === 'pipeline-warehouse' && <><WarehouseSchema /><WarehouseQueries /></>}
            {stage.id === 'pipeline-models' && <ModelPurposeGrid />}
            {stage.id === 'pipeline-outputs' && <div className="pipeline-grid">
              {outputs.map(output => <Link className="pipeline-node pipeline-output" key={output.title} to={output.to}>
                <output.icon size={18} aria-hidden="true" />
                <div><strong>{output.title}</strong><p>{output.description}</p></div>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>)}
            </div>}
          </PipelineStageCard>
          <div className="pipeline-connector" aria-hidden="true"><ArrowDown size={18} /></div>
        </div>)}
        <section className="card pipeline-summary">
          <h2>Pipeline summary</h2>
          <ol>
            {['Source data', 'Cleaned data', 'Warehouse', 'Features', 'Models', 'Insights'].map((label, index) =>
              <li key={label}>{index > 0 && <ArrowRight size={14} aria-hidden="true" />}{label}</li>)}
          </ol>
        </section>
      </div>
    </div>
  </>
}
