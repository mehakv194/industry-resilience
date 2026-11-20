import { Activity, BookOpen, Calculator as CalculatorIcon, Database, LayoutDashboard, LineChart } from 'lucide-react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Calculator, CaseStudies } from './analysis'
import { Overview } from './overview'
import './style.css'

function App() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target instanceof HTMLDetailsElement) target.open = true
      else if (target?.firstElementChild instanceof HTMLDetailsElement) target.firstElementChild.open = true
      target?.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])
  return <div className="shell">
    <a className="skip" href="#main">Skip to content</a>
    <aside className="sidebar">
      <NavLink to="/" className="brand"><span><Activity size={20} /></span>IndustryResilience</NavLink>
      <nav aria-label="Primary navigation">
        <NavLink end to="/"><LayoutDashboard size={17} /> Overview</NavLink>
        <NavLink to="/case-studies"><LineChart size={17} /> Case studies</NavLink>
        <NavLink to="/calculator"><CalculatorIcon size={17} /> Risk calculator</NavLink>
      </nav>
      <nav className="research-nav" aria-label="Research">
        <a href="/#methodology"><BookOpen size={17} /> Methodology</a>
        <a href="/#sources"><Database size={17} /> Data sources</a>
      </nav>
    </aside>
    <main id="main" className="main">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="case-studies" element={<CaseStudies />} />
        <Route path="calculator" element={<Calculator />} />
        <Route path="*" element={<section className="card"><h1>Page unavailable</h1><NavLink to="/">Return to overview</NavLink></section>} />
      </Routes>
    </main>
  </div>
}

createRoot(document.getElementById('root')!).render(<BrowserRouter><App /></BrowserRouter>)
