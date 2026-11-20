import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceArea, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  cases, countries, delta, events, getCase, industries, industryName, period, range, timeline,
  value, windowNames, windows, type Case, type Event,
} from './data'
import {
  CardTitle, Filters, Insight, Methodology, Metrics, Select, SourceNote, query,
  selectedCountries, useSelection, type Selection,
} from './shared'

const colors = { IND: '#126F8B', USA: '#E97661', brent: '#936217' }
type Window = typeof windows[number] | 'all'
const allWindows: [string, string][] = [['all', 'All windows'], ...windows.map(w => [w, windowNames[w]] as [string, string])]

function TimelineCharts({ selection, event, window }: { selection: Selection; event: Event; window: Window }) {
  const data = timeline(event, selection.industry).filter(row => window === 'all' ||
    (row.month >= event[`${window}_start`] && row.month <= event[`${window}_end`]))
  const countryList = selectedCountries(selection)
  const production = data.some(row => countryList.some(country => row[country] !== null))
  return <div className="chart-grid">
    <section className="card chart-card">
      <CardTitle title="Manufacturing growth" detail={`${industryName(selection.industry)} · Monthly YoY growth (%)`} />
      <p className="chart-period">{range(data[0].month, data[data.length - 1].month)}</p>
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
            stroke={colors[country]} dot={false} strokeWidth={2.5} connectNulls={false} isAnimationActive={false} />)}
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
      <p className="chart-period">{range(data[0].month, data[data.length - 1].month)}</p>
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
      <footer><SourceNote id="BRENT" /></footer>
    </section>
  </div>
}

function WindowComparison({ rows, labels }: { rows: (Case | undefined)[]; labels: string[] }) {
  const data = windows.map(w => ({
    name: windowNames[w],
    a: rows[0]?.[`${w}_growth_pct`] ?? null,
    b: rows[1]?.[`${w}_growth_pct`] ?? null,
  }))
  return <div className="chart-card">
    {data.some(row => row.a !== null || row.b !== null) ? <ResponsiveContainer width="100%" height={230} minWidth={0}>
      <BarChart data={data} margin={{ top: 8, left: -14, right: 6 }}>
        <CartesianGrid stroke="#E6EAED" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis unit="%" tick={{ fontSize: 11 }} />
        <ReferenceLine y={0} stroke="#64717C" />
        <Tooltip formatter={n => value(Number(n), '%', false)} />
        <Legend />
        <Bar dataKey="a" name={labels[0]} fill={rows[0] ? colors[rows[0].country] : colors.IND} isAnimationActive={false} />
        {labels[1] && <Bar dataKey="b" name={labels[1]} fill={rows[1]?.country === rows[0]?.country ? '#64717C' :
          rows[1] ? colors[rows[1].country] : colors.USA} isAnimationActive={false} />}
      </BarChart>
    </ResponsiveContainer> : <p className="empty">Insufficient coverage to chart window means.</p>}
    <footer>{rows.map((row, i) => row && <SourceNote key={i} id={row.source_id} />)}</footer>
  </div>
}

function Ranking({ selection }: { selection: Selection }) {
  return <section className="card">
    <CardTitle title="Industry rankings" detail="Impact growth shift, highest first within each country" />
    <div className="auto-grid">{selectedCountries(selection).map(country => {
      const rows = cases.filter(row => row.event_id === selection.event && row.country === country)
        .sort((a, b) => (a.rank_within_country_event ?? 99) - (b.rank_within_country_event ?? 99))
      return <table key={country}><caption>{countries[country]} · {rows.filter(r => r.status === 'ready').length} of {industries.length} ranked</caption>
        <thead><tr><th scope="col">Rank</th><th scope="col">Industry</th><th scope="col">Shift</th><th scope="col">Status</th></tr></thead>
        <tbody>{rows.map(row => <tr className={row.industry === selection.industry ? 'selected-row' : ''} key={row.industry}>
          <td>{row.rank_within_country_event ?? '—'}</td><th scope="row">{industryName(row.industry)}</th>
          <td>{value(row.growth_shift_pp)}</td><td>{row.status}</td>
        </tr>)}</tbody>
      </table>
    })}</div>
  </section>
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
  return <section className="card">
    <CardTitle title="Compare two cases" detail="Case A follows the main filters. Choose any supported Case B." />
    <div className="filter-grid"><Filters selection={b} update={setOverride} allowCompare={false} /></div>
    <div className="auto-grid compare-pair">{[a, b].map((s, i) => <article key={i}>
      <h3>Case {i === 0 ? 'A' : 'B'} · {label(s)}</h3>
      <p className="muted">{range(comparisonEvents[i].impact_start, comparisonEvents[i].impact_end)}</p>
      <strong>{value(shifts[i])}</strong> impact shift
      <p className="muted">Follow-up shift {value(rows[i]?.followup_shift_pp)}</p>
    </article>)}</div>
    <WindowComparison rows={rows} labels={['Case A', 'Case B']} />
    <p>{difference !== null ? `Case A minus Case B impact shift: ${value(difference)}.` : comparable
      ? 'Insufficient data to calculate a difference.' : 'Keep the same industry and event, or change only industry or shock within one country, to calculate a difference.'}</p>
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
      <Filters selection={selection} update={update}>
        <Select label="Chart period" value={window} options={allWindows} change={v => setWindow(v as Window)} />
      </Filters>
    </section>
    <Metrics rows={rows} event={event} />
    <TimelineCharts selection={selection} event={event} window={window} />
    <Ranking selection={selection} />
    <Insight selection={selection} />
    <Comparison selection={selection} />
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
  const difference = delta(submitted.event, submitted.industry)
  return <>
    <header className="page-header"><h1>Industry Risk Calculator</h1><p>Explore exposure using historical production evidence.</p></header>
    <form className="card filter-grid" onSubmit={e => { e.preventDefault(); setSubmitted(selection) }}>
      <Filters selection={selection} update={update}>
        <Select label="Business role (context only)" value={role} options={[
          ['manufacturer', 'Manufacturer'], ['supplier', 'Supplier / vendor'],
          ['distributor', 'Distributor'], ['researcher', 'Industry researcher'],
        ]} change={setRole} />
      </Filters>
      <button className="button primary self-end" type="submit">Analyze exposure <ArrowRight size={16} /></button>
      {changed && <p className="muted col-span-full">Analyze exposure to update the results below.</p>}
    </form>
    <section className="card feature" aria-live="polite">
      <p>{event.event} · {range(event.impact_start, event.impact_end)}</p>
      <h2>{industryName(submitted.industry)}</h2>
      <div className="result-values">{rows.map((row, i) => <div key={chosen[i]}>
        <strong className="metric-number">{value(row?.growth_shift_pp)}</strong><p>{countries[chosen[i]]} impact growth shift</p>
      </div>)}</div>
      <p>{difference == null ? 'Insufficient coverage for the matched country comparison.' :
        `India minus US impact growth shift: ${value(difference)}.`}</p>
      <Link className="button" to={`/case-studies?${query(submitted)}`}>View supporting case study <ArrowRight size={16} /></Link>
    </section>
    <Metrics rows={rows} event={event} />
    <section className="card"><CardTitle title="Growth across windows" detail="Mean monthly year-over-year production growth (%)" />
      <WindowComparison rows={rows} labels={chosen.map(country => countries[country])} />
    </section>
    <Insight selection={submitted} />
    <p className="muted">Historical industry data describes observed growth during the selected shock. Business role provides context only. These figures do not estimate future losses or firm-level survival.</p>
    <Methodology />
  </>
}
