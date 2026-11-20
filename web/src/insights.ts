import points from '../../reports/research/models/profile_coordinates.json'
import rules from '../../reports/research/models/apriori.json'
import forest from '../../reports/research/models/random_forest.json'
import logistic from '../../reports/research/models/logistic_regression.json'
import knn from '../../reports/research/models/knn.json'
import {
  ai, cases, countries, events, getCase, industryName, period, timeline, value, windows,
  type Case, type Country,
} from './data'

export const lowBaseSource = 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=1726259&lang=2&reg=48'
export const pointsByProfile = new Map(points.map(p => [p.event + p.country + p.industry_code, p]))
export const clusterPoints = points
const clusterLabels = new Map(points.map(p => {
  const group = points.filter(item => item.cluster === p.cluster)
  const average = (key: 'post_mean_yoy' | 'delta_pp' | 'shock_std_yoy') =>
    group.reduce((total, item) => total + item[key], 0) / group.length
  const label = average('post_mean_yoy') > 100 ? 'Exceptional follow-up growth' :
    average('delta_pp') > 100 ? 'Exceptional growth during the event' :
    average('shock_std_yoy') > 30 ? 'Wide month-to-month swings' : 'Smaller swings on average'
  return [p.cluster, label]
}))
export const clusterName = (cluster: number) => clusterLabels.get(cluster) ?? 'Observed profiles'
export const performance = [
  { name: 'Majority baseline', accuracy: logistic.dummy_accuracy_mean * 100 },
  { name: 'K-nearest neighbors', accuracy: knn.cv_accuracy_mean * 100 },
  { name: 'Logistic regression', accuracy: logistic.cv_accuracy_mean * 100 },
  { name: 'Random Forest', accuracy: forest.cv_accuracy_mean * 100 },
]
export const validationSample = forest.n_cases
const explain = (token: string) => {
  const [key, id] = token.split('=')
  if (key === 'event') return events.find(event => event.event_id === id)?.event ?? id
  if (key === 'country') return countries[id as Country] ?? id
  if (key === 'industry') return industryName(id)
  if (key === 'slowdown') return id === 'yes' ? 'Growth slowed' : 'Growth held steady or rose'
  if (key === 'volatility') return id === 'high' ? 'Larger monthly swings' : 'Smaller monthly swings'
  return id === 'high' ? 'More negative-growth months' : 'Fewer negative-growth months'
}
export const patterns = rules.rules
  .filter(rule => rule.consequent.length === 1)
  .filter((rule, i, list) => list.findIndex(other => [...other.antecedent, ...other.consequent].sort().join() ===
    [...rule.antecedent, ...rule.consequent].sort().join()) === i)
  .slice(0, 4).map(rule => ({ ...rule, from: rule.antecedent.map(explain).join(' + '), to: explain(rule.consequent[0]) }))
export const patternSample = rules.n_cases

export function insight(row: Case | undefined) {
  if (!row) return null
  const event = events.find(e => e.event_id === row.event_id)!
  const months = timeline(event, row.industry)
  const extreme = months.find(m => Math.abs(m[row.country] ?? 0) >= 1000)
  const impact = months.filter(m => m.month >= event.impact_start && m.month <= event.impact_end && m[row.country] !== null)
  const low = impact.reduce<typeof impact[number] | undefined>((lowest, m) =>
    !lowest || m[row.country]! < lowest[row.country]! ? m : lowest, undefined)
  const shifts = [
    { name: 'Before → during', shift: row.growth_shift_pp },
    { name: 'During → after', shift: row.followup_shift_pp },
  ].flatMap(item => item.shift === null ? [] : [{ name: item.name, shift: item.shift }])
    .sort((a, b) => Math.abs(b.shift) - Math.abs(a.shift))
  const biggest = shifts[0]
  const stable = shifts.length > 1 ? shifts[1] : undefined
  const title = row.growth_shift_pp === null ? 'Too few months to measure the change in growth' :
    row.growth_shift_pp < 0 ? 'Production growth slowed' :
    row.growth_shift_pp > 0 ? 'Production growth accelerated' : 'Production growth held steady'
  const beforeAfter = row.baseline_growth_pct === null || row.impact_growth_pct === null ? '' :
    `Average annual growth went from ${value(row.baseline_growth_pct, '%', false)} before the event to ${value(row.impact_growth_pct, '%', false)} during it${row.followup_growth_pct === null ? '.' : ` and ${value(row.followup_growth_pct, '%', false)} afterward.`}`
  return {
    title, beforeAfter, biggest, stable, extreme, shifts,
    low: low ? `${period(low.month)} was the weakest observed month during the event (${value(low[row.country], '%', false)} year over year).` : '',
    position: row.rank_within_country_event === null ? '' :
      `Ranked ${row.rank_within_country_event} of ${row.compared_industries_n} in ${countries[row.country]} by change in growth.`,
    profile: pointsByProfile.get(row.event_id + row.country + row.industry),
    evidence: windows.flatMap(w => row.expected[w] ? [`${row.coverage[w]}/${row.expected[w]}`] : []).join(' · '),
    warning: extreme?.month === '2021-04' && row.country === 'IND' && row.industry === '29'
      ? 'April 2021’s unusually high growth compares with a near-zero lockdown base a year earlier.'
      : extreme ? `${period(extreme.month)} has an unusually large year-over-year observation. This can dominate averages.` : '',
  }
}

export function peers(event: string, country: Country) {
  return cases.filter(row => row.event_id === event && row.country === country && row.growth_shift_pp !== null)
    .sort((a, b) => b.growth_shift_pp! - a.growth_shift_pp!)
}

export function considerations(row: Case, role: string) {
  const story = insight(row)!
  if (!row.eligible) return ['Use the monthly series to see which observations are available before comparing this period.']
  const roleText: Record<string, string> = {
    manufacturer: 'Use the weakest observed month to stress-test a production schedule.',
    supplier: 'Use the weakest observed month in a scenario for customers’ production schedules.',
    distributor: 'Use the range of observed growth to test inventory scenarios tied to production.',
    investor: 'Compare the industry’s growth record across shocks when examining historical exposure.',
    researcher: 'Compare the same division in another country and check the observation counts.',
  }
  return [
    story.low && `${story.low} ${roleText[role] ?? roleText.manufacturer}`,
    story.position && `${story.position} Compare its position across shocks before assuming it is typical.`,
    row.followup_shift_pp == null ? 'Follow-up evidence is insufficient to judge whether the change persisted.' :
      `Growth shifted ${value(row.followup_shift_pp)} after the event. Check the follow-up window before assuming the earlier pattern persisted.`,
  ].filter(Boolean)
}

export function discoveries() {
  const metals = getCase('energy_surge_2022', '24', 'USA')!
  const earlier = getCase('oil_collapse', '24', 'USA')!
  const chemicals = getCase('energy_surge_2022', '20', 'DEU')!
  const us = getCase('energy_surge_2022', '20', 'USA')!
  const latest = ai.at(-1)!
  return [
    { title: 'US basic metals reversed position', number: value(metals.growth_shift_pp),
      text: `It moved from ${earlier.rank_within_country_event} of ${earlier.compared_industries_n} in the oil collapse to ${metals.rank_within_country_event} of ${metals.compared_industries_n} in the energy surge.`,
      case: metals },
    { title: 'Chemicals split across countries', number: value(chemicals.growth_shift_pp),
      text: `German chemicals growth slowed in the 2022 study while US growth changed by ${value(us.growth_shift_pp)}.`, case: chemicals },
    { title: 'AI use rose in Germany’s business survey', number: value(latest.value, '%', false),
      text: `Share of surveyed firms using AI in ${latest.year}, up from ${value(ai[0].value, '%', false)} in ${ai[0].year}.` },
  ].filter(item => !item.case || item.case.status === 'ready' && !insight(item.case)?.extreme)
}
