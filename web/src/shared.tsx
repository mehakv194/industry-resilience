import { ArrowUpRight } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import dynamicResponse from '../../reports/research/models/dynamic_response.json'
import logistic from '../../reports/research/models/logistic_regression.json'
import forest from '../../reports/research/models/random_forest.json'
import knn from '../../reports/research/models/knn.json'
import {
  activeEvents, ai, caseCountries, caseIndustries, countries,
  industryCode, isLegacy, period, range, sources, value, windowNames, windows,
  type Case, type Country, type Event,
} from './data'

export type Selection = { event: string; industry: string; country: Country | 'compare' }
export const query = (selection: Selection) => new URLSearchParams(selection).toString()
export const selectedCountries = (selection: Selection): Country[] =>
  selection.country === 'compare' ? caseCountries(selection.event) : [selection.country]

export function useSelection(defaultCountry: Selection['country']) {
  const [params, setParams] = useSearchParams()
  const country = params.get('country')
  const event = activeEvents.find(item => item.event_id === params.get('event'))?.event_id ?? 'energy_surge_2022'
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
        {Array.from(new Set(activeEvents.map(e => e.status))).map(status => <optgroup key={status}
          label={status === 'Original study' ? 'Original studies · 4 industries, 2 countries' : status}>
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
    {isLegacy(selection.event) && <div className="col-span-full flex flex-wrap items-center gap-3">
      <span className="muted">This original study covers four industries in India and the US.</span>
      <button type="button" className="button" onClick={() => update({
        ...selection, event: selection.event === 'energy_spike_2022' ? 'energy_surge_2022' : 'oil_collapse',
      })}>Switch to 10 industries and 3 countries</button>
    </div>}
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
    <p className="muted">Change in the annual growth rate</p>
    <dl>{windows.map(window => <div key={window}>
      <dt title={event[`${window}_start`] ? range(event[`${window}_start`], event[`${window}_end`]) : undefined}>
        {windowNames[window]} <small>{row?.expected[window] ? `${row.coverage[window]}/${row.expected[window]}` : 'No window'}</small></dt>
      <dd>{value(row?.[`${window}_growth_pct`], '%', false)}</dd>
    </div>)}
      <div><dt>Follow-up shift</dt><dd>{value(row?.followup_shift_pp)}</dd></div>
      <div><dt>Weakest 3-month mean</dt><dd>{value(row?.weakest_3mo_growth_pct, '%', false)}</dd></div>
      <div><dt>Position among industries</dt><dd>{row?.rank_within_country_event ? `${row.rank_within_country_event} of ${row.compared_industries_n}` : 'Unavailable'}</dd></div>
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
