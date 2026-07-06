import { useState } from 'react'
import Plane, { Vector, DraggableVector, Segment } from '../components/Plane.jsx'
import MatrixInput from '../components/MatrixInput.jsx'
import Quiz from '../components/Quiz.jsx'
import { Card, Panel, PresetRow, Stat, Experiment } from '../components/ui.jsx'
import { apply, eigen, fmt, normalize, rotation } from '../lib/math.js'

const PRESETS = [
  { label: 'Stretch', value: { a: 2, b: 0, c: 0, d: 0.5 }, title: 'Two real eigen-directions' },
  { label: 'Shear', value: { a: 1, b: 0, c: 1, d: 1 }, title: 'One repeated eigenvalue' },
  { label: 'Symmetric', value: { a: 2, b: 1, c: 1, d: 2 }, title: 'Orthogonal eigenvectors' },
  { label: 'Rotation', value: rotation(50), title: 'Complex eigenvalues — no real direction' },
  { label: 'Reflection', value: { a: 0, b: 1, c: 1, d: 0 }, title: 'λ = +1 and −1' },
]

export default function Eigen() {
  const [M, setM] = useState({ a: 2, b: 1, c: 1, d: 2 })
  const [v, setV] = useState({ x: 2, y: 1 })
  const E = eigen(M)
  const Mv = apply(M, v)

  // How aligned is v with an eigenvector? (for the "snap" hint)
  const vHat = normalize(v)
  let aligned = false
  if (E.real) {
    for (const e of E.vectors) {
      const cos = Math.abs(e.x * vHat.x + e.y * vHat.y)
      if (cos > 0.995) aligned = true
    }
  }

  const big = 9

  return (
    <div className="module">
      <header className="module-head">
        <h2>5 · Eigenvalues &amp; eigenvectors</h2>
        <p className="lead">
          Most vectors get knocked off their direction by a matrix. <b>Eigenvectors are the special
          directions that survive</b> — the transform only stretches or flips them. The stretch factor
          is the <b>eigenvalue λ</b>. They are the skeleton a transformation pivots around.
        </p>
      </header>

      <div className="lab">
        <div className="lab-stage">
          <Plane grid={M} showUnitSquare range={5} unitSquareColor="#ced4da">
            {/* eigen-direction lines (invariant axes) */}
            {E.real &&
              E.vectors.map((e, i) => (
                <Segment
                  key={i}
                  from={{ x: -e.x * big, y: -e.y * big }}
                  to={{ x: e.x * big, y: e.y * big }}
                  color="#f59f00"
                  dashed={false}
                  width={2}
                />
              ))}
            {/* probe vector and its image */}
            <Vector to={Mv} color="#e8590c" label="M·v" width={3} dashed />
            <DraggableVector value={v} onChange={setV} color="#12b886" label="v" />
          </Plane>
          <p className="muted small center">
            {E.real
              ? 'Orange lines are the eigen-directions. Drag v (green) onto one — its image M·v (orange) lines up with it.'
              : 'No orange lines: this matrix rotates every direction, so there are no real eigenvectors.'}
          </p>
        </div>

        <div className="lab-controls">
          <Panel title="The matrix">
            <MatrixInput value={M} onChange={setM} />
            <PresetRow presets={PRESETS} onPick={setM} />
          </Panel>

          <Panel title="Eigenvalues">
            {E.real ? (
              <div className="stat-row">
                <Stat label="λ₁" value={fmt(E.values[0])} color="#f59f00" />
                <Stat label="λ₂" value={fmt(E.values[1])} color="#f59f00" />
                <Stat label="type" value="real" color="#12b886" />
              </div>
            ) : (
              <div className="stat-row">
                <Stat
                  label="λ"
                  value={`${fmt(E.values[0].re)} ± ${fmt(Math.abs(E.values[0].im))} i`}
                  color="#7c5cff"
                />
                <Stat label="type" value="complex" color="#7c5cff" />
              </div>
            )}
            <p className="muted small">
              {E.real
                ? 'Each λ tells you the stretch along its eigen-direction. λ < 0 flips it; |λ| < 1 shrinks it.'
                : 'Complex eigenvalues mean a rotation component — no direction is left unmoved, so there is no real eigenvector.'}
            </p>
          </Panel>

          <Panel title="Alignment probe">
            <Stat
              label="v aligned with an eigenvector?"
              value={aligned ? 'yes — M·v ∥ v' : 'no'}
              color={aligned ? '#12b886' : '#868e96'}
            />
          </Panel>

          <Experiment>
            Pick the <b>Symmetric</b> preset and drag <b>v</b> until it lies on an orange line. Now M·v
            points the same way as v, just longer — that ratio is λ. Try <b>Rotation</b>: the orange
            lines vanish because a pure rotation moves every direction (complex eigenvalues).
          </Experiment>
        </div>
      </div>

      <Card className="reading">
        <h3>The eigenvalue equation, in words</h3>
        <p className="formula center">M v = λ v</p>
        <ul>
          <li>
            "Applying M to v is the same as just scaling v by λ." v keeps its direction (its line is
            <b> invariant</b>).
          </li>
          <li>
            <b>λ &gt; 1</b> stretches, <b>0 &lt; λ &lt; 1</b> shrinks, <b>λ &lt; 0</b> flips,{' '}
            <b>λ = 0</b> collapses that direction (singular matrix).
          </li>
          <li>
            <b>Symmetric</b> matrices always have real eigenvalues with perpendicular eigenvectors.
            <b> Rotations</b> have complex eigenvalues — no real invariant direction.
          </li>
          <li>
            Eigen-decomposition M = V Λ V⁻¹ means: change to eigen-coordinates, scale each axis by its λ,
            change back.
          </li>
        </ul>
      </Card>

      <Quiz
        title="Eigenvalues — concept check"
        questions={[
          {
            q: 'A vector v satisfies M v = 3v. What does that say geometrically?',
            options: [
              'v is rotated 3°',
              'v keeps its direction and is stretched ×3 by M',
              'v is sent to the origin',
              'M has determinant 3',
            ],
            answer: 1,
            explain:
              'M v = 3v means v lies on an invariant line; M just scales it by the eigenvalue 3 without turning it.',
          },
          {
            q: 'A pure rotation by 50° has what kind of eigenvalues?',
            options: [
              'Two positive real eigenvalues',
              'Complex eigenvalues — no real eigenvector',
              'A zero eigenvalue',
              'Eigenvalue 50',
            ],
            answer: 1,
            explain:
              'A rotation turns every direction, so no real vector keeps its line. The eigenvalues are complex (e^{±iθ}).',
          },
          {
            q: 'Why do symmetric matrices have perpendicular eigenvectors?',
            options: [
              'They don’t',
              'It is a special structural property (the spectral theorem) of symmetric matrices',
              'Because their determinant is 1',
              'Because they are always diagonal',
            ],
            answer: 1,
            explain:
              'The spectral theorem guarantees real eigenvalues and an orthogonal set of eigenvectors for any symmetric matrix — the basis of PCA.',
          },
        ]}
      />
    </div>
  )
}
