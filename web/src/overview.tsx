import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis,
} from 'recharts'
import { countries, events, getCase, industryName, value, type Case } from './data'
import { clusterName, clusterPoints, discoveries, insight, patternSample, patterns, peers, performance, validationSample } from './insights'
import { CardTitle, Filters, Methodology, StructuralResearch, query, useSelection, type Selection } from './shared'

export function ShiftBars({ rows, selected, onSelect }: {
  rows: { name: string; shift: number; id: string }[]; selected?: string; onSelect?: (id: string) => void
}) {
  const scale = Math.max(1, ...rows.map(row => Math.abs(row.shift)))
  if (!rows.length) return <p className="empty">Too few observations to compare growth changes.</p>
  return <ul className="shift-bars">
    {rows.map(row => {
      const content = <><span>{row.name}</span>
        <span className="shift-track" aria-hidden="true"><i style={{
          width: Math.abs(row.shift) / scale * 50 + '%',
          left: (row.shift < 0 ? 50 - Math.abs(row.shift) / scale * 50 : 50) + '%',
          background: row.shift < 0 ? 'var(--coral)' : 'var(--teal)',
        }} /></span><strong>{value(row.shift)}</strong></>
      return <li key={row.id}>{onSelect
        ? <button type="button" className="shift-row" aria-pressed={selected === row.id} onClick={() => onSelect(row.id)}>{content}</button>
        : <div className="shift-row">{content}</div>}</li>
    })}
  </ul>
}

export function IndustryChanges({ selection, onSelect }: { selection: Selection; onSelect?: (id: string) => void }) {
  const country = selection.country === 'compare' ? 'IND' : selection.country
  const peerRows = peers(selection.event, country)
  const flagged = peerRows.filter(row => insight(row)?.extreme)
  const rows = peerRows.filter(row => !flagged.includes(row)).map(row => ({
    name: industryName(row.industry), shift: row.growth_shift_pp!, id: row.industry,
  }))
  const selected = getCase(selection.event, selection.industry, country)
  const story = insight(selected)
  return <div className="finding">
    <CardTitle title={`Which industries changed most in ${countries[country]}?`}
      detail="Bars show how much the growth rate changed, in percentage points." />
    <ShiftBars rows={rows} selected={selection.industry} onSelect={onSelect} />
    {!!flagged.length && <details><summary>Show unusually large observations ({flagged.length})</summary>
      <p className="muted">Shown separately so extreme observations do not flatten the main chart.</p>
      <ShiftBars rows={flagged.map(row => ({ name: industryName(row.industry), shift: row.growth_shift_pp!, id: row.industry }))}
        selected={selection.industry} onSelect={onSelect} />
    </details>}
    {story && <p><strong>{industryName(selection.industry)}.</strong> {story.warning || story.beforeAfter || story.title}</p>}
  </div>
}

function SimilarIndustries() {
  const [selected, setSelected] = useState(clusterPoints.find(p => p.event === 'energy_surge_2022' && p.country === 'DEU' && p.industry_code === '20')!)
  const clusters = [...new Set(clusterPoints.map(p => p.cluster))]
  const [showExceptional, setShowExceptional] = useState(false)
  const counts = clusters.map(cluster => clusterPoints.filter(p => p.cluster === cluster).length)
  const mainCluster = clusters[counts.indexOf(Math.max(...counts))]
  const pointName = (point: typeof selected) => `${countries[point.country as keyof typeof countries]} · ${industryName(point.industry_code)}`
  return <section id="profile-evidence" className="card finding">
    <CardTitle title="Which industries behaved similarly?" detail="Each dot is one country, industry and historical event. Select a dot to inspect its record." />
    <ResponsiveContainer width="100%" height={320} minWidth={0}>
      <ScatterChart margin={{ left: 12, bottom: 12, right: 16 }}>
        <CartesianGrid stroke="#E6EAED" />
        <XAxis type="number" dataKey="x" name="Profile axis 1" />
        <YAxis type="number" dataKey="y" name="Profile axis 2" />
        <Tooltip content={({ payload }) => {
          const point = payload?.[0]?.payload as typeof selected | undefined
          return point && <div className="card chart-tooltip"><strong>{pointName(point)}</strong>
            <p>{clusterName(point.cluster)} · {value(point.delta_pp)}</p></div>
        }} />
        {clusters.map((cluster, i) => (cluster === mainCluster || showExceptional) && <Scatter key={cluster} name={clusterName(cluster)}
          data={clusterPoints.filter(p => p.cluster === cluster)} fill={['#126F8B', '#E97661', '#7355a2'][i]}
          isAnimationActive={false} onClick={point => { if (point.payload) setSelected(point.payload as typeof selected) }} />)}
      </ScatterChart>
    </ResponsiveContainer>
    <label className="flex items-center gap-2"><input type="checkbox" checked={showExceptional}
      onChange={e => setShowExceptional(e.target.checked)} /> Show exceptional profiles on the chart</label>
    <p className="muted">{Math.max(...counts)} of {clusterPoints.length} profiles fell into one group. Two extreme India motor-vehicle profiles formed separate groups of one.</p>
    <label className="field"><span>Inspect a profile</span><select value={clusterPoints.indexOf(selected)} onChange={e => setSelected(clusterPoints[+e.target.value])}>
      {clusterPoints.map((p, i) => <option key={i} value={i}>{pointName(p)} · {events.find(e => e.event_id === p.event)?.event}</option>)}
    </select></label>
    <p><strong>{clusterName(selected.cluster)}.</strong> {pointName(selected)} changed by {value(selected.delta_pp)}, with monthly growth spread of {value(selected.shock_std_yoy, 'pp', false)} during the event.</p>
    <Link className="source" to={`/case-studies?${query({ event: selected.event, industry: selected.industry_code, country: selected.country as Selection['country'] })}`}>View the selected evidence <ArrowRight size={15} /></Link>
    <details><summary>Technical details</summary><p>Points use the first two PCA axes. Colors use the published K-Means assignments from five standardized features. Group labels describe average profiles. Exceptional growth observations can pull groups apart.</p></details>
  </section>
}

export function Overview() {
  const [selection, update] = useSelection('IND')
  return <>
    <header className="hero"><h1>How industries respond<br />when markets change.</h1>
      <p>Compare manufacturing growth across India, the United States and Germany during historical disruptions.</p>
    </header>
    <section><CardTitle title="What did we discover?" /><div className="auto-grid">
      {discoveries().map((finding, i) => <article className={i === 0 ? 'card feature' : 'card finding'} key={finding.title}>
        <h3>{finding.title}</h3><strong className="metric-number">{finding.number}</strong><p>{finding.text}</p>
        {finding.case ? <Link to={`/case-studies?${query({ country: finding.case.country, event: finding.case.event_id, industry: finding.case.industry })}`}>View evidence <ArrowRight size={15} /></Link>
          : <a className="source" href="#ai-evidence">View survey evidence <ArrowRight size={15} /></a>}
      </article>)}
    </div></section>
    <section className="card finding" aria-label="Biggest industry changes">
      <div className="filter-grid"><Filters selection={selection} update={update} allowCompare={false} /></div>
      <IndustryChanges selection={selection} onSelect={industry => update({ ...selection, industry })} />
      <Link className="source" to={`/case-studies?${query(selection)}`}>Open selected case study <ArrowRight size={15} /></Link>
    </section>
    <SimilarIndustries />
    <section id="slowdown-evidence" className="card finding">
      <CardTitle title="How well did the models spot slowdowns?" detail={`Accuracy on held-out country–industry groups across ${validationSample} historical cases`} />
      <ResponsiveContainer width="100%" height={200} minWidth={0}>
        <BarChart data={performance} layout="vertical" margin={{right: 12}}>
          <CartesianGrid stroke="#E6EAED" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} unit="%" /><YAxis type="category" dataKey="name" width={124} tick={{fontSize: 11}} />
          <Tooltip formatter={n => value(Number(n), '%', false)} />
          <Bar dataKey="accuracy" name="Held-out accuracy" fill="#126F8B" isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
      <p>Random Forest led the comparison by {value(performance[3].accuracy - performance[0].accuracy, 'pp', false)} over the majority baseline. The same shocks appeared across folds, so accuracy on a new shock remains untested.</p>
      <Link className="source" to="/pipeline#pipeline-models">View fold results <ArrowRight size={15} /></Link>
    </section>
    <section id="association-evidence" className="card finding">
      <CardTitle title="What tended to happen together?" detail={`Exploratory patterns across ${patternSample} observed cases`} />
      <ol className="patterns">{patterns.map(p => <li key={p.from + p.to}>
        <strong>{p.from} → {p.to}</strong><p>{value(p.confidence * 100, '%', false)} of cases matching the first description also matched the second.</p>
        <details><summary>Technical details</summary><p>Support {value(p.support * 100, '%', false)} · Confidence {value(p.confidence * 100, '%', false)} · Lift {p.lift.toFixed(2)}×. These patterns do not establish cause.</p></details>
      </li>)}</ol>
    </section>
    <section className="card finding"><CardTitle title="Explore your industry’s historical exposure" />
      <Link className="button primary" to={`/calculator?${query(selection)}`}>Analyze {industryName(selection.industry)} <ArrowRight size={16} /></Link>
      <p className="muted">Uses the country, industry and event selected above.</p>
    </section>
    <div id="ai-evidence"><StructuralResearch /></div>
    <Methodology />
  </>
}
