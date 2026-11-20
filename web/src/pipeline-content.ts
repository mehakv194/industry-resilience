import {
  BookOpen, Calculator, ChartNoAxesCombined, Database, Download, GitCompare,
  LayoutDashboard, Lightbulb, ListFilter, Workflow,
} from 'lucide-react'

export const stages = [
  {
    id: 'pipeline-sources', nav: 'Sources', title: 'Data sources', icon: Database,
    description: 'Monthly manufacturing production and economic context.',
    nodes: [
      ['India', 'MoSPI industrial production growth via Measure of India'],
      ['United States', 'Federal Reserve G.17 production indexes'],
      ['Germany', 'Eurostat monthly production indexes'],
      ['Economic context', 'Brent via FRED, European gas via the World Bank and German AI adoption via Eurostat'],
    ],
    detail: 'The source registry records series identifiers, units and download provenance. Tariff dates define study windows while aligned industry-level trade exposure remains unavailable.',
  },
  {
    id: 'pipeline-ingestion', nav: 'Ingestion', title: 'Data ingestion', icon: Download,
    description: 'Bring source files and API extracts into one monthly panel.',
    nodes: [
      ['Collect', 'Download CSV, spreadsheet and JSON inputs offline'],
      ['Register', 'Record publishers, vintages and file fingerprints'],
      ['Align', 'Map source series to industries, months and event dates'],
    ],
    detail: 'The build exports a static monthly panel and a separate coverage table for each country, industry and event.',
  },
  {
    id: 'pipeline-preprocessing', nav: 'Preprocessing', title: 'Cleaning and preprocessing', icon: ListFilter,
    description: 'Turn different production series into comparable growth measures.',
    nodes: [
      ['Harmonize industries', 'Match approximate manufacturing divisions across countries'],
      ['Standardize units', 'Keep India’s published growth and convert US and German indexes using an exact 12-month lag'],
      ['Handle gaps', 'Keep missing months visible and withhold metrics when coverage is insufficient'],
      ['Build features', 'Slice event windows, derive growth shifts and volatility, and scale features for applicable models'],
    ],
    detail: 'The original 12-month comparisons require at least 10 observed months per window. Growth shifts measure differences in year-over-year growth in percentage points.',
  },
  {
    id: 'pipeline-models', nav: 'Models', title: 'Analysis layer', icon: Workflow,
    description: 'Measure historical changes and explore patterns across cases.',
    nodes: [
      ['Statistical analysis', 'Trends, before/during/after growth, country comparisons and within-country rankings'],
      ['ML and data mining', 'Profile groups, historical slowdown classification, associations and unusual cases'],
    ],
    detail: 'The classifiers use pre-event production features and known identifiers. Country–industry groups are held out during evaluation. The same shocks appear across folds, so performance on an unseen shock remains untested.',
  },
  {
    id: 'pipeline-insights', nav: 'Insights', title: 'Insight generation', icon: Lightbulb,
    description: 'Translate the results into questions you can answer with evidence.',
    nodes: [
      ['Impact and recovery', 'Identify the largest and smallest measured shifts and see how growth evolved afterward'],
      ['Industry and country comparisons', 'See which peers moved differently during the same event'],
      ['Patterns and risk signals', 'Inspect similar profiles, unusual readings and conditions that occurred together'],
    ],
    detail: 'Read each result alongside its observation counts and base effects. Oil and gas prices provide context for the production changes.',
  },
  {
    id: 'pipeline-outputs', nav: 'Outputs', title: 'Where the results appear', icon: LayoutDashboard,
    description: 'Follow the evidence from summaries to individual cases.',
    nodes: [],
    detail: 'The dashboard reads precomputed research results. The calculator uses historical exposure to support scenario discussions.',
  },
]

export const models = [
  { name: 'PCA', purpose: 'Summarize the main differences between shock profiles.', output: 'Profile axes and feature loadings', surface: 'Overview · similar profiles', to: '/#profile-evidence' },
  { name: 'K-Means', purpose: 'Group cases with similar observed shock responses.', output: 'Cluster assignments', surface: 'Overview · similar profiles', to: '/#profile-evidence' },
  { name: 'Hierarchical clustering', purpose: 'Check whether a second clustering method finds similar groups.', output: 'Cluster assignments and agreement with K-Means', surface: 'Research export' },
  { name: 'K-nearest neighbors', purpose: 'Classify historical slowdowns using similar cases.', output: 'Held-out accuracy', surface: 'Overview · slowdown evidence', to: '/#slowdown-evidence' },
  { name: 'Logistic regression', purpose: 'Relate pre-shock features to historical slowdown classifications.', output: 'Held-out accuracy against a majority baseline', surface: 'Overview · slowdown evidence', to: '/#slowdown-evidence' },
  { name: 'Random Forest', purpose: 'Combine decision trees to classify historical slowdowns.', output: 'Held-out accuracy against a majority baseline', surface: 'Overview · slowdown evidence', to: '/#slowdown-evidence' },
  { name: 'Apriori', purpose: 'Find conditions that often appear together.', output: 'Association rules with support, confidence and lift', surface: 'Overview · associations', to: '/#association-evidence' },
  { name: 'Isolation Forest', purpose: 'Flag unusually shaped historical shock responses.', output: 'Unusual case profiles', surface: 'Research export' },
  { name: 'SVM', purpose: 'Candidate method for classifying historical slowdowns.', output: 'Pending evaluation', surface: 'No published result', candidate: true },
]

export const outputs = [
  { title: 'Overview', description: 'Discoveries and industry rankings', to: '/', icon: LayoutDashboard },
  { title: 'Case studies', description: 'Event timelines and original observations', to: '/case-studies', icon: ChartNoAxesCombined },
  { title: 'Comparison', description: 'Compare two historical cases', to: '/case-studies#case-comparison', icon: GitCompare },
  { title: 'Risk calculator', description: 'Explore historical exposure by business role', to: '/calculator', icon: Calculator },
  { title: 'Model evidence', description: 'Historical classifier performance and methodology', to: '/#slowdown-evidence', icon: BookOpen },
]
