import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceArea, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  caseCountries, countries, events, getCase, industryName, period, range, timeline,
  value, windowNames, windows, type Case, type Event,
} from './data'
import {
  CardTitle, Filters, Methodology, Metrics, Select, SourceNote, StructuralResearch, query,
  selectedCountries, useSelection, type Selection,
} from './shared'

import { clusterName, considerations, insight, lowBaseSource } from './insights'
import { IndustryChanges, ShiftBars } from './overview'

const colors = { IND: '#126F8B', USA: '#E97661', DEU: '#7355a2', brent: '#936217' }
type Window = typeof windows[number] | 'all'
const allWindows: [string, string][] = [['all', 'All windows'], ...windows.map(w => [w, windowNames[w]] as [string, string])]

function TimelineCharts({ selection, event, window }: { selection: Selection; event: Event; window: Window }) {
  const data = timeline(event, selection.industry).filter(row => window === 'all' ||
    (row.month >= event[`${window}_start`] && row.month <= event[`${window}_end`]))
  const countryList = selectedCountries(selection)
  const production = data.some(row => countryList.some(country => row[country] !== null))
  return <div className="chart-grid">
    <section className="card chart-card">
      <CardTitle title="When did growth change?" detail={`${industryName(selection.industry)} · Growth versus the same month a year earlier (%)`} />
      <p className="chart-period">{data.length ? range(data[0].month, data[data.length - 1].month) : 'No observed months'}</p>
      {production ? <ResponsiveContainer width="100%" height={280} minWidth={0}>
        <LineChart data={data} margin={{ right: 12, left: -10, top: 8 }}>
          {window === 'all' && <ReferenceArea x1={event.impact_start} x2={event.impact_end} fill="#49BED4" fillOpacity={0.15} />}
          <CartesianGrid stroke="#E6EAED" vertical={false} />
          <XAxis dataKey="month" tickFormatter={period} tickMargin={8} minTickGap={28} tick={{ fontSize: 11 }} />
          <YAxis unit="%" tick={{ fontSize: 11 }} />
          <ReferenceLine y={0} stroke="#64717C" strokeDasharray="4 4" />
          <Tooltip labelFormatter={month => period(String(month))} formatter={n => value(Number(n), '%', false)} />
          <Legend />
          {countryList.map(country => <Line key={country} dataKey={country} name={countries[country]}
            stroke={colors[country]} dot={data.filter(row => row[country] !== null).length <= 1} strokeWidth={2.5} connectNulls={false} isAnimationActive={false} />)}
        </LineChart>
      </ResponsiveContainer> : <p className="empty">No production observations for this period.</p>}
      {window === 'all' && <p className="muted">Shaded area shows the impact window.</p>}
      <footer>{countryList.map(country => {
        const row = getCase(selection.event, selection.industry, country)
        return row && <SourceNote key={country} id={row.source_id} />
      })}</footer>
    </section>
    <section className="card chart-card">
      <CardTitle title="Brent spot price" detail="Monthly nominal USD per barrel" />
      <p className="chart-period">{data.length ? range(data[0].month, data[data.length - 1].month) : 'No observed months'}</p>
      {data.some(row => row.brent !== null) ? <ResponsiveContainer width="100%" height={280} minWidth={0}>
        <LineChart data={data} margin={{ right: 12, left: -10, top: 8 }}>
          {window === 'all' && <ReferenceArea x1={event.impact_start} x2={event.impact_end} fill="#F5B89B" fillOpacity={0.24} />}
          <CartesianGrid stroke="#E6EAED" vertical={false} />
          <XAxis dataKey="month" tickFormatter={period} tickMargin={8} minTickGap={28} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={n => '$' + n} tick={{ fontSize: 11 }} />
          <Tooltip labelFormatter={month => period(String(month))} formatter={n => value(Number(n), 'USD/bbl', false)} />
          <Legend />
          <Line dataKey="brent" name="Brent" stroke={colors.brent} dot={false} strokeWidth={2.5} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer> : <p className="empty">Brent data is unavailable for this period.</p>}
      <p className="muted">Brent shows what happened to oil prices over the same period.</p>
      <footer><SourceNote id="BRENT" /></footer>
    </section>
  </div>
}

function WindowComparison({ rows, labels }: { rows: (Case | undefined)[]; labels: string[] }) {
  const data = windows.map(w => ({
    name: ({baseline: 'Before', impact: 'During', followup: 'After'})[w],
    ...Object.fromEntries(rows.map((row, i) => [i.toString(), row?.[`${w}_growth_pct`] ?? null])),
  }))
  return <div className="chart-card">
    {rows.some(row => row?.impact_growth_pct != null) ? <ResponsiveContainer width="100%" height={230} minWidth={0}>
      <BarChart data={data} margin={{ top: 8, left: -14, right: 6 }}>
        <CartesianGrid stroke="#E6EAED" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis unit="%" tick={{ fontSize: 11 }} />
        <ReferenceLine y={0} stroke="#64717C" />
        <Tooltip formatter={n => value(Number(n), '%', false)} />
        <Legend />
        {labels.map((label, i) => <Bar key={i} dataKey={i.toString()} name={label}
          fill={rows[i] && (i === 0 || rows[i]?.country !== rows[0]?.country)
            ? colors[rows[i]!.country] : '#64717C'} isAnimationActive={false} />)}
      </BarChart>
    </ResponsiveContainer> : <p className="empty">Insufficient coverage to chart window means.</p>}
    <footer>{rows.map((row, i) => row && <SourceNote key={i} id={row.source_id} />)}</footer>
  </div>
}

function Stories({ rows, event, role }: { rows: (Case | undefined)[]; event: Event; role?: string }) {
  return <div className="auto-grid">{rows.map(row => {
    const story = insight(row)
    if (!row || !story) return null
    return <article className="card finding" key={row.country}>
      <p className="muted">{countries[row.country]} · {industryName(row.industry)}</p>
      <h3>{story.extreme ? 'An unusually large observation affects this comparison' : story.title}</h3>
      {story.extreme ? <>
        <p>{story.warning}</p>
        <details><summary>Inspect original growth figures</summary><p>{story.beforeAfter} Change during the event: {value(row.growth_shift_pp)}.</p>
          {row.country === 'IND' && row.industry === '29' && <a href={lowBaseSource}>MoSPI’s lockdown comparison note</a>}
        </details>
      </> : <>
        <p>{story.beforeAfter || `The window contains ${row.coverage.impact} of ${row.expected.impact} impact months.`}</p>
        {story.low && <p>{story.low}</p>}
        {story.position && <p className="muted">{story.position}</p>}
      </>}
      {story.profile && <p className="muted">Similar historical profiles: {clusterName(story.profile.cluster).toLowerCase()}.</p>}
      {!role && row.eligible && !story.extreme && <p className="muted">
        {row.followup_shift_pp == null ? 'Use this window for a short-term production scenario. Follow-up evidence is limited.' :
          'Use the before, during and after periods to stress-test how long a production change could last.'}
      </p>}
      <details><summary>Evidence and coverage</summary>
        <p>{range(event.impact_start, event.impact_end)} · Observed months before, during and after: {story.evidence}.</p>
        <SourceNote id={row.source_id} />
      </details>
      {role && <div className="business-notes"><h3>What should you watch?</h3>
        <ul>{considerations(row, role).map(text => <li key={text}>{text}</li>)}</ul>
      </div>}
    </article>
  })}</div>
}

function ChangeChart({ rows }: { rows: (Case | undefined)[] }) {
  return <section className="card finding">
    <CardTitle title="What moved most?" detail="Changes in annual growth, measured in percentage points." />
    {rows.map(row => {
      const story = insight(row)
      return row && story && <div className="finding" key={row.country}>
        <h3>{countries[row.country]}</h3>
        {story.extreme ? <p>{story.warning} See the original figures above.</p> : <>
          <ShiftBars rows={story.shifts.map(item => ({ ...item, id: item.name }))} />
          {story.biggest && <p>{story.biggest.name} had the largest change ({value(story.biggest.shift)}).
            {story.stable && ` Growth changed less ${story.stable.name.toLowerCase()} (${value(story.stable.shift)}).`}</p>}
        </>}
      </div>
    })}
  </section>
}
function CountryChanges({ selection }: { selection: Selection }) {
  return <div className="finding"><CardTitle title="How does growth compare across countries?"
    detail="Change in the annual growth rate, in percentage points." />
      <ShiftBars rows={caseCountries(selection.event).flatMap(country => {
        const row = getCase(selection.event, selection.industry, country)
        return row?.growth_shift_pp == null || insight(row)?.extreme ? [] :
          [{ name: countries[country], id: country, shift: row.growth_shift_pp }]
      })} />
    <p className="muted">Cases with missing or unusually large observations can be inspected in the evidence and comparison sections.</p>
  </div>
}

function Comparison({ selection }: { selection: Selection }) {
  const [override, setOverride] = useState<Selection | null>(null)
  const first = selectedCountries(selection)[0]
  const a = { ...selection, country: first }
  const defaultB: Selection = { ...selection, country: first === 'IND' ? 'USA' : 'IND' }
  const b = override ?? defaultB
  const rows = [getCase(a.event, a.industry, first), getCase(b.event, b.industry, selectedCountries(b)[0])]
  const comparable = a.event === b.event && (a.industry === b.industry || a.country === b.country) ||
    a.industry === b.industry && a.country === b.country
  const shifts = rows.map(row => row?.growth_shift_pp)
  const difference = comparable && shifts[0] != null && shifts[1] != null ? shifts[0] - shifts[1] : null
  const label = (s: Selection) => `${countries[selectedCountries(s)[0]]} · ${industryName(s.industry)} · ${events.find(e => e.event_id === s.event)?.event}`
  const comparisonEvents = [a, b].map(item => events.find(e => e.event_id === item.event)!)
  return <section id="case-comparison" className="card">
    <CardTitle title="Compare two cases" detail="Case A follows the main filters. Choose any supported Case B." />
    <div className="filter-grid"><Filters selection={b} update={setOverride} allowCompare={false} /></div>
    <div className="auto-grid compare-pair">{[a, b].map((s, i) => <article key={i}>
      <h3>Case {i === 0 ? 'A' : 'B'} · {label(s)}</h3>
      <p className="muted">{range(comparisonEvents[i].impact_start, comparisonEvents[i].impact_end)}</p>
      <strong>{value(shifts[i])}</strong> impact shift
      <p className="muted">Follow-up shift {value(rows[i]?.followup_shift_pp)}</p>
    </article>)}</div>
    {comparable && <WindowComparison rows={rows} labels={['Case A', 'Case B']} />}
    <p>{difference !== null ? `Case A minus Case B change in growth: ${value(difference)}.` : comparable
      ? 'Insufficient data to calculate a difference.' : 'Keep the same industry and event, or change only industry or shock within one country, to calculate a difference.'}</p>
    {(a.event !== b.event || rows.some(row => row?.status === 'partial')) &&
      <p className="muted">The estimates use the observed months within each case’s configured windows. Check coverage and dates before interpreting the difference.</p>}
  </section>
}

export function CaseStudies() {
  const [selection, update] = useSelection('compare')
  const [window, setWindow] = useState<Window>('all')
  const event = events.find(e => e.event_id === selection.event)!
  const rows = selectedCountries(selection).map(country => getCase(selection.event, selection.industry, country))
  return <>
    <header className="page-header"><h1>Case Study Analysis</h1><p>Explore how industries responded to economic shocks.</p></header>
    <section aria-label="Case study filters" className="card filter-grid">
      <Filters selection={selection} update={next => { if (next.event !== selection.event) setWindow('all'); update(next) }}>
        <Select label="Chart period" value={window} options={allWindows.filter(([id]) => id !== 'followup' || event.followup_start)} change={v => setWindow(v as Window)} />
      </Filters>
    </section>
    <Stories rows={rows} event={event} />
    <section className="card"><CardTitle title="How did growth change before, during and after?" detail="Average annual growth rate in each period." />
      <WindowComparison rows={rows} labels={selectedCountries(selection).map(c => countries[c])} />
    </section>
    <ChangeChart rows={rows} />
    <section className="card"><CountryChanges selection={selection} /></section>
    <section className="card"><IndustryChanges selection={selection} onSelect={industry => update({ ...selection, industry })} /></section>
    {event.event_id.includes('tariff') && <p className="muted">These charts show production during the tariff window. An aligned industry-level duties and import series is unavailable. <a href="https://www.usitc.gov/applications/dataweb/about">USITC DataWeb</a></p>}
    <details className="card finding"><summary>Explore monthly production and oil prices</summary>
      <TimelineCharts selection={selection} event={event} window={window} />
    </details>
    <details className="card finding"><summary>View figures and event notes</summary>
      <p className="muted">{event.status} · {event.notes}</p><Metrics rows={rows} event={event} />
    </details>
    <Comparison selection={selection} />
    <StructuralResearch />
    <Methodology />
  </>
}

export function Calculator() {
  const [selection, update] = useSelection('IND')
  const [submitted, setSubmitted] = useState(selection)
  const [role, setRole] = useState('manufacturer')
  const changed = query(submitted) !== query(selection)
  const event = events.find(e => e.event_id === submitted.event)!
  const chosen = selectedCountries(submitted)
  const rows = chosen.map(country => getCase(submitted.event, submitted.industry, country))
  return <>
    <header className="page-header"><h1>Industry Risk Calculator</h1><p>Explore exposure using historical production evidence.</p></header>
    <form className="card filter-grid" onSubmit={e => { e.preventDefault(); setSubmitted(selection) }}>
      <Filters selection={selection} update={update}>
        <Select label="Business role (context only)" value={role} options={[
          ['manufacturer', 'Manufacturer'], ['supplier', 'Supplier / vendor'],
          ['distributor', 'Distributor'], ['investor', 'Investor'], ['researcher', 'Industry researcher'],
        ]} change={setRole} />
      </Filters>
      <button className="button primary self-end" type="submit">Analyze exposure <ArrowRight size={16} /></button>
      {changed && <p className="muted col-span-full">Analyze exposure to update the results below.</p>}
    </form>
    <section className="card feature" aria-live="polite">
      <p>{event.event} · {range(event.impact_start, event.impact_end)}</p>
      <h2>{industryName(submitted.industry)}</h2>
      <p>Historical exposure describes how industry production growth behaved during this event.</p>
      <Link className="button" to={`/case-studies?${query(submitted)}`}>View supporting case study <ArrowRight size={16} /></Link>
    </section>
    <Stories rows={rows} event={event} role={role} />
    <section className="card"><CardTitle title="What changed before, during and after?" detail="Average annual production growth in each period." />
      <WindowComparison rows={rows} labels={chosen.map(country => countries[country])} />
    </section>
    <ChangeChart rows={rows} />
    <section className="card finding"><CountryChanges selection={submitted} />
      <IndustryChanges selection={submitted} />
    </section>
    <details className="card finding"><summary>Technical details and monthly coverage</summary><Metrics rows={rows} event={event} /></details>
    <Methodology />
  </>
}
