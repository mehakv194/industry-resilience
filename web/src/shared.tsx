import { ArrowDownRight, ArrowRight, ArrowUpRight, ChartNoAxesCombined, Factory, Globe2, Waves } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import dynamicResponse from '../../reports/research/models/dynamic_response.json'
import logistic from '../../reports/research/models/logistic_regression.json'
import forest from '../../reports/research/models/random_forest.json'
import knn from '../../reports/research/models/knn.json'
import {
  activeEvents, ai, caseCountries, caseIndustries, cases, countries, coverage, delta, events, findings, getCase,
  industryCode, industryName, isLegacy, period, range, readyCases, researchEvents, sources, value, windowNames, windows,
  type Case, type Country, type Event,
} from './data'

export type Selection = { event: string; industry: string; country: Country | 'compare' }
export const query = (selection: Selection) => new URLSearchParams(selection).toString()
export const selectedCountries = (selection: Selection): Country[] =>
  selection.country === 'compare' ? caseCountries(selection.event) : [selection.country]

export function useSelection(defaultCountry: Selection['country']) {
  const [params, setParams] = useSearchParams()
  const country = params.get('country')
  const event = activeEvents.find(item => item.event_id === params.get('event'))?.event_id ?? activeEvents[0].event_id
  const code = industryCode(params.get('industry') ?? '29')
  const selection: Selection = {
    country: country === 'compare' || caseCountries(event).includes(country as Country)
      ? country as Selection['country'] : defaultCountry,
    event,
    industry: caseIndustries(event).find(item => item.industry_id === code)?.industry_id
      ?? caseIndustries(event)[0]?.industry_id ?? code,
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
    <label className="field"><span>Economic shock</span>
      <select value={selection.event} onChange={e => {
        const event = e.target.value
        const options = caseIndustries(event)
        update({ ...selection, event,
          country: selection.country === 'DEU' && isLegacy(event) ? 'IND' : selection.country,
          industry: options.some(i => i.industry_id === selection.industry) ? selection.industry
            : options[0]?.industry_id ?? selection.industry,
        })
      }}>
        {Array.from(new Set(activeEvents.map(e => e.status))).map(status => <optgroup key={status} label={status}>
          {activeEvents.filter(e => e.status === status).map(e => <option key={e.event_id} value={e.event_id}>{e.event}</option>)}
        </optgroup>)}
      </select>
    </label>
    <Select label="Manufacturing industry" value={selection.industry} options={caseIndustries(selection.event).map(i => [i.industry_id, i.industry])}
      change={industry => update({ ...selection, industry })} />
    <Select label="Country" value={selection.country} options={allowCompare
      ? [['compare', isLegacy(selection.event) ? 'Compare India & US' : 'Compare all countries'],
        ...caseCountries(selection.event).map((id): [string, string] => [id, countries[id]])]
      : caseCountries(selection.event).map(id => [id, countries[id]])}
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
      <p>Growth shift is impact minus baseline, in percentage points. Expanded windows require six baseline and six impact observations. Original studies use 10 of 12 observations in each window. Rankings compare eligible cases within a country and shock.</p>
      <p>India uses published IIP growth. US and German growth uses Federal Reserve and Eurostat index levels from the same month a year apart. Classifications are approximate. The expanded 2022 study uses 2019 as its baseline. Brent gives global oil-price context. Growth normalization marks the third consecutive follow-up month at or above baseline YoY growth.</p>
      <a href="https://doi.org/10.1007/s00168-024-01261-6">Maroto Sánchez and Cuadrado-Roura</a>
      {' · '}<a href="https://doi.org/10.1093/jeg/lbu015">Martin and Sunley</a>
      {' · '}<a href="https://doi.org/10.1257/aer.99.3.1053">Kilian</a>
    </details>
    <details><summary>Research models and validation</summary>
      <p>Historical slowdown classification used {logistic.n_cases} cases from four eligible shocks. Grouped validation held out country–industry pairs. The same shocks appear across folds.</p>
      <table><thead><tr><th scope="col">Model</th><th scope="col">Held-out accuracy</th></tr></thead>
        <tbody>{[['Majority baseline', logistic.dummy_accuracy_mean], ['Logistic regression', logistic.cv_accuracy_mean],
          ['Random Forest', forest.cv_accuracy_mean], ['K-nearest neighbors', knn.cv_accuracy_mean]].map(([name, accuracy]) =>
          <tr key={name}><th scope="row">{name}</th><td>{value(Number(accuracy) * 100, '%', false)}</td></tr>)}</tbody>
      </table>
      <p>Brent-response regressions summarize historical associations with month-clustered 95% intervals.</p>
      <table><thead><tr><th scope="col">Horizon</th><th scope="col">Estimate</th><th scope="col">95% interval</th></tr></thead>
        <tbody>{dynamicResponse.coefficients.map(row => <tr key={row.horizon_months}>
          <th scope="row">{row.horizon_months} months</th><td>{value(row.coef)}</td>
          <td>{row.ci95_low.toFixed(2)} to {row.ci95_high.toFixed(2)}</td>
        </tr>)}</tbody>
      </table>
      <p className="muted">Estimates are YoY growth percentage points per percentage point of Brent log return. Overlapping YoY measures and omitted macroeconomic variables limit interpretation.</p>
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
      <dt title={event[`${window}_start`] ? range(event[`${window}_start`], event[`${window}_end`]) : undefined}>
        {windowNames[window]} <small>{row?.expected[window] ? `${row.coverage[window]}/${row.expected[window]}` : 'No window'}</small></dt>
      <dd>{value(row?.[`${window}_growth_pct`], '%', false)}</dd>
    </div>)}
      <div><dt>Follow-up shift</dt><dd>{value(row?.followup_shift_pp)}</dd></div>
      <div><dt>Weakest 3-month mean</dt><dd>{value(row?.weakest_3mo_growth_pct, '%', false)}</dd></div>
      <div><dt>Industry rank</dt><dd>{row?.rank_within_country_event ? `${row.rank_within_country_event} of ${row.compared_industries_n}` : 'Unavailable'}</dd></div>
      {!isLegacy(event.event_id) && <>
        <div><dt>Impact volatility</dt><dd>{value(row?.volatility, 'pp', false)}</dd></div>
        <div><dt>Growth normalization</dt><dd>{row?.normalization ? period(row.normalization) : 'Unavailable'}</dd></div>
      </>}
    </dl>
    {row && !row.eligible && <p className="muted">{isLegacy(event.event_id)
      ? 'At least 10 observations per window are required.'
      : 'At least six observations in both baseline and impact are required.'}</p>}
    {row && <SourceNote id={row.source_id} />}
  </article>)}</div>
}

export function Overview() {
  const [selection, update] = useSelection('IND')
  const scope = [
    ['Countries', new Set(readyCases.map(row => row.country)).size, Globe2],
    ['Industries', new Set(readyCases.map(row => row.industry)).size, Factory],
    ['Expanded shock windows', researchEvents.length, Waves],
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
    <section><CardTitle title="Case studies" detail={`${readyCases.length} expanded cases meet the modeling coverage threshold.`} /><div className="auto-grid">{researchEvents.map(event => <article className="card finding" key={event.event_id}>
      <p className="muted">{range(event.impact_start, event.impact_end)}</p><h3>{event.event}</h3>
      <p>How did growth shift during this window across {new Set(cases.filter(c => c.event_id === event.event_id && c.status === 'ready').map(c => c.industry)).size} industries?</p>
      <Link className="source" to={`/case-studies?${query({ ...selection, event: event.event_id, country: 'compare' })}`}>Explore case study <ArrowUpRight size={16} /></Link>
    </article>)}</div></section>
    <section className="card finding">
      <CardTitle title="Research Lab" detail="Observed rank changes and exploratory model results" />
      {(() => {
        const before = getCase('oil_collapse', '24', 'USA')
        const after = getCase('energy_surge_2022', '24', 'USA')
        return before?.eligible && after?.eligible && <p>US basic metals ranked {before.rank_within_country_event} of {before.compared_industries_n} in the oil collapse ({value(before.growth_shift_pp)}) and {after.rank_within_country_event} of {after.compared_industries_n} in the energy surge ({value(after.growth_shift_pp)}).</p>
      })()}
      <a className="source" href="#methodology">View research methods and validation <ArrowRight size={16} /></a>
    </section>
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
        {row?.eligible ? `${countries[country]} ranked ${row.rank_within_country_event} of ${row.compared_industries_n}.${row.followup_shift_pp == null ? '' : ` Mean YoY growth shifted ${value(row.followup_shift_pp)} from impact to follow-up.`}` :
          `${countries[country]} has insufficient window coverage.`}
      </p>
    })}
  </aside>
}

export function StructuralResearch() {
  return <section className="card">
    <CardTitle title="AI & Automation" detail="Structural research · annual survey evidence" />
    <p>German enterprises with 10 or more workers using AI, across the sectors covered by the Eurostat survey.</p>
    <table><thead><tr><th scope="col">Year</th><th scope="col">Adoption</th></tr></thead>
      <tbody>{ai.map(row => <tr key={row.year}><th scope="row">{row.year}</th><td>{value(row.value, '%', false)}</td></tr>)}</tbody>
    </table>
    <p className="muted">Comparable India and US adoption series and manufacturing-division breakdowns are unavailable in this study.</p>
    {ai[0] && <a className="source" href={ai[0].source_url}>Eurostat isoc_eb_ai <ArrowUpRight size={13} /></a>}
  </section>
}
