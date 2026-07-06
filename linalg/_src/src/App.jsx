import { useState, useEffect } from 'react'
import Home from './Home.jsx'
import Vectors from './modules/Vectors.jsx'
import DotProduct from './modules/Dot.jsx'
import Span from './modules/Span.jsx'
import Matrices from './modules/Matrices.jsx'
import Compose from './modules/Compose.jsx'
import Systems from './modules/Systems.jsx'
import Determinants from './modules/Determinants.jsx'
import Decompositions from './modules/Decompositions.jsx'
import Projections from './modules/Projections.jsx'
import Eigen from './modules/Eigen.jsx'

// The full book. `status`: 'book' = built to depth, 'draft' = first-pass (to be
// rebuilt), undefined = not built yet. Items without a Comp are "coming soon".
const CHAPTERS = [
  { id: 'home', n: '', label: 'Overview', group: null, Comp: Home, status: 'book' },

  { group: 'Foundations' },
  { id: 'vectors', n: '0', label: 'Vectors & combinations', Comp: Vectors, status: 'book' },
  { id: 'dot', n: '1', label: 'The dot product', Comp: DotProduct, status: 'book' },
  { id: 'span', n: '2', label: 'Span & independence', Comp: Span, status: 'book' },

  { group: 'Transformations' },
  { id: 'matrices', n: '3', label: 'Linear maps & matrices', Comp: Matrices, status: 'book' },
  { id: 'matmul', n: '4', label: 'Matrix mult = composition', Comp: Compose, status: 'book' },
  { id: 'rowcol', n: '5', label: 'Linear systems · Ax = b', Comp: Systems, status: 'book' },

  { group: 'Area & volume' },
  { id: 'determinants', n: '6', label: 'Determinants', Comp: Determinants, status: 'book' },
  { id: 'cross', n: '7', label: 'Cross product & orientation' },

  { group: 'Structure & solving' },
  { id: 'inverses', n: '8', label: 'Inverses, rank & subspaces' },
  { id: 'kernelimage', n: '9', label: 'Kernel & image · null & column space' },
  { id: 'lu', n: '10', label: 'Elimination → LU', Comp: Decompositions, status: 'draft' },

  { group: 'Orthogonality' },
  { id: 'projections', n: '11', label: 'Projections & least squares', Comp: Projections, status: 'draft' },
  { id: 'qr', n: '12', label: 'Gram-Schmidt → QR' },

  { group: 'Spectral' },
  { id: 'eigen', n: '13', label: 'Eigenvalues & eigenvectors', Comp: Eigen, status: 'draft' },
  { id: 'diag', n: '14', label: 'Diagonalization & basis change' },
  { id: 'svd', n: '15', label: 'SVD · singular value decomposition' },
]

const PAGES = CHAPTERS.filter((c) => c.Comp)
const TOTAL = CHAPTERS.filter((c) => c.id && c.id !== 'home').length
const bookCount = CHAPTERS.filter((c) => c.status === 'book' && c.id !== 'home').length

export default function App() {
  const [active, setActive] = useState(() => {
    const h = location.hash.replace('#', '')
    return PAGES.some((p) => p.id === h) ? h : 'home'
  })
  const [visited, setVisited] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('linalg-visited') || '[]'))
    } catch {
      return new Set()
    }
  })
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    location.hash = active
    if (active !== 'home') {
      setVisited((prev) => {
        const next = new Set(prev)
        next.add(active)
        localStorage.setItem('linalg-visited', JSON.stringify([...next]))
        return next
      })
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [active])

  const go = (id) => {
    if (!PAGES.some((p) => p.id === id)) return
    setActive(id)
    setNavOpen(false)
  }

  const idx = PAGES.findIndex((p) => p.id === active)
  const Comp = PAGES[idx].Comp
  const prev = idx > 0 ? PAGES[idx - 1] : null
  const next = idx < PAGES.length - 1 ? PAGES[idx + 1] : null

  return (
    <div className="app">
      <aside className={`sidebar ${navOpen ? 'open' : ''}`}>
        <div className="brand" onClick={() => go('home')}>
          <span className="brand-mark">∑</span>
          <div>
            <div className="brand-name">LinAlg Lab</div>
            <div className="brand-sub">the interactive book</div>
          </div>
        </div>
        <nav>
          {CHAPTERS.map((c, i) => {
            if (c.group) {
              return (
                <div key={`g${i}`} className="nav-group">
                  {c.group}
                </div>
              )
            }
            const ready = !!c.Comp
            return (
              <button
                key={c.id}
                className={`nav-item ${active === c.id ? 'active' : ''} ${ready ? '' : 'soon'}`}
                onClick={() => ready && go(c.id)}
                disabled={!ready}
              >
                {c.n !== '' && <span className="nav-tag">{c.n}</span>}
                <span className="nav-label">{c.label}</span>
                {ready && c.status === 'draft' && <span className="nav-badge draft">draft</span>}
                {!ready && <span className="nav-badge">soon</span>}
                {ready && c.status === 'book' && visited.has(c.id) && (
                  <span className="nav-check">✓</span>
                )}
              </button>
            )
          })}
        </nav>
        <div className="sidebar-foot">
          <div className="progress-wrap">
            <div className="progress-bar" style={{ width: `${(bookCount / TOTAL) * 100}%` }} />
          </div>
          <span className="muted small">
            {bookCount} / {TOTAL} chapters at full depth · more on the way
          </span>
        </div>
      </aside>

      <button className="nav-toggle" onClick={() => setNavOpen((o) => !o)} aria-label="Menu">
        ☰
      </button>

      <main className="content">
        <Comp onNavigate={go} />
        {active !== 'home' && (
          <div className="flow-nav">
            {prev ? (
              <button className="flow-btn" onClick={() => go(prev.id)}>
                ← {prev.label}
              </button>
            ) : (
              <span />
            )}
            {next && (
              <button className="flow-btn primary" onClick={() => go(next.id)}>
                {next.label} →
              </button>
            )}
          </div>
        )}
        <footer className="footer">
          An interactive book in progress · drag, scrub, and experiment freely.
        </footer>
      </main>
    </div>
  )
}
