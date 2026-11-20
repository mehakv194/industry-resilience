import { ArrowDownRight, ArrowRight, ArrowUpRight, ChartNoAxesCombined, Factory, Globe2, Waves } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  activeEvents, cases, countries, coverage, delta, events, findings, getCase, industries,
  industryName, period, range, readyCases, sources, value, windowNames, windows,
  type Case, type Country, type Event,
} from './data'

export type Selection = { event: string; industry: string; country: Country | 'compare' }
export const query = (selection: Selection) => new URLSearchParams(selection).toString()
export const selectedCountries = (selection: Selection): Country[] =>
  selection.country === 'compare' ? ['IND', 'USA'] : [selection.country]

export function useSelection(defaultCountry: Selection['country']) {
  const [params, setParams] = useSearchParams()
  const country = params.get('country')
  const selection: Selection = {
    country: country === 'IND' || country === 'USA' || country === 'compare' ? country : defaultCountry,
    event: activeEvents.find(event => event.event_id === params.get('event'))?.event_id
      ?? activeEvents[0]?.event_id ?? events[0].event_id,
    industry: industries.find(item => item.industry_id === params.get('industry'))?.industry_id ?? 'autos',
  }
  return [selection, (next: Selection) => setParams(query(next), { replace: true })] as const
}

export function Select({ label, value, options, change }: {
  label: string; value: string; options: readonly [string, string][]; change: (value: string) => void
}) {
  return <label className="field"><span>{label}</span>
    <select value={value} onChange={e => change(e.target.value)}>
      {options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
    </select>
  </label>
}

export function Filters({ selection, update, children, allowCompare = true }: {
  selection: Selection; update: (selection: Selection) => void; children?: ReactNode; allowCompare?: boolean
}) {
  return <>
    <Select label="Economic shock" value={selection.event} options={activeEvents.map(e => [e.event_id, e.event])}
      change={event => update({ ...selection, event })} />
    <Select label="Manufacturing industry" value={selection.industry} options={industries.map(i => [i.industry_id, i.industry])}
      change={industry => update({ ...selection, industry })} />
    <Select label="Country" value={selection.country} options={allowCompare
      ? [['compare', 'Compare India & US'], ...Object.entries(countries)] : Object.entries(countries)}
      change={country => update({ ...selection, country: country as Selection['country'] })} />
    {children}
  </>
}

export function SourceNote({ id }: { id: string }) {
  const source = sources.find(item => item.source_id === id)
  if (!source) return <span className="muted">Source unavailable</span>
  return <a className="source" href={source.source_url} title={source.series_id} target="_blank" rel="noreferrer">
    {source.source_id.startsWith('IND_') ? 'MoSPI IIP' : source.series_id} <ArrowUpRight size={13} />
  </a>
}

export function Methodology() {
  return <section id="methodology" className="card method">
    <details><summary>Methodology and limitations</summary>
      <p>Each window averages monthly year-over-year production growth and requires at least 10 of 12 observations. Growth shift is impact minus baseline, in percentage points. Follow-up shift is follow-up minus impact. Rankings compare ready cases within a country and shock.</p>
      <p>India uses published IIP growth. US values use Federal Reserve index levels from the same month a year apart. Industry definitions differ, especially for chemicals and motor vehicles. The 2022 baseline includes pandemic rebound. Brent provides oil-price context and the results describe observed changes.</p>
      <a href="https://doi.org/10.1007/s00168-024-01261-6">Maroto Sánchez and Cuadrado-Roura</a>
      {' · '}<a href="https://doi.org/10.1093/jeg/lbu015">Martin and Sunley</a>
      {' · '}<a href="https://doi.org/10.1257/aer.99.3.1053">Kilian</a>
    </details>
    <details id="sources"><summary>Data sources and exact series</summary>
      <ul className="source-list">{sources.map(s => <li key={s.source_id}>
        <a href={s.source_url}>{s.series_id}</a>
        <span>{s.publisher} · {s.distributor} · {s.unit_raw}
          {'vintage' in s && s.vintage ? ` · vintage ${s.vintage}` : ''}
          {s.first_month && s.last_month ? ` · ${range(s.first_month, s.last_month)}` : ' · Unavailable'}
        </span>
        <a href={s.download_url}>Source download</a>
      </li>)}</ul>
    </details>
  </section>
}

export function CardTitle({ title, detail }: { title: string; detail?: string }) {
  return <div className="card-title"><h2>{title}</h2>{detail && <p>{detail}</p>}</div>
}

export function Metrics({ rows, event }: { rows: (Case | undefined)[]; event: Event }) {
  return <div className="auto-grid">{rows.map((row, i) => <article className="card metric" key={row?.country ?? i}>
    <div className="flex items-center justify-between gap-3">
      <h3>{row ? countries[row.country] : 'No case'}</h3>
      <span className={row?.status === 'ready' ? 'status ready' : 'status'}>{row?.status ?? 'unavailable'}</span>
    </div>
    <div className="metric-number">{value(row?.growth_shift_pp)}</div>
    <p className="muted">Impact shift in YoY growth</p>
    <dl>{windows.map(window => <div key={window}>
      <dt title={range(event[`${window}_start`], event[`${window}_end`])}>{windowNames[window]} <small>{row?.coverage[window] ?? 0}/12</small></dt>
      <dd>{value(row?.[`${window}_growth_pct`], '%', false)}</dd>
    </div>)}
      <div><dt>Follow-up shift</dt><dd>{value(row?.followup_shift_pp)}</dd></div>
      <div><dt>Weakest 3-month mean</dt><dd>{value(row?.weakest_3mo_growth_pct, '%', false)}</dd></div>
      <div><dt>Industry rank</dt><dd>{row?.rank_within_country_event ? `${row.rank_within_country_event} of ${row.compared_industries_n}` : 'Unavailable'}</dd></div>
    </dl>
    {row?.status !== 'ready' && <p className="muted">At least 10 observations per window are required.</p>}
    {row && <SourceNote id={row.source_id} />}
  </article>)}</div>
}

export function Overview() {
  const [selection, update] = useSelection('IND')
  const scope = [
    ['Countries', new Set(readyCases.map(row => row.country)).size, Globe2],
    ['Industries', new Set(readyCases.map(row => row.industry)).size, Factory],
    ['Economic shocks', activeEvents.length, Waves],
    ['Production coverage', coverage[0] && coverage[1] ? `${period(coverage[0])} – ${period(coverage[1])}` : 'Unavailable', ChartNoAxesCombined],
  ] as const
  const highlights = activeEvents.flatMap(event => findings.filter(f => f.event_id === event.event_id)
    .sort((a, b) => Math.abs(b.india_minus_us_growth_shift_pp ?? 0) - Math.abs(a.india_minus_us_growth_shift_pp ?? 0)).slice(0, 1))
  return <>
    <header className="hero">
      <h1>Understanding<br />industry resilience.</h1>
      <p>How industries respond to economic shocks, across countries and time.</p>
      <div className="flex flex-wrap gap-3"><Link className="button primary" to="/case-studies">Explore case studies <ArrowRight size={17} /></Link>
        <Link className="button" to="/calculator">Risk calculator</Link></div>
    </header>
    <section aria-label="Research scope" className="scope-grid">{scope.map(([label, stat, Icon]) => <article key={label} className="card scope">
      <Icon size={18} /><span>{label}</span><strong>{stat}</strong>
    </article>)}</section>
    <section><CardTitle title="Key findings" detail="Largest absolute India–US growth-shift gap in each shock" />
      <div className="auto-grid">{highlights.map((row, i) => {
        const event = events.find(e => e.event_id === row.event_id)!
        const india = getCase(row.event_id, row.industry, 'IND')
        const us = getCase(row.event_id, row.industry, 'USA')
        return <article className={i === 0 ? 'card feature' : 'card finding'} key={row.event_id}>
          <p>{event.event}</p><h3>{industryName(row.industry)}</h3>
          <div className="metric-number">{value(row.india_minus_us_growth_shift_pp)}</div>
          <p>India minus US impact growth shift</p>
          <p>Baseline mean YoY growth: {value(india?.baseline_growth_pct, '%', false)} in India and {value(us?.baseline_growth_pct, '%', false)} in the US.</p>
          <Link to={`/case-studies?${query({ event: row.event_id, industry: row.industry, country: 'compare' })}`}>View analysis <ArrowRight size={16} /></Link>
        </article>
      })}</div>
    </section>
    <section><CardTitle title="Case studies" /><div className="auto-grid">{activeEvents.map(event => <article className="card finding" key={event.event_id}>
      <p className="muted">{range(event.impact_start, event.impact_end)}</p><h3>{event.event}</h3>
      <p>How did growth shift during this window across {new Set(cases.filter(c => c.event_id === event.event_id && c.status === 'ready').map(c => c.industry)).size} industries?</p>
      <Link className="source" to={`/case-studies?${query({ ...selection, event: event.event_id, country: 'compare' })}`}>Explore case study <ArrowUpRight size={16} /></Link>
    </article>)}</div></section>
    <section className="card"><CardTitle title="How resilient is your industry?" detail="Explore historical exposure to economic shocks." />
      <div className="filter-grid"><Filters selection={selection} update={update} />
        <Link className="button primary self-end" to={`/calculator?${query(selection)}`}>Analyze exposure <ArrowRight size={16} /></Link>
      </div>
    </section>
    <Methodology />
  </>
}

export function Insight({ selection }: { selection: Selection }) {
  const difference = delta(selection.event, selection.industry)
  return <aside className="card finding">
    <CardTitle title="Observed differences" />
    {selection.country === 'compare' && <p>{difference == null ? 'Insufficient data for a matched India–US comparison.' :
      `India minus US impact growth shift: ${value(difference)}.`}</p>}
    {selectedCountries(selection).map(country => {
      const row = getCase(selection.event, selection.industry, country)
      return <p className="insight-line" key={country}>
        {(row?.growth_shift_pp ?? 0) >= 0 ? <ArrowUpRight size={17} /> : <ArrowDownRight size={17} />}
        {row?.status === 'ready' ? `${countries[country]} ranked ${row.rank_within_country_event} of ${row.compared_industries_n}. Mean YoY growth shifted ${value(row.followup_shift_pp)} from impact to follow-up.` :
          `${countries[country]} has insufficient window coverage.`}
      </p>
    })}
  </aside>
}
