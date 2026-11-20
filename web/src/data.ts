import metrics from '../../reports/energy/case-metrics.json'
import monthly from '../../reports/energy/monthly.json'
import manifest from '../../reports/energy/data_manifest.json'
import panel from '../../reports/research/panel.json'
import sourceManifest from '../../reports/research/source_manifest.json'
import eventCoverage from '../../reports/research/event_coverage.json'
import profiles from '../../reports/research/models/shock_profiles.json'

export const countries = { IND: 'India', USA: 'United States', DEU: 'Germany' } as const
export type Country = keyof typeof countries
export const windows = ['baseline', 'impact', 'followup'] as const
export const windowNames = { baseline: 'Baseline', impact: 'Impact', followup: 'Follow-up' }
const legacy = { food: '10', chemicals: '20', metals: '24', autos: '29' }
export const industryCode = (id: string) => legacy[id as keyof typeof legacy] ?? id
const titles: Record<string, string> = {
  oil_collapse: '2014–16 oil-price collapse',
  us_china_tariffs_2018: '2018–19 US–China tariffs',
  covid_disruption_2020: '2020 COVID disruption',
  supply_chain_2021: '2021–22 supply-chain disruption',
  energy_surge_2022: '2022 energy surge',
  tariff_wave_2025: '2025 tariff wave',
  tariff_regime_2026: '2026 revised tariff regime',
}
export const researchEvents = panel.events.map(row => ({
  event_id: row.event, event: titles[row.event], status: row.status, notes: row.note,
  baseline_start: row.baseline_start, baseline_end: row.baseline_end,
  impact_start: row.shock_start, impact_end: row.shock_end,
  followup_start: row.post_start, followup_end: row.post_end,
}))
export const events = [...monthly.events.map(row => ({ ...row, status: 'Original study' })), ...researchEvents]
export type Event = typeof events[number]
export const industries = panel.industries.map(row => ({ industry_id: row.industry_code, industry: row.industry_name }))
export const industryName = (id: string) => industries.find(row => row.industry_id === industryCode(id))?.industry ?? id
export const sources = [...manifest, ...sourceManifest.production.map(row => ({
  ...row, source_id: row.country + row.industry_code, distributor: row.country === 'IND' ? 'Third-party republication' : 'Source publisher',
}))]
export const ai = panel.ai
export const findings = metrics.comparisons.filter(row => row.india_minus_us_growth_shift_pp !== null)
type NullableMetric = 'baseline_growth_pct' | 'impact_growth_pct' | 'followup_growth_pct'
  | 'growth_shift_pp' | 'followup_shift_pp' | 'weakest_3mo_growth_pct'
  | 'rank_within_country_event' | 'compared_industries_n'
export type Case = Omit<typeof metrics.cases[number], 'coverage' | 'country' | 'status' | NullableMetric> & {
  country: Country
  status: 'ready' | 'partial' | 'unavailable'
  coverage: Record<typeof windows[number], number>
  expected: Record<typeof windows[number], number>
  eligible: boolean
  volatility?: number | null
  normalization?: string | null
} & Record<NullableMetric, number | null>

const lookup = new Map(profiles.rows.map(row => [row.country + row.industry_code + row.event, row]))
export const expandedCases: Case[] = eventCoverage.map(item => {
  const row = lookup.get(item.country + item.industry_code + item.event)
  return {
    country: item.country as Country, industry: item.industry_code, event_id: item.event,
    source_id: item.country + item.industry_code, status: item.status as Case['status'],
    eligible: item.eligible, coverage: { baseline: item.n_baseline, impact: item.n_shock, followup: item.n_post },
    expected: { baseline: item.expected_baseline, impact: item.expected_shock, followup: item.expected_post },
    baseline_n: item.n_baseline, impact_n: item.n_shock, followup_n: item.n_post,
    baseline_growth_pct: row?.baseline_mean_yoy ?? null, impact_growth_pct: row?.shock_mean_yoy ?? null,
    followup_growth_pct: row?.post_mean_yoy ?? null, growth_shift_pp: row?.delta_pp ?? null,
    followup_shift_pp: row?.post_shift_pp ?? null, weakest_3mo_growth_pct: row?.weakest_3mo_growth_pct ?? null,
    rank_within_country_event: row?.rank ?? null, compared_industries_n: row?.rank_count ?? null,
    volatility: row?.shock_std_yoy, normalization: row?.growth_normalization_month,
    notes: [],
  }
})
export const cases: Case[] = [...metrics.cases.map(row => ({
  ...row, country: row.country as Country, industry: industryCode(row.industry), status: row.status as Case['status'],
  eligible: row.status === 'ready', expected: { baseline: 12, impact: 12, followup: 12 },
})), ...expandedCases]
export const getCase = (event: string, industry: string, country: Country) =>
  cases.find(row => row.event_id === event && row.industry === industryCode(industry) && row.country === country)
export const isLegacy = (id: string) => monthly.events.some(event => event.event_id === id)
export const caseCountries = (event: string): Country[] => isLegacy(event) ? ['IND', 'USA'] : ['IND', 'USA', 'DEU']
export const caseIndustries = (event: string) => industries.filter(i => cases.some(row =>
  row.event_id === event && row.industry === i.industry_id && row.status !== 'unavailable'))
export const delta = (event: string, industry: string) => {
  const ind = getCase(event, industry, 'IND')?.growth_shift_pp
  const usa = getCase(event, industry, 'USA')?.growth_shift_pp
  return ind == null || usa == null ? null : ind - usa
}
export const readyCases = expandedCases.filter(row => row.eligible)
export const activeEvents = events
export const coverage = [panel.months[0], panel.months.at(-1)!]
export const period = (month: string) => new Date(month + '-01T00:00:00Z').toLocaleDateString('en', {
  month: 'short', year: 'numeric', timeZone: 'UTC',
})
export const value = (number: number | null | undefined, unit = 'pp', signed = true) =>
  number == null ? 'Unavailable' :
    `${signed && number >= 0 ? '+' : ''}${number.toFixed(2)}${unit === '%' ? '%' : ' ' + unit}`
export const range = (start: string, end: string) => `${period(start)} – ${period(end)}`
const production = panel.production as Record<string, (number | null)[]>
export function timeline(event: Event, industry: string) {
  const code = industryCode(industry)
  const end = event.followup_end || event.impact_end
  if (!isLegacy(event.event_id)) return panel.months.flatMap((month, i) =>
    month < event.baseline_start || month > end ? [] : [{
      month, IND: production['IND' + code]?.[i] ?? null, USA: production['USA' + code]?.[i] ?? null,
      DEU: production['DEU' + code]?.[i] ?? null, brent: panel.brent[i],
    }])
  const growth = new Map(monthly.production.filter(row => industryCode(row.industry) === code)
    .map(row => [row.month + row.country, row.yoy_growth_pct]))
  return monthly.brent.filter(row => row.month >= event.baseline_start && row.month <= end).map(row => ({
    month: row.month, IND: growth.get(row.month + 'IND') ?? null, USA: growth.get(row.month + 'USA') ?? null,
    DEU: null, brent: row.brent_usd_bbl,
  }))
}
