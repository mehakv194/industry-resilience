import { ArrowDown, ArrowRight, ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { countries, events, industries } from './data'
import { models, outputs, stages } from './pipeline-content'
import './pipeline.css'

function PipelineHero() {
  const counts = [
    [Object.keys(countries).length, 'Countries'],
    [industries.length, 'Manufacturing industries'],
    [events.length, 'Event studies'],
    [models.filter(model => !('candidate' in model)).length, 'Published ML methods'],
  ]
  return <header className="card pipeline-hero">
    <h1>Project Pipeline</h1>
    <p>How IndustryResilience turns raw economic data into business-ready insights.</p>
    <p className="muted">Follow the evidence from official datasets to case studies, comparisons and historical risk insights.</p>
    <ul className="pipeline-stats">
      {counts.map(([count, label]) => <li key={label}><strong>{count}</strong> {label}</li>)}
    </ul>
  </header>
}

function PipelineStageCard({ stage, children }: { stage: typeof stages[number]; children?: ReactNode }) {
  return <section id={stage.id} className="card pipeline-stage" aria-labelledby={stage.id + '-title'}>
    <header>
      <span className="pipeline-icon"><stage.icon size={22} aria-hidden="true" /></span>
      <div><h2 id={stage.id + '-title'}>{stage.title}</h2><p className="muted">{stage.description}</p></div>
    </header>
    {stage.nodes.length > 0 && <ul className="pipeline-grid">
      {stage.nodes.map(([label, description]) => <li className="pipeline-node" key={label}>
        <strong>{label}</strong><p>{description}</p>
      </li>)}
    </ul>}
    {children}
    <details className="pipeline-detail">
      <summary>Method details <ChevronDown size={15} aria-hidden="true" /></summary>
      <p>{stage.detail}</p>
      {stage.id === 'pipeline-sources' && <Link to="/#sources">View source registry <ArrowRight size={14} aria-hidden="true" /></Link>}
    </details>
  </section>
}

function ModelPurposeGrid() {
  return <div className="pipeline-models">
    <h3>What each model does</h3>
    <div className="pipeline-grid">
      {models.map(model => <details className="pipeline-node pipeline-model" key={model.name}>
        <summary><span>{model.name}{'candidate' in model && <small>Candidate method</small>}</span><ChevronDown size={15} aria-hidden="true" /></summary>
        <p>{model.purpose}</p>
        <p><strong>Output</strong> · {model.output}</p>
        {'to' in model && model.to ? <Link to={model.to}>{model.surface} <ArrowRight size={14} aria-hidden="true" /></Link> : <p>{model.surface}</p>}
      </details>)}
    </div>
  </div>
}

function PipelineNav() {
  return <nav className="card pipeline-nav" aria-label="On this page">
    {stages.map(stage => <a href={'#' + stage.id} key={stage.id}>{stage.nav}</a>)}
  </nav>
}

export function Pipeline() {
  return <>
    <PipelineHero />
    <div className="pipeline-layout">
      <PipelineNav />
      <div className="pipeline-flow">
        {stages.map(stage => <div className="pipeline-step" key={stage.id}>
          <PipelineStageCard stage={stage}>
            {stage.id === 'pipeline-models' && <ModelPurposeGrid />}
            {stage.id === 'pipeline-outputs' && <div className="pipeline-grid">
              {outputs.map(output => <Link className="pipeline-node pipeline-output" key={output.title} to={output.to}>
                <output.icon size={18} aria-hidden="true" />
                <div><strong>{output.title}</strong><p>{output.description}</p></div>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>)}
            </div>}
          </PipelineStageCard>
          <div className="pipeline-connector" aria-hidden="true"><ArrowDown size={18} /></div>
        </div>)}
        <section className="card pipeline-summary">
          <h2>Pipeline summary</h2>
          <ol>
            {['Source data', 'Cleaned data', 'Features', 'Models', 'Insights', 'Decision support'].map((label, index) =>
              <li key={label}>{index > 0 && <ArrowRight size={14} aria-hidden="true" />}{label}</li>)}
          </ol>
        </section>
      </div>
    </div>
  </>
}
