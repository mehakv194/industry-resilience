import metrics from '../../reports/energy/case-metrics.json'
import monthly from '../../reports/energy/monthly.json'
import manifest from '../../reports/energy/data_manifest.json'

export const countries = { IND: 'India', USA: 'United States' } as const
export type Country = keyof typeof countries
export const windows = ['baseline', 'impact', 'followup'] as const
export const windowNames = { baseline: 'Baseline', impact: 'Impact', followup: 'Follow-up' }
export const events = monthly.events
export const industries = monthly.industries
export const sources = manifest
export const findings = metrics.comparisons.filter(row => row.india_minus_us_growth_shift_pp !== null)
export type Event = typeof events[number]
export type Case = Omit<typeof metrics.cases[number], 'coverage' | 'country' | 'status'> & {
  country: Country
  status: 'ready' | 'partial' | 'unavailable'
  coverage: Record<typeof windows[number], number>
}
export const cases = metrics.cases as Case[]
export const industryName = (id: string) => industries.find(row => row.industry_id === id)?.industry ?? id
export const getCase = (event: string, industry: string, country: Country) =>
  cases.find(row => row.event_id === event && row.industry === industry && row.country === country)
export const delta = (event: string, industry: string) =>
  metrics.comparisons.find(row => row.event_id === event && row.industry === industry)?.india_minus_us_growth_shift_pp
export const readyCases = cases.filter(row => row.status === 'ready')
export const activeEvents = events.filter(event => cases.some(row => row.event_id === event.event_id && row.status !== 'unavailable'))
export const coverage = monthly.production.reduce(
  ([first, last], row) => row.yoy_growth_pct === null ? [first, last] :
    [first && first < row.month ? first : row.month, last > row.month ? last : row.month],
  ['', ''],
)
export const period = (month: string) => new Date(month + '-01T00:00:00Z').toLocaleDateString('en', {
  month: 'short', year: 'numeric', timeZone: 'UTC',
})
export const value = (number: number | null | undefined, unit = 'pp', signed = true) =>
  number == null ? 'Unavailable' :
    `${signed && number >= 0 ? '+' : ''}${number.toFixed(2)}${unit === '%' ? '%' : ' ' + unit}`
export const range = (start: string, end: string) => `${period(start)} – ${period(end)}`
export function timeline(event: Event, industry: string) {
  const growth = new Map(monthly.production.filter(row => row.industry === industry)
    .map(row => [row.month + row.country, row.yoy_growth_pct]))
  const oil = new Map(monthly.brent.map(row => [row.month, row.brent_usd_bbl]))
  const data = []
  for (let year = +event.baseline_start.slice(0, 4); year <= +event.followup_end.slice(0, 4); year++) {
    for (let month = 1; month <= 12; month++) {
      const key = `${year}-${String(month).padStart(2, '0')}`
      if (key < event.baseline_start || key > event.followup_end) continue
      data.push({ month: key, IND: growth.get(key + 'IND') ?? null, USA: growth.get(key + 'USA') ?? null, brent: oil.get(key) ?? null })
    }
  }
  return data
}
