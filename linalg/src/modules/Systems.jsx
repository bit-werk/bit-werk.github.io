import { useState } from 'react'
import Plane, { Vector, Segment, Dot } from '../components/Plane.jsx'
import MatrixInput from '../components/MatrixInput.jsx'
import Quiz from '../components/Quiz.jsx'
import Check from '../components/Check.jsx'
import { Tex } from '../components/Tex.jsx'
import { Module, Unit, Observation, Split, Formal, Btn, PresetRow, Stat, Expert } from '../components/ui.jsx'
import { det, inverse, apply, fmt, normalize } from '../lib/math.js'

const sc = (v, k) => ({ x: v.x * k, y: v.y * k })
const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y })
const cross = (a, b) => a.x * b.y - a.y * b.x
const mag = (v) => Math.hypot(v.x, v.y)
const S = 360
const C = { e1: '#7048e8', e2: '#0ca678', c1: '#1769ff', c2: '#e8590c', b: '#e03131', sol: '#0b7a55' }

// A small editable 2×1 column vector.
function ColVec({ value, onChange, color }) {
  const set = (k) => (e) => {
    const n = parseFloat(e.target.value)
    onChange({ ...value, [k]: Number.isFinite(n) ? n : 0 })
  }
  return (
    <div className="colvec">
      <div className="bracket left" />
      <div className="colvec-grid">
        <input className="matrix-cell" type="number" step={1} value={fmt(value.x, 3)} onChange={set('x')} style={color ? { color } : undefined} />
        <input className="matrix-cell" type="number" step={1} value={fmt(value.y, 3)} onChange={set('y')} style={color ? { color } : undefined} />
      </div>
      <div className="bracket right" />
    </div>
  )
}

// One line of the system: n·x = r, drawn across the plane.
function EqLine({ n, r, color }) {
  const L = mag(n)
  if (L < 1e-9) return null
  const nhat = normalize(n)
  const p0 = sc(nhat, r / L) // closest point to origin
  const dir = { x: -nhat.y, y: nhat.x }
  return (
    <Segment from={add(p0, sc(dir, -10))} to={add(p0, sc(dir, 10))} color={color} dashed={false} width={2.5} />
  )
}

const PRESETS = [
  { label: 'Unique', A: { a: 2, b: 1, c: -1, d: 1 }, b: { x: 0, y: 3 } },
  { label: 'No solution', A: { a: 1, b: 2, c: 2, d: 4 }, b: { x: 1, y: 1 } },
  { label: 'Infinitely many', A: { a: 1, b: 2, c: 2, d: 4 }, b: { x: 1, y: 2 } },
]

function SystemLab() {
  const [A, setA] = useState({ a: 2, b: 1, c: -1, d: 1 })
  const [bvec, setBvec] = useState({ x: 0, y: 3 })
  const [mode, setMode] = useState('row')

  const D = det(A)
  const inv = inverse(A)
  const sol = inv ? apply(inv, bvec) : null

  // classify the solution set
  const col1 = { x: A.a, y: A.b }
  const col2 = { x: A.c, y: A.d }
  const dir = mag(col1) > 1e-6 ? col1 : col2
  const bInSpan = Math.abs(cross(dir, bvec)) < 0.06 + 0.01 * mag(bvec)
  const kind = Math.abs(D) > 1e-6 ? 'unique' : bInSpan ? 'infinite' : 'none'
  const kindColor = kind === 'unique' ? C.sol : kind === 'none' ? '#e03131' : '#f08c00'

  // row picture: equation i is (row i of A)·x = b_i
  const row1 = { x: A.a, y: A.c }
  const row2 = { x: A.b, y: A.d }

  return (
    <Split
      visual={
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Plane size={S} range={5}>
            {mode === 'row' ? (
              <>
                <EqLine n={row1} r={bvec.x} color={C.e1} />
                <EqLine n={row2} r={bvec.y} color={C.e2} />
                {kind === 'unique' && <Dot at={sol} color={C.sol} r={6} label="solution" />}
              </>
            ) : (
              <>
                {sol && (
                  <>
                    <Segment from={{ x: 0, y: 0 }} to={sc(col1, sol.x)} color={C.c1} dashed width={2} />
                    <Segment from={sc(col1, sol.x)} to={bvec} color={C.c2} dashed width={2} />
                  </>
                )}
                <Vector to={col1} color={C.c1} width={3} label="col 1" />
                <Vector to={col2} color={C.c2} width={3} label="col 2" />
                <Vector to={bvec} color={C.b} width={3} label="b" />
                <Dot at={bvec} color={C.b} />
              </>
            )}
          </Plane>
          <p className="muted small center" style={{ maxWidth: S }}>
            {mode === 'row'
              ? 'Axes = the unknowns (x₁, x₂). Each line is one equation; a solution lies on both.'
              : 'Axes = the output space (where b lives). Solve = combine the columns to reach b.'}
          </p>
        </div>
      }
    >
      <p>
        A linear system is <Tex>{String.raw`A x = b`}</Tex>: a known matrix <Tex>{String.raw`A`}</Tex>, an
        unknown vector <Tex>{String.raw`x = (x_1, x_2)`}</Tex>, a target <Tex>{String.raw`b`}</Tex>. The{' '}
        <b>same</b> system has two geometric readings — toggle between them:
      </p>
      <div className="seg">
        <Btn active={mode === 'row'} onClick={() => setMode('row')}>Row picture</Btn>
        <Btn active={mode === 'col'} onClick={() => setMode('col')}>Column picture</Btn>
      </div>
      <div className="mat-times-vec">
        <MatrixInput value={A} onChange={setA} columnLabels={false} step={1} />
        <ColVec value={{ x: 1, y: 1 }} onChange={() => {}} color="#adb5bd" />
        <span className="op">=</span>
        <ColVec value={bvec} onChange={setBvec} color={C.b} />
      </div>
      <p className="small muted" style={{ marginTop: -2 }}>
        (the middle column is the unknown <Tex>{String.raw`x`}</Tex>; edit A and b.)
      </p>
      {mode === 'row' ? (
        <p>
          <b>Row picture.</b> Each row of A gives one equation —{' '}
          <span style={{ color: C.e1 }}>{fmt(A.a)}·x₁ + {fmt(A.c)}·x₂ = {fmt(bvec.x)}</span> and{' '}
          <span style={{ color: C.e2 }}>{fmt(A.b)}·x₁ + {fmt(A.d)}·x₂ = {fmt(bvec.y)}</span> — and each is a
          line. A solution must sit on <b>both</b> lines, so it is their <b>intersection</b>.
        </p>
      ) : (
        <p>
          <b>Column picture.</b> Rewrite the system as{' '}
          <Tex>{String.raw`x_1\,\text{col}_1 + x_2\,\text{col}_2 = b`}</Tex>. Solving asks: <b>which
          combination</b> of the columns lands on <b style={{ color: C.b }}>b</b>?
        </p>
      )}
      <div className="stat-row">
        <Stat label="det A" value={fmt(D)} color={Math.abs(D) > 1e-6 ? C.sol : '#e03131'} />
        <Stat
          label="solutions"
          value={kind === 'unique' ? 'exactly one' : kind === 'none' ? 'none' : 'infinitely many'}
          color={kindColor}
        />
        {sol && <Stat label="x = (x₁, x₂)" value={`(${fmt(sol.x)}, ${fmt(sol.y)})`} color={C.sol} />}
      </div>
      <PresetRow
        presets={PRESETS.map((p) => ({ label: p.label, value: p }))}
        onPick={(p) => { setA(p.A); setBvec(p.b) }}
      />
      <Observation>
        Both pictures describe the identical system, but live in <b>different spaces</b>: the row picture
        plots the <b>unknowns</b> <Tex>{String.raw`(x_1,x_2)`}</Tex>; the column picture plots the{' '}
        <b>outputs</b>, where <Tex>{String.raw`b`}</Tex> lives. Switching viewpoints is often what makes a
        problem easy.
      </Observation>
      <Check
        prompt="In the row picture, the solution of a 2×2 system is…"
        options={['the midpoint of the two lines', 'the point where the two lines cross', 'the longer line']}
        answer={1}
        explain="Each equation is a line; a simultaneous solution must lie on both, i.e. at their intersection."
      />
    </Split>
  )
}

export default function Systems() {
  return (
    <Module>
      <header className="module-head">
        <h2>5 · Linear systems, geometrically</h2>
        <p className="lead">
          A system of linear equations is just <Tex>{String.raw`A x = b`}</Tex> in disguise. Reading it
          geometrically — as intersecting lines, or as a combination of columns — turns "solve the
          equations" into "find a point" and explains at a glance when a system has one solution, none, or
          infinitely many.
        </p>
      </header>

      <Unit n="5.0" kicker="Motivation" title="Equations, as geometry">
        <p>
          Two equations in two unknowns, <Tex>{String.raw`a x_1 + c x_2 = b_1`}</Tex> and{' '}
          <Tex>{String.raw`b x_1 + d x_2 = b_2`}</Tex>, stack into a single matrix equation:
        </p>
        <Tex block>{String.raw`\begin{bmatrix} a & c \\ b & d \end{bmatrix}\begin{bmatrix} x_1 \\ x_2 \end{bmatrix} = \begin{bmatrix} b_1 \\ b_2 \end{bmatrix} \qquad\text{i.e.}\qquad A x = b.`}</Tex>
        <p>
          From Chapter 1 we already know one equation <Tex>{String.raw`n^{\top} x = r`}</Tex> is a line
          (perpendicular to its normal <Tex>{String.raw`n`}</Tex>). A system is several such lines at once.
          From Chapter 3 we know <Tex>{String.raw`A x`}</Tex> is a combination of A's columns. Those are the
          two pictures.
        </p>
      </Unit>

      <Unit n="5.1" kicker="The two pictures" title="One system, two ways to see it">
        <SystemLab />
      </Unit>

      <Unit n="5.2" kicker="Outcomes" title="One, none, or infinitely many">
        <p>Toggle the presets above and watch both pictures explain each outcome:</p>
        <Formal title="The three cases (for a 2×2 system)">
          <ul className="tight">
            <li>
              <b>Exactly one</b> solution — the two lines <b>cross</b> at a point; equivalently the columns
              are <b>independent</b>, so the combination reaching <Tex>{String.raw`b`}</Tex> is unique.
              Here <Tex>{String.raw`\det A \neq 0`}</Tex>.
            </li>
            <li>
              <b>No</b> solution — the lines are <b>parallel and distinct</b>; equivalently the columns are
              dependent (span only a line) and <Tex>{String.raw`b`}</Tex> lies <b>off</b> that line, so no
              combination reaches it. Here <Tex>{String.raw`\det A = 0`}</Tex>.
            </li>
            <li>
              <b>Infinitely many</b> — the lines <b>coincide</b>; equivalently the columns are dependent and{' '}
              <Tex>{String.raw`b`}</Tex> <b>does</b> lie on their line, so many combinations work.{' '}
              <Tex>{String.raw`\det A = 0`}</Tex> as well.
            </li>
          </ul>
        </Formal>
        <Observation>
          The two zero-determinant cases (none vs. infinitely many) differ only by <b>whether{' '}
          <Tex>{String.raw`b`}</Tex> is in the span of the columns</b> — the column picture tells them apart
          instantly, while the row picture shows parallel-vs-identical lines.
        </Observation>
        <Check
          prompt="A 2×2 system has det A = 0 and the two lines are parallel but not the same line. How many solutions?"
          options={['exactly one', 'none', 'infinitely many']}
          answer={1}
          explain="Parallel distinct lines never meet ⇒ no solution. (In the column picture, b lies off the line spanned by the dependent columns.)"
        />
      </Unit>

      <Unit n="5.3" kicker="The big picture" title="Solvability is invertibility">
        <p>
          "When does <Tex>{String.raw`Ax = b`}</Tex> have exactly one solution <i>for every</i>{' '}
          <Tex>{String.raw`b`}</Tex>?" has a one-word answer: when <Tex>{String.raw`A`}</Tex> is{' '}
          <b>invertible</b>, in which case <Tex>{String.raw`x = A^{-1} b`}</Tex>. This snaps onto the
          equivalence chain from Chapter 2:
        </p>
        <Formal title="All the same condition (the equivalence web grows)">
          For a 2×2 matrix <Tex>{String.raw`A`}</Tex>, these are equivalent:
          <ul className="tight">
            <li><Tex>{String.raw`Ax = b`}</Tex> has a unique solution for every <Tex>{String.raw`b`}</Tex>;</li>
            <li><Tex>{String.raw`A`}</Tex> is <b>invertible</b> (Ch 8);</li>
            <li>columns are <b>independent</b> / they <b>span</b> <Tex>{String.raw`\mathbb{R}^2`}</Tex> (Ch 2);</li>
            <li><Tex>{String.raw`\det A \neq 0`}</Tex> (Ch 6);</li>
            <li>the only solution of <Tex>{String.raw`Ax = 0`}</Tex> is <Tex>{String.raw`x = 0`}</Tex>.</li>
          </ul>
        </Formal>
        <Check
          prompt="If A is invertible, how many solutions does Ax = b have?"
          options={['none', 'exactly one, namely x = A⁻¹b', 'infinitely many']}
          answer={1}
          explain="Invertibility means A⁻¹ exists, so x = A⁻¹b is the one and only solution — for any right-hand side b."
        />
      </Unit>

      <Unit n="5.4" kicker="Recap" title="What you can now do, and what's next">
        <Observation>
          <b>In one sentence:</b> solving <Tex>{String.raw`Ax=b`}</Tex> means finding where the equation-lines
          cross (row picture) — or which combination of A's columns reaches <Tex>{String.raw`b`}</Tex>{' '}
          (column picture) — and the number of solutions is governed entirely by whether{' '}
          <Tex>{String.raw`\det A`}</Tex> is non-zero.
        </Observation>
        <ul>
          <li><b>Row picture:</b> equations are lines; solutions are intersections.</li>
          <li><b>Column picture:</b> solving is hitting <Tex>{String.raw`b`}</Tex> with a combination of columns.</li>
          <li>Unique ⇔ <Tex>{String.raw`\det A \neq 0`}</Tex> ⇔ invertible ⇔ independent columns.</li>
        </ul>
        <p>
          That area-factor <Tex>{String.raw`\det A`}</Tex> keeps deciding everything — so Chapter 6 finally
          builds it from scratch and proves <i>why</i> it measures area.
        </p>
        <Expert
          title="Two solutions force infinitely many"
          solution={
            <>
              <p>
                Suppose <Tex>{String.raw`x_1 \neq x_2`}</Tex> both solve <Tex>{String.raw`Ax = b`}</Tex>. Let{' '}
                <Tex>{String.raw`d = x_2 - x_1 \neq 0`}</Tex>. Then
              </p>
              <Tex block>{String.raw`A d = A x_2 - A x_1 = b - b = 0.`}</Tex>
              <p>
                For any scalar t, <Tex>{String.raw`A(x_1 + t\,d) = A x_1 + t\,(Ad) = b + 0 = b`}</Tex>. So
                every <Tex>{String.raw`x_1 + t\,d`}</Tex> solves the system — infinitely many, since{' '}
                <Tex>{String.raw`d \neq 0`}</Tex>.
              </p>
              <p>
                (Geometrically: a non-zero <Tex>{String.raw`d`}</Tex> with <Tex>{String.raw`Ad = 0`}</Tex>{' '}
                forces <Tex>{String.raw`\det A = 0`}</Tex>, and the solution set is a whole line — the
                "infinitely many" case of this chapter.)
              </p>
            </>
          }
        >
          Prove: if <Tex>{String.raw`Ax = b`}</Tex> has <b>two distinct</b> solutions, then it has{' '}
          <b>infinitely many</b>.
        </Expert>
      </Unit>

      <Quiz
        title="Linear systems — chapter check"
        questions={[
          {
            q: 'In the row picture, each equation of a 2-variable system is…',
            options: ['a point', 'a line', 'a parabola', 'the whole plane'],
            answer: 1,
            explain: 'a·x₁ + c·x₂ = b₁ is a line (perpendicular to the normal (a, c)). The solution lies on every equation’s line.',
          },
          {
            q: 'In the column picture, solving Ax = b means…',
            options: [
              'rotating b until it matches A',
              'finding weights x₁, x₂ so x₁·col₁ + x₂·col₂ = b',
              'computing the determinant of b',
              'intersecting two lines',
            ],
            answer: 1,
            explain: 'Ax is a combination of A’s columns; solving asks for the weights that reach b.',
          },
          {
            q: 'A 2×2 system has det A = 0 and b lies on the line spanned by the (dependent) columns. How many solutions?',
            options: ['exactly one', 'none', 'infinitely many'],
            answer: 2,
            explain: 'Dependent columns + b in their span ⇒ many combinations reach b. In the row picture the two lines coincide.',
          },
          {
            q: 'Ax = b has a unique solution for every b exactly when…',
            options: [
              'A is the zero matrix',
              'A is invertible (det A ≠ 0)',
              'b = 0',
              'the columns are parallel',
            ],
            answer: 1,
            explain: 'Invertibility ⇔ det ≠ 0 ⇔ independent columns ⇔ unique solution x = A⁻¹b for every b.',
          },
        ]}
      />
    </Module>
  )
}
