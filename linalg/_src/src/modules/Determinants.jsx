import { useState } from 'react'
import Plane, { Vector, DraggableVector, Segment, usePlane } from '../components/Plane.jsx'
import MatrixInput from '../components/MatrixInput.jsx'
import Quiz from '../components/Quiz.jsx'
import Check from '../components/Check.jsx'
import { Tex } from '../components/Tex.jsx'
import { Module, Unit, Observation, Split, Formal, Stat, PresetRow, MatrixView, Expert } from '../components/ui.jsx'
import { det, multiply, projectOnto, fmt } from '../lib/math.js'

const C = { u: '#1769ff', v: '#e8590c', h: '#7c5cff' }
const sc = (p, k) => ({ x: p.x * k, y: p.y * k })

// small arc showing the signed turn from u to v (orientation)
function TurnArc({ u, v, color, r = 0.8 }) {
  const { toScreen } = usePlane()
  const a1 = Math.atan2(u.y, u.x)
  let d = Math.atan2(v.y, v.x) - a1
  while (d > Math.PI) d -= 2 * Math.PI
  while (d < -Math.PI) d += 2 * Math.PI
  const N = 24
  const pts = []
  for (let k = 0; k <= N; k++) {
    const a = a1 + (d * k) / N
    pts.push(toScreen({ x: r * Math.cos(a), y: r * Math.sin(a) }))
  }
  return <path d={pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ')} fill="none" stroke={color} strokeWidth="2.5" />
}

const PRESETS = [
  { label: 'det = 1', value: [{ x: 1, y: 0 }, { x: 0, y: 1 }] },
  { label: 'det = 2', value: [{ x: 2, y: 0 }, { x: 0, y: 1 }] },
  { label: 'det = 0', value: [{ x: 1, y: 0.5 }, { x: 2, y: 1 }] },
  { label: 'det < 0', value: [{ x: 0, y: 1 }, { x: 1, y: 0 }] },
]

/* 6.1 — the determinant is signed area (covers area, sign, collapse) */
function AreaLab() {
  const [u, setU] = useState({ x: 1.6, y: 0.3 })
  const [v, setV] = useState({ x: 0.4, y: 1.4 })
  const M = { a: u.x, b: u.y, c: v.x, d: v.y }
  const D = det(M)
  const area = Math.abs(D)
  const positive = D > 1e-6
  const negative = D < -1e-6
  const color = positive ? '#12b886' : negative ? '#e8590c' : '#e03131'
  const orient = positive ? 'preserved (+)' : negative ? 'flipped (−)' : 'collapsed (0)'
  const foot = projectOnto(v, u) // foot of the perpendicular height of v onto the line of u
  return (
    <Split
      visual={
        <Plane size={460} range={4} grid={M} showGhost showUnitSquare unitSquareColor={color}>
          <TurnArc u={u} v={v} color={color} />
          <Segment from={v} to={foot} color={C.h} dashed width={2} />
          <DraggableVector value={u} onChange={setU} color={C.u} label="u = col 1" snap={0.25} />
          <DraggableVector value={v} onChange={setV} color={C.v} label="v = col 2" snap={0.25} />
        </Plane>
      }
    >
      <p>
        The determinant answers one question: <b>how much does this matrix scale area</b>, and does it{' '}
        <b>flip orientation</b>? The unit square (area 1) becomes the shaded parallelogram spanned by the
        columns <b style={{ color: C.u }}>u</b> and <b style={{ color: C.v }}>v</b>; its <b>signed area</b>{' '}
        <i>is</i> the determinant.
      </p>
      <Tex block>{String.raw`\det M = \textcolor{${C.u}}{u_1}\,\textcolor{${C.v}}{v_2} - \textcolor{${C.u}}{u_2}\,\textcolor{${C.v}}{v_1} = \textcolor{${C.u}}{(${fmt(u.x)})}\,\textcolor{${C.v}}{(${fmt(v.y)})} - \textcolor{${C.u}}{(${fmt(u.y)})}\,\textcolor{${C.v}}{(${fmt(v.x)})} = ${fmt(D)}`}</Tex>
      <div className="stat-row">
        <Stat label="area of image" value={fmt(area)} color={color} />
        <Stat label="det (signed)" value={fmt(D)} color={color} />
        <Stat label="orientation" value={orient} color={color} />
      </div>
      <PresetRow presets={PRESETS} onPick={([c1, c2]) => { setU(c1); setV(c2) }} />
      <Observation>
        <b>Three things in one panel.</b> The <span style={{ color: C.h }}>purple</span> segment is the
        height of the parallelogram on base <b style={{ color: C.u }}>u</b>, so its area is{' '}
        <b>base × height</b>. Swing <b style={{ color: C.v }}>v</b> <b>counter-clockwise</b> from u and the
        det is <b style={{ color: '#12b886' }}>positive</b>; <b>clockwise</b> and it turns{' '}
        <b style={{ color: '#e8590c' }}>negative</b> (space was mirror-flipped); line v up <b>with</b> u and
        the height — and the det — drop to <b style={{ color: '#e03131' }}>0</b>.
      </Observation>
      <Check
        prompt="A matrix has det = −3. What does that tell you?"
        options={['area is scaled by −3 (a negative area)', 'area is scaled by 3 and orientation is flipped', 'the matrix is the identity']}
        answer={1}
        explain="Area is the magnitude |−3| = 3; the minus sign means orientation reversed (a reflection happened). Area itself is never negative."
      />
      <Check
        prompt="You drag v until it is parallel to u. The determinant becomes…"
        options={['1', '0', 'undefined']}
        answer={1}
        explain="Parallel columns give a degenerate (zero-height) parallelogram: area 0, so det = 0. The square has been crushed onto a line."
      />
    </Split>
  )
}

/* 6.4 — multiplicativity */
function DetMultLab() {
  const [A, setA] = useState({ a: 2, b: 0, c: 1, d: 1 })
  const [B, setB] = useState({ a: 1, b: 1, c: 0, d: 2 })
  const AB = multiply(A, B)
  const dA = det(A)
  const dB = det(B)
  const dAB = det(AB)
  return (
    <Split
      visual={
        <div className="compute-box">
          <div className="mgrid-row">
            <div className="mgrid-wrap"><div className="mgrid-label">A</div><MatrixView M={A} /></div>
            <span className="mgrid-op">·</span>
            <div className="mgrid-wrap"><div className="mgrid-label">B</div><MatrixView M={B} /></div>
            <span className="mgrid-op">=</span>
            <div className="mgrid-wrap"><div className="mgrid-label">AB</div><MatrixView M={AB} /></div>
          </div>
          <div className="compute-result" style={{ textAlign: 'center' }}>
            <div>det A · det B = <b>{fmt(dA)} · {fmt(dB)} = {fmt(dA * dB)}</b></div>
            <div>det(AB) = <b style={{ color: '#12b886' }}>{fmt(dAB)}</b></div>
          </div>
        </div>
      }
    >
      <p>
        Composing two maps multiplies their area-scaling factors — so determinants <b>multiply</b>:
      </p>
      <Tex block>{String.raw`\det(AB) = \det(A)\,\det(B)`}</Tex>
      <div className="mat-pair">
        <div><div className="stat-label">A</div><MatrixInput value={A} onChange={setA} columnLabels={false} /></div>
        <div><div className="stat-label">B</div><MatrixInput value={B} onChange={setB} columnLabels={false} /></div>
      </div>
      <Formal title="Consequences">
        <ul className="tight">
          <li><Tex>{String.raw`\det(I) = 1`}</Tex> — the do-nothing map preserves area.</li>
          <li><Tex>{String.raw`\det(A^{-1}) = 1/\det(A)`}</Tex> — undoing a ×k area stretch scales area by 1/k (so an inverse needs <Tex>{String.raw`\det A \neq 0`}</Tex>).</li>
          <li>Order doesn't matter here: <Tex>{String.raw`\det(AB) = \det(BA)`}</Tex>, even though <Tex>{String.raw`AB \neq BA`}</Tex>.</li>
        </ul>
      </Formal>
      <Check
        prompt="If det A = 2 and det B = 5, what is det(AB)?"
        options={['7', '10', '2.5']}
        answer={1}
        explain="det(AB) = det(A)·det(B) = 2·5 = 10. Two area-scalings compose by multiplying."
      />
    </Split>
  )
}

export default function Determinants() {
  return (
    <Module>
      <header className="module-head">
        <h2>6 · Determinants</h2>
        <p className="lead">
          One number per square matrix decides almost everything: <b>how much it scales area</b> (or volume),
          whether it <b>flips orientation</b>, and whether it can be <b>undone</b>. This chapter builds that
          number from scratch and proves why the famous <Tex>{String.raw`ad - bc`}</Tex> measures area.
        </p>
      </header>

      <Unit n="6.0" kicker="Motivation" title="The number that scales area">
        <p>
          A linear map stretches some regions and shrinks others — but, because it is linear, it scales{' '}
          <i>every</i> region by the <b>same</b> factor. That single factor is the <b>determinant</b>. Knowing
          it tells you at a glance whether a map merely rescales space, mirror-flips it, or fatally collapses
          a dimension.
        </p>
        <p>The cleanest probe is the unit square: track what happens to <i>its</i> area, and you know the factor for everything.</p>
      </Unit>

      <Unit n="6.1" kicker="The idea" title="The determinant is signed area">
        <AreaLab />
      </Unit>

      <Unit n="6.2" kicker="Why" title="Where ad − bc comes from">
        <p>
          Why should the arithmetic <Tex>{String.raw`u_1 v_2 - u_2 v_1`}</Tex> equal an <b>area</b>? Start
          from <b>base × height</b>. Take <Tex>{String.raw`u`}</Tex> as the base, length{' '}
          <Tex>{String.raw`|u|`}</Tex>. The height is the part of <Tex>{String.raw`v`}</Tex>{' '}
          <b>perpendicular</b> to u, which is <Tex>{String.raw`|v|\sin\theta`}</Tex> (the purple segment
          above), where <Tex>{String.raw`\theta`}</Tex> is the signed angle from u to v:
        </p>
        <Tex block>{String.raw`\text{signed area} = |u|\,\big(|v|\sin\theta\big) = |u|\,|v|\sin\theta.`}</Tex>
        <p>
          Now write the columns in polar form — <Tex>{String.raw`u = |u|(\cos\alpha, \sin\alpha)`}</Tex>,{' '}
          <Tex>{String.raw`v = |v|(\cos\beta, \sin\beta)`}</Tex> — and expand the arithmetic; the{' '}
          <b>angle-subtraction identity</b> collapses it exactly to that area:
        </p>
        <Tex block>{String.raw`u_1 v_2 - u_2 v_1 = |u|\cos\alpha\,|v|\sin\beta - |u|\sin\alpha\,|v|\cos\beta = |u|\,|v|\,(\sin\beta\cos\alpha - \cos\beta\sin\alpha)`}</Tex>
        <Tex block>{String.raw`= |u|\,|v|\,\sin(\beta - \alpha) = |u|\,|v|\sin\theta = \det M.`}</Tex>
        <Observation>
          So <Tex>{String.raw`\det M = u_1 v_2 - u_2 v_1 = ad - bc`}</Tex> is literally the signed area of the
          column parallelogram. Notice the perfect rhyme with Chapter 1: the dot product gave{' '}
          <Tex>{String.raw`|u||v|\cos\theta`}</Tex> (alignment); the determinant gives{' '}
          <Tex>{String.raw`|u||v|\sin\theta`}</Tex> (spread). The <b>sign</b> is the sign of{' '}
          <Tex>{String.raw`\sin\theta`}</Tex>: positive when v is counter-clockwise from u, negative when
          clockwise, zero when collinear.
        </Observation>
        <Formal title="The elegant alternative">
          Signed area is the <i>only</i> function of the two columns that is <b>linear in each column</b>,{' '}
          <b>alternating</b> (zero when the columns are equal), and equals <b>1</b> on{' '}
          <Tex>{String.raw`\hat\imath, \hat\jmath`}</Tex>. Those three rules force the formula{' '}
          <Tex>{String.raw`ad - bc`}</Tex> with no pictures at all — and they are exactly how the determinant
          is defined in higher dimensions.
        </Formal>
      </Unit>

      <Unit n="6.3" kicker="The big picture" title="Determinant zero = not invertible">
        <p>
          The single most consequential reading: <Tex>{String.raw`\det M = 0`}</Tex> means the unit square was
          crushed to <b>zero area</b> — space lost a dimension. Many inputs now map to the same output, so the
          map <b>cannot be undone</b>. This slots straight into the equivalence chain from Chapters 2 and 5:
        </p>
        <Formal title="All the same condition">
          For a 2×2 matrix <Tex>{String.raw`M`}</Tex>, these are equivalent:
          <ul className="tight">
            <li><Tex>{String.raw`\det M \neq 0`}</Tex>;</li>
            <li>columns are <b>linearly independent</b> / <b>span</b> <Tex>{String.raw`\mathbb{R}^2`}</Tex> (Ch 2);</li>
            <li><Tex>{String.raw`M`}</Tex> is <b>invertible</b> (Ch 8);</li>
            <li><Tex>{String.raw`Mx = b`}</Tex> has a unique solution for every <Tex>{String.raw`b`}</Tex> (Ch 5);</li>
            <li><Tex>{String.raw`Mx = 0`}</Tex> only for <Tex>{String.raw`x = 0`}</Tex>.</li>
          </ul>
          A <b>zero</b> determinant flips every one of these to its negative.
        </Formal>
        <Check
          prompt="det M = 0. Which statement is then TRUE?"
          options={['M has an inverse', 'The columns of M are linearly independent', 'M collapses the plane onto a line (or point) and has no inverse']}
          answer={2}
          explain="Zero area ⇒ the image is at most a line ⇒ dependent columns, no inverse. Every member of the equivalence chain fails together."
        />
      </Unit>

      <Unit n="6.4" kicker="Property" title="Determinants multiply">
        <DetMultLab />
      </Unit>

      <Unit n="6.5" kicker="Looking up" title="Volume in higher dimensions">
        <p>
          The story scales without change. In 3D the determinant of a 3×3 matrix is the <b>signed volume</b> of
          the parallelepiped spanned by its three columns; in n dimensions it is the signed n-volume. The sign
          still tracks orientation (right-handed vs. left-handed), and <Tex>{String.raw`\det = 0`}</Tex> still
          means the columns are dependent — they fail to fill all n dimensions, flattening the volume.
        </p>
        <Check
          prompt="A 3×3 matrix has det = 0. Geometrically, its three columns…"
          options={['span all of 3D space', 'lie in a common plane (or line), so they enclose zero volume', 'are perpendicular']}
          answer={1}
          explain="Zero volume means the three columns are linearly dependent — they fit inside a plane (or line), enclosing no 3-D volume. The map is singular."
        />
      </Unit>

      <Unit n="6.6" kicker="Recap" title="What you can now do, and what's next">
        <Observation>
          <b>In one sentence:</b> the determinant is the signed area (in 2D) or volume (in nD) that a matrix's
          columns enclose — the factor by which it scales every region, with a sign for orientation and a zero
          exactly when the map collapses and loses invertibility.
        </Observation>
        <ul>
          <li><Tex>{String.raw`\det M = ad - bc = |u||v|\sin\theta`}</Tex> = signed area of the column parallelogram.</li>
          <li><b>Sign</b> = orientation (+ preserved, − flipped); <b>0</b> = collapsed = singular = dependent columns.</li>
          <li><Tex>{String.raw`\det(AB) = \det A\,\det B`}</Tex>, <Tex>{String.raw`\det(A^{-1}) = 1/\det A`}</Tex>.</li>
        </ul>
        <p>
          That signed area <Tex>{String.raw`ad - bc`}</Tex> is also the 2-D <b>cross product</b> — the natural
          next step, where orientation and area meet in <b>Chapter 7</b>.
        </p>
        <Expert
          title="Why a column operation preserves the determinant"
          solution={
            <>
              <p><b>Algebra.</b> With columns u and v,</p>
              <Tex block>{String.raw`\det[\,u,\; v + k u\,] = u_1(v_2 + k u_2) - u_2(v_1 + k u_1) = u_1 v_2 - u_2 v_1 = \det[\,u,\,v\,],`}</Tex>
              <p>because the extra terms <Tex>{String.raw`k\,u_1 u_2 - k\,u_2 u_1`}</Tex> cancel.</p>
              <p>
                <b>Geometry.</b> Replacing v by <Tex>{String.raw`v + k u`}</Tex> slides the far side of the
                parallelogram parallel to the base u — a <b>shear</b>. It changes neither the base length{' '}
                <Tex>{String.raw`|u|`}</Tex> nor the height (perpendicular distance to u's line), so the area is
                unchanged. This is exactly why Gaussian elimination (Chapter 9) leaves the determinant fixed.
              </p>
            </>
          }
        >
          Prove that adding a multiple of one column to another leaves the determinant unchanged,{' '}
          <Tex>{String.raw`\det[\,u,\; v + k u\,] = \det[\,u,\,v\,]`}</Tex> — algebraically <i>and</i>{' '}
          geometrically.
        </Expert>
      </Unit>

      <Quiz
        title="Determinants — chapter check"
        questions={[
          {
            q: 'Geometrically, |det M| for a 2×2 matrix M is…',
            options: ['the length of the longer column', 'the area of the parallelogram spanned by its columns', 'the angle between the columns', 'always 1'],
            answer: 1,
            explain: 'The columns span a parallelogram (the image of the unit square); its area is |det M|.',
          },
          {
            q: 'A negative determinant means the map…',
            options: ['shrinks everything to a point', 'reverses orientation (mirror-flip), scaling area by |det|', 'is a pure rotation', 'has no inverse'],
            answer: 1,
            explain: 'The magnitude scales area; the negative sign flips orientation — an odd number of reflections.',
          },
          {
            q: 'Why does ad − bc equal the area of the column parallelogram?',
            options: [
              'By definition, with no reason',
              'Because area = base × height = |u||v|sinθ, and expanding in coordinates gives u₁v₂ − u₂v₁',
              'Because the columns are unit vectors',
              'Only when det = 1',
            ],
            answer: 1,
            explain: 'Base×height = |u||v|sinθ; writing the columns in polar form and using sin(β−α) yields exactly u₁v₂ − u₂v₁ = ad − bc.',
          },
          {
            q: 'det(AB) for square A, B equals…',
            options: ['det A + det B', 'det A · det B', 'det A − det B', 'det A only'],
            answer: 1,
            explain: 'Determinants are multiplicative: composing maps multiplies their area-scaling factors, det(AB) = det A · det B.',
          },
        ]}
      />
    </Module>
  )
}
