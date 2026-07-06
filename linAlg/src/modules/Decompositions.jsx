import { useState } from 'react'
import Plane, { Vector } from '../components/Plane.jsx'
import MatrixInput from '../components/MatrixInput.jsx'
import Quiz from '../components/Quiz.jsx'
import { Card, Panel, Btn, MatrixView, Experiment } from '../components/ui.jsx'
import { apply, multiply, lu, qr, fmt, det, IDENTITY } from '../lib/math.js'

export default function Decompositions() {
  const [M, setM] = useState({ a: 2, b: 1, c: 1, d: 2 })
  const [mode, setMode] = useState('qr') // 'lu' | 'qr'
  const [step, setStep] = useState(2)

  const luRes = lu(M)
  const qrRes = qr(M)

  // Build the chain of transforms applied right-to-left.
  // step 0 = identity, step 1 = inner factor, step 2 = full matrix M.
  let inner, outer, innerName, outerName, blurb
  if (mode === 'lu') {
    inner = luRes.U
    outer = luRes.L
    innerName = 'U'
    outerName = 'L'
    blurb =
      'LU writes M = L · U. U (upper-triangular) shears/scales space onto a tilted grid; L (lower-triangular) shears it the rest of the way. It is exactly the bookkeeping of Gaussian elimination.'
  } else {
    inner = qrRes.R
    outer = qrRes.Q
    innerName = 'R'
    outerName = 'Q'
    blurb =
      'QR writes M = Q · R. R (upper-triangular) stretches and shears the unit square into the right shape; Q (orthogonal) then rigidly rotates/reflects it into final place without distorting it.'
  }

  const stageMatrix = step === 0 ? IDENTITY : step === 1 ? inner : M
  const stepLabel = step === 0 ? 'Start (identity)' : step === 1 ? `After ${innerName}` : `After ${outerName}·${innerName} = M`

  return (
    <div className="module">
      <header className="module-head">
        <h2>3 · Matrix decompositions</h2>
        <p className="lead">
          A decomposition factors one complicated transformation into a <b>sequence of simple ones</b>.
          Instead of moving space all at once, you move it in easy stages — each factor with a clear
          geometric job.
        </p>
      </header>

      <div className="seg">
        <Btn active={mode === 'qr'} onClick={() => { setMode('qr'); setStep(2) }}>QR</Btn>
        <Btn active={mode === 'lu'} onClick={() => { setMode('lu'); setStep(2) }}>LU</Btn>
      </div>

      <div className="lab">
        <div className="lab-stage">
          <Plane grid={stageMatrix} showUnitSquare range={5}>
            <Vector to={apply(stageMatrix, { x: 1, y: 0 })} color="#1769ff" label="î" width={3.5} />
            <Vector to={apply(stageMatrix, { x: 0, y: 1 })} color="#e8590c" label="ĵ" width={3.5} />
          </Plane>
          <p className="muted small center">{stepLabel}</p>
        </div>

        <div className="lab-controls">
          <Panel title="Set up M">
            <MatrixInput value={M} onChange={(m) => setM(m)} />
          </Panel>

          <Panel title="Step through the factors">
            <div className="btn-row">
              <Btn active={step === 0} onClick={() => setStep(0)}>1 · Identity</Btn>
              <Btn active={step === 1} onClick={() => setStep(1)}>2 · Apply {innerName}</Btn>
              <Btn active={step === 2} onClick={() => setStep(2)}>3 · Apply {outerName}</Btn>
            </div>
            <p className="muted small">
              Factors act right-to-left: {outerName} · {innerName} means {innerName} happens first.
            </p>
          </Panel>

          <Panel title="The factors">
            <div className="factor-eq">
              <MatrixView M={M} /> <span>=</span>{' '}
              <MatrixView M={outer} color="#1769ff" /> <span>·</span>{' '}
              <MatrixView M={inner} color="#e8590c" />
            </div>
            <div className="factor-legend">
              <span style={{ color: '#1769ff' }}>
                {outerName}: {mode === 'qr' ? 'orthogonal (rotation/reflection)' : 'lower-triangular'}
              </span>
              <span style={{ color: '#e8590c' }}>
                {innerName}: {mode === 'qr' ? 'upper-triangular (stretch + shear)' : 'upper-triangular'}
              </span>
            </div>
            {mode === 'qr' && (
              <p className="muted small">
                Check: det(Q) = {fmt(det(qrRes.Q))} (±1, a rigid motion) and det(R) ={' '}
                {fmt(det(qrRes.R))}, so det(M) = {fmt(det(M))}.
              </p>
            )}
          </Panel>

          <Experiment>{blurb}</Experiment>
        </div>
      </div>

      <Card className="reading">
        <h3>Geometric job of each factor</h3>
        <ul>
          <li>
            <b>QR — Q</b> is orthogonal: it only rotates or reflects, never distorts. <b>R</b> holds all
            the stretching and shearing. Great for least-squares and stable solving.
          </li>
          <li>
            <b>LU — U</b> then <b>L</b> are both triangular shears; multiplying them reproduces M while
            recording the steps of Gaussian elimination. Great for solving many systems with the same M.
          </li>
          <li>
            Because each factor is simple, det(M) is just the product of the factors' determinants, and
            triangular systems solve by direct substitution.
          </li>
        </ul>
      </Card>

      <Quiz
        title="Decompositions — concept check"
        questions={[
          {
            q: 'In QR = M, what is geometrically special about Q?',
            options: [
              'It is diagonal',
              'It is orthogonal — a rigid rotation/reflection that preserves lengths and angles',
              'It has determinant 0',
              'It is always the identity',
            ],
            answer: 1,
            explain:
              'Q’s columns are orthonormal, so Q just rotates or reflects space. All the stretching lives in the triangular R.',
          },
          {
            q: 'Why decompose M = L·U before solving many systems Mx = b?',
            options: [
              'It changes the solution',
              'Triangular factors solve quickly by substitution, and L,U are computed once and reused',
              'It makes det(M) zero',
              'It rotates b',
            ],
            answer: 1,
            explain:
              'Once you have L and U, each new b is solved with cheap forward/back substitution — no need to re-eliminate.',
          },
          {
            q: 'If det(Q) = 1 and det(R) = 6 for M = QR, then det(M) is…',
            options: ['7', '6', '1', '0'],
            answer: 1,
            explain: 'det(M) = det(Q)·det(R) = 1·6 = 6. Q (a rotation) contributes a factor of ±1.',
          },
        ]}
      />
    </div>
  )
}
