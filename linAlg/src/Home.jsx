import Plane, { Vector } from './components/Plane.jsx'
import { rotation, apply } from './lib/math.js'

const TOPICS = [
  {
    id: 'vectors',
    n: '0',
    title: 'Vectors & combinations',
    desc: 'Start here. Add and scale vectors, and meet the linear combination — the workhorse of everything ahead.',
  },
  {
    id: 'matrices',
    n: '3',
    title: 'Linear maps & matrices',
    desc: 'See a matrix as an instruction that moves all of space. Drag î and ĵ and watch the grid deform.',
  },
  {
    id: 'determinants',
    n: '6',
    title: 'Determinants',
    desc: 'The signed area factor. Stretch, flip, or collapse the unit square and read the determinant live.',
  },
  {
    id: 'projections',
    n: '10',
    title: 'Projections',
    desc: 'Find the closest point on a line — the shadow of a vector — and meet least squares visually.',
  },
  {
    id: 'eigen',
    n: '12',
    title: 'Eigenvectors',
    desc: 'Discover the directions a transform leaves alone, and the eigenvalues that scale them.',
  },
]

export default function Home({ onNavigate }) {
  const R = rotation(20)
  const M = { a: 1.3, b: 0.5, c: -0.4, d: 1.1 }
  return (
    <div className="module home">
      <header className="hero">
        <h1>An interactive intuition lab for linear algebra</h1>
        <p className="hero-lead">
          Not a textbook — a playground. Every idea here is something you can <b>drag, scrub, and
          break</b>. The goal is geometric intuition: <i>what is this transformation actually doing to
          space?</i>
        </p>
        <button className="cta" onClick={() => onNavigate('vectors')}>
          Start from the beginning →
        </button>
      </header>

      <div className="hero-demo">
        <Plane grid={M} showUnitSquare range={4} size={360}>
          <Vector to={apply(M, { x: 1, y: 0 })} color="#1769ff" label="î" width={3.5} />
          <Vector to={apply(M, { x: 0, y: 1 })} color="#e8590c" label="ĵ" width={3.5} />
        </Plane>
        <p className="muted small center">A matrix bending the grid — the recurring picture of this lab.</p>
      </div>

      <div className="topic-grid">
        {TOPICS.map((t) => (
          <button key={t.id} className="topic-card" onClick={() => onNavigate(t.id)}>
            <span className="topic-n">{t.n}</span>
            <h3>{t.title}</h3>
            <p>{t.desc}</p>
            <span className="topic-go">Open module →</span>
          </button>
        ))}
      </div>

      <div className="how">
        <h3>How to use the lab</h3>
        <ul>
          <li>
            <b>Drag</b> the circular handles on vectors to move them in real time.
          </li>
          <li>
            <b>Scrub & animate</b> transformations to watch space morph from the identity.
          </li>
          <li>
            <b>Use presets</b> to jump to instructive cases (rotation, shear, rank-deficient…).
          </li>
          <li>
            <b>Take the quiz</b> at the end of each module to check your intuition.
          </li>
        </ul>
      </div>
    </div>
  )
}
