import { useState } from 'react'
import Plane, { Vector, DraggableVector, Dot, Segment } from '../components/Plane.jsx'
import Quiz from '../components/Quiz.jsx'
import { Card, Panel, Stat, Experiment } from '../components/ui.jsx'
import { projectOnto, dot, fmt, normalize } from '../lib/math.js'
import { Tex } from '../components/Tex.jsx'
import { kcol } from '../lib/texfmt.js'

export default function Projections() {
  const [v, setV] = useState({ x: 2.5, y: 2.5 })
  const [d, setD] = useState({ x: 3, y: 0.6 })

  const p = projectOnto(v, d)
  const residual = { x: v.x - p.x, y: v.y - p.y }
  const dHat = normalize(d)
  const scalarProj = dot(v, dHat)
  const errLen = Math.hypot(residual.x, residual.y)
  const vd = dot(v, d)
  const dd = dot(d, d)

  // a faint extension of the projection line across the plane
  const big = 8
  const lineA = { x: -dHat.x * big, y: -dHat.y * big }
  const lineB = { x: dHat.x * big, y: dHat.y * big }

  return (
    <div className="module">
      <header className="module-head">
        <h2>4 · Projections</h2>
        <p className="lead">
          Projecting <b>v</b> onto a line finds the point on that line <b>closest to v</b> — the
          "shadow" of v. The leftover piece (the dashed residual) is always <b>perpendicular</b> to the
          line. That right angle is the whole idea behind least squares.
        </p>
      </header>

      <div className="lab">
        <div className="lab-stage">
          <Plane range={5}>
            <Segment from={lineA} to={lineB} color="#adb5bd" dashed={false} width={1.5} />
            {/* projection shadow */}
            <Vector to={p} color="#7c5cff" width={4} label="proj" />
            {/* residual (error) — perpendicular */}
            <Segment from={v} to={p} color="#e8590c" dashed width={2} />
            {/* the vectors the user controls */}
            <DraggableVector value={v} onChange={setV} color="#12b886" label="v" />
            <DraggableVector value={d} onChange={setD} color="#1769ff" label="direction d" />
            <Dot at={p} color="#7c5cff" />
          </Plane>
          <p className="muted small center">
            Drag <b style={{ color: '#12b886' }}>v</b> and the{' '}
            <b style={{ color: '#1769ff' }}>direction d</b>. The orange dashed segment (the error) stays
            perpendicular to the gray line.
          </p>
        </div>

        <div className="lab-controls">
          <Panel title="Readout">
            <div className="stat-row">
              <Stat label="proj_d(v)" value={`(${fmt(p.x)}, ${fmt(p.y)})`} color="#7c5cff" />
              <Stat label="scalar v·d̂" value={fmt(scalarProj)} />
              <Stat label="error length" value={fmt(errLen)} color="#e8590c" hint="distance from v to the line" />
            </div>
          </Panel>

          <Panel title="The formula, made visual">
            <div className="formula">
              <Tex block>{String.raw`\begin{aligned} \operatorname{proj}_{\textcolor{#1769ff}{d}}(\textcolor{#12b886}{v}) &= \frac{\textcolor{#12b886}{v}\cdot\textcolor{#1769ff}{d}}{\textcolor{#1769ff}{d}\cdot\textcolor{#1769ff}{d}}\;\textcolor{#1769ff}{d} \\[4pt] &= \frac{${fmt(vd)}}{${fmt(dd)}}\;${kcol('#1769ff', d.x, d.y)} = ${kcol('#7c5cff', p.x, p.y)} \end{aligned}`}</Tex>
            </div>
            <p className="muted small">
              The fraction <b>v·d / d·d</b> is how many copies of d you need. Only the direction of d
              matters — its length cancels out.
            </p>
          </Panel>

          <Experiment>
            Drag <b>v</b> straight up and down. The orange error changes, but the purple shadow always
            sits where the error meets the line at <b>90°</b>. That perpendicular point is the closest
            point on the line to v — minimizing the error length is the same as making the error
            perpendicular.
          </Experiment>
        </div>
      </div>

      <Card className="reading">
        <h3>From projection to least squares</h3>
        <ul>
          <li>
            The projection is the closest point in a subspace to v. The <b>residual is orthogonal</b> to
            the subspace — that orthogonality condition <i>defines</i> the best fit.
          </li>
          <li>
            Fitting a line to data is projecting the vector of observations onto the column space of the
            design matrix. "Least squares" = "shortest residual" = "perpendicular residual".
          </li>
          <li>
            Projecting onto a subspace (not just a line) uses P = A(AᵀA)⁻¹Aᵀ, but the picture is the
            same: drop a perpendicular onto the subspace.
          </li>
        </ul>
      </Card>

      <Quiz
        title="Projections — concept check"
        questions={[
          {
            q: 'After projecting v onto a line, what is always true about the residual v − proj(v)?',
            options: [
              'It is parallel to the line',
              'It is perpendicular to the line',
              'It is zero',
              'It is longer than v',
            ],
            answer: 1,
            explain:
              'The closest point is found by dropping a perpendicular, so the leftover error is orthogonal to the line. That is the defining property.',
          },
          {
            q: 'If you double the length of the direction vector d (same direction), the projection of v…',
            options: ['doubles', 'halves', 'stays exactly the same', 'becomes zero'],
            answer: 2,
            explain:
              'The formula (v·d/d·d)d is scale-invariant in d: lengthening d scales numerator and denominator equally. Only d’s direction matters.',
          },
          {
            q: 'Least squares finds the solution that…',
            options: [
              'makes the residual as long as possible',
              'makes the residual perpendicular to the column space (shortest error)',
              'ignores the data',
              'requires det = 0',
            ],
            answer: 1,
            explain:
              'Least squares projects the data onto the column space; the minimal error is the perpendicular one — exactly this projection picture.',
          },
        ]}
      />
    </div>
  )
}
