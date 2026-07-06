import { useState } from 'react'
import Plane, { Vector, DraggableVector, Segment, Dot, usePlane } from '../components/Plane.jsx'
import Slider from '../components/Slider.jsx'
import Check from '../components/Check.jsx'
import Quiz from '../components/Quiz.jsx'
import { Tex } from '../components/Tex.jsx'
import { Module, Unit, Observation, Split, Stat, Formal, Expert } from '../components/ui.jsx'
import { dot, projectOnto, normalize, fmt } from '../lib/math.js'

const mag = (v) => Math.hypot(v.x, v.y)
const sc = (v, k) => ({ x: v.x * k, y: v.y * k })

const C = { u: '#1769ff', v: '#e8590c', proj: '#7c5cff', arc: '#7048e8' }
const cu = (s) => String.raw`\textcolor{${C.u}}{${s}}`
const cv = (s) => String.raw`\textcolor{${C.v}}{${s}}`

// A small arc marking the angle between two vectors at the origin.
function AngleArc({ u, v, color = C.arc, r = 0.95 }) {
  const { toScreen } = usePlane()
  const a1 = Math.atan2(u.y, u.x)
  let d = Math.atan2(v.y, v.x) - a1
  while (d > Math.PI) d -= 2 * Math.PI
  while (d < -Math.PI) d += 2 * Math.PI
  const N = 28
  const pts = []
  for (let k = 0; k <= N; k++) {
    const a = a1 + (d * k) / N
    pts.push(toScreen({ x: r * Math.cos(a), y: r * Math.sin(a) }))
  }
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ')
  return <path d={path} fill="none" stroke={color} strokeWidth="2.5" />
}

/* 1.1 — one widget for: the two formulas, length, angle, sign, orthogonality */
function Explorer() {
  const [u, setU] = useState({ x: 3, y: 1 })
  const [v, setV] = useState({ x: 1, y: 2 })
  const d = dot(u, v)
  const mu = mag(u)
  const mv = mag(v)
  const cos = d / (mu * mv || 1)
  const ang = (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI
  const perp = Math.abs(d) < 0.12
  const sign = perp ? 'right angle' : d > 0 ? 'acute (under 90°)' : 'obtuse (over 90°)'
  const sColor = perp ? '#e03131' : d > 0 ? '#12b886' : '#e8590c'
  const pdir = normalize({ x: -u.y, y: u.x })
  return (
    <Split
      visual={
        <Plane size={440} range={4}>
          <Segment from={sc(pdir, -9)} to={sc(pdir, 9)} color={perp ? '#12b886' : '#eef0f5'} dashed={false} width={1.5} />
          <AngleArc u={u} v={v} color={sColor} />
          <DraggableVector value={u} onChange={setU} color={C.u} label="u" snap={0.5} />
          <DraggableVector value={v} onChange={setV} color={C.v} label="v" snap={0.5} />
        </Plane>
      }
    >
      <p>
        This one panel is the whole chapter in miniature. Drag <b style={{ color: C.u }}>u</b> and{' '}
        <b style={{ color: C.v }}>v</b>; the dot product packs <b>length</b>, <b>angle</b> and{' '}
        <b>orientation</b> into a single number, computed two equivalent ways:
      </p>
      <Tex block>{String.raw`u^{\top}v = ${cu(fmt(u.x))}\!\cdot\!${cv(fmt(v.x))} + ${cu(fmt(u.y))}\!\cdot\!${cv(fmt(v.y))} = ${fmt(d)}`}</Tex>
      <Tex block>{String.raw`|u|\,|v|\cos\theta = ${fmt(mu)}\cdot ${fmt(mv)}\cdot\cos ${fmt(ang, 1)}^\circ = ${fmt(mu * mv * cos)}`}</Tex>
      <div className="stat-row">
        <Stat label="uᵀv" value={fmt(d)} color={sColor} />
        <Stat label="θ" value={`${fmt(ang, 1)}°`} />
        <Stat label="angle is" value={sign} color={sColor} />
      </div>
      <Observation>
        <b>Things to try, one at a time.</b> Align u and v (θ → 0): the dot grows to its maximum{' '}
        <Tex>{String.raw`|u||v|`}</Tex>. Swing v onto the <b style={{ color: '#12b886' }}>green line</b>{' '}
        (90°): the dot hits <b>exactly 0</b> — that is what perpendicular means. Push past 90°: it goes{' '}
        <b>negative</b>. Now hold the angle fixed and just lengthen v: the dot scales with{' '}
        <Tex>{String.raw`|v|`}</Tex>. Use the <b>grid</b> toggle if you want free movement, or zoom to read
        small angles.
      </Observation>
      <Check
        prompt="You rotate v so the angle to u is 120°. The dot product uᵀv is…"
        options={['positive', 'zero', 'negative']}
        answer={2}
        explain="cos 120° < 0, and lengths are positive, so uᵀv < 0. Any angle beyond 90° gives a negative dot product."
      />
      <Check
        prompt="Without changing directions, you double the length of v. What happens to uᵀv?"
        options={['unchanged', 'doubles', 'halves']}
        answer={1}
        explain="uᵀv = |u||v|cosθ is linear in |v|: doubling v’s length doubles the dot product. Only direction sets the sign."
      />
    </Split>
  )
}

/* 1.3 — length (a distinct picture: the right triangle) */
function LengthLab() {
  const [v, setV] = useState({ x: 3, y: 2 })
  const v1 = fmt(v.x)
  const v2 = fmt(v.y)
  const ss = fmt(v.x * v.x + v.y * v.y)
  const len = fmt(mag(v))
  return (
    <Split
      visual={
        <Plane size={440} range={4}>
          <Segment from={{ x: 0, y: 0 }} to={{ x: v.x, y: 0 }} color={C.u} dashed width={2} />
          <Segment from={{ x: v.x, y: 0 }} to={v} color={C.v} dashed width={2} />
          <DraggableVector value={v} onChange={setV} color="#12b886" label="v" snap={0.5} />
        </Plane>
      }
    >
      <p>
        Dot a vector with <i>itself</i>: the angle is <Tex>{String.raw`0`}</Tex>, so{' '}
        <Tex>{String.raw`\cos\theta = 1`}</Tex> and you get the squared length — exactly <b>Pythagoras</b>{' '}
        on the dashed legs:
      </p>
      <Tex block>{String.raw`v^{\top} v = v_1^2 + v_2^2 = |v|^2 \;\Longrightarrow\; |v| = \sqrt{v^{\top} v} = ${fmt(mag(v))}`}</Tex>
      <p>With the vector you're dragging right now (its blue and orange legs):</p>
      <Tex block>{String.raw`\begin{bmatrix} ${cu(v1)} & ${cv(v2)} \end{bmatrix}\!\begin{bmatrix} ${cu(v1)} \\ ${cv(v2)} \end{bmatrix} = (${cu(v1)})^2 + (${cv(v2)})^2 = ${ss} \;\Longrightarrow\; |v| = \sqrt{${ss}} = ${len}`}</Tex>
      <Observation>
        Length is not a new idea — it is <Tex>{String.raw`\sqrt{v^{\top}v}`}</Tex>. A vector with{' '}
        <Tex>{String.raw`v^{\top}v = 1`}</Tex> is a <b>unit vector</b>; dividing by <Tex>{String.raw`|v|`}</Tex>{' '}
        (normalizing) always makes one.
      </Observation>
    </Split>
  )
}

/* 1.4 — projection (the single shadow widget) */
function ProjLab() {
  const [u, setU] = useState({ x: 2.2, y: 3 })
  const [v, setV] = useState({ x: 3, y: 0.6 })
  const d = dot(u, v)
  const vtv = dot(v, v)
  const vlen = mag(v)
  const comp = d / (vlen || 1)
  const k = d / (vtv || 1)
  const p = projectOnto(u, v)
  return (
    <Split
      visual={
        <Plane size={440} range={4}>
          <Segment from={sc(normalize(v), -7)} to={sc(normalize(v), 7)} color="#e9ecf3" dashed={false} width={1.5} />
          <Vector to={p} color={C.proj} width={4} label="projᵥu" />
          <Segment from={u} to={p} color="#e03131" dashed width={2} />
          <DraggableVector value={u} onChange={setU} color={C.u} label="u" snap={0.5} />
          <DraggableVector value={v} onChange={setV} color={C.v} label="v" snap={0.5} />
          <Dot at={p} color={C.proj} />
        </Plane>
      }
    >
      <p>
        The dot product also measures <b>how much of <span style={{ color: C.u }}>u</span> lies along{' '}
        <span style={{ color: C.v }}>v</span></b>. Two quantities, easy to mix up — one is a <b>length</b>,
        the other an <b>arrow</b>:
      </p>
      <p>
        <b>1 · scalar projection</b> — the shadow's length, dividing by <Tex>{String.raw`|v|`}</Tex> once:
      </p>
      <Tex block>{String.raw`\text{comp}_v\,u = \frac{u^{\top} v}{|v|} = u^{\top}\hat v`}</Tex>
      <p>
        <b>2 · vector projection</b> — that length put back as an arrow, by scaling the <b>unit</b> vector{' '}
        <Tex>{String.raw`\hat v = v/|v|`}</Tex> (not v itself):
      </p>
      <Tex block>{String.raw`\text{proj}_v\,u = \big(\text{comp}_v\,u\big)\hat v = \frac{u^{\top}v}{|v|}\cdot\frac{v}{|v|} = \frac{u^{\top} v}{v^{\top} v}\,v`}</Tex>
      <div className="stat-row">
        <Stat label="shadow length compᵥu" value={fmt(comp)} color={C.proj} />
        <Stat label="copies of v (k)" value={fmt(k)} color={C.v} />
      </div>
      <Observation>
        The two factors of <Tex>{String.raw`|v|`}</Tex> multiply to <Tex>{String.raw`v^{\top}v`}</Tex> in
        the denominator. The red residual <Tex>{String.raw`u - \text{proj}_v u`}</Tex> always meets{' '}
        <b style={{ color: C.v }}>v</b> at a right angle — the zero-dot-product idea again, and the seed of{' '}
        <b>Chapter 10</b>.
      </Observation>
    </Split>
  )
}

/* 1.5 — a linear equation is a dot product */
function EquationLab() {
  const [n, setN] = useState({ x: 1, y: 1.5 })
  const [c, setC] = useState(2)
  const nlen = mag(n) || 1
  const nhat = normalize(n)
  const p0 = sc(nhat, c / nlen)
  const dir = { x: -nhat.y, y: nhat.x }
  // A handful of solution vectors x: their tips ride the purple line n·x = c,
  // so they span many lengths and angles but all satisfy the equation.
  const sol = '#12b886'
  const sols = [-3, -2, -1, 1, 2, 3]
    .map((t) => ({ x: p0.x + dir.x * t, y: p0.y + dir.y * t }))
    .filter((q) => Math.max(Math.abs(q.x), Math.abs(q.y)) <= 3.7)
  const bSign = n.y < 0 ? '-' : '+'
  return (
    <Split
      visual={
        <>
          <Plane size={440} range={4}>
            <Segment from={{ x: p0.x - dir.x * 8, y: p0.y - dir.y * 8 }} to={{ x: p0.x + dir.x * 8, y: p0.y + dir.y * 8 }} color={C.arc} dashed={false} width={2.5} />
            {sols.map((q, i) => (
              <Vector key={i} to={q} color={sol} width={2} />
            ))}
            <Vector from={p0} to={{ x: p0.x + n.x, y: p0.y + n.y }} color={C.u} width={2} dashed />
            <DraggableVector value={n} onChange={setN} color={C.u} label="n = (a, b)" snap={0.5} />
            <Dot at={p0} color={C.arc} />
          </Plane>
          <p style={{ textAlign: 'center', marginTop: '0.4rem' }}>
            All the <b style={{ color: sol }}>green</b> vectors <Tex>{String.raw`x`}</Tex> solve{' '}
            <Tex>{String.raw`${cu(fmt(n.x))}\,x_1 ${bSign} ${cu(fmt(Math.abs(n.y)))}\,x_2 = \textcolor{${C.arc}}{${fmt(c)}}`}</Tex>
          </p>
        </>
      }
    >
      <p>
        The bridge to <b>systems of equations</b>. With column notation, a single linear equation is a dot
        product set equal to a constant:
      </p>
      <Tex block>{String.raw`a x_1 + b x_2 = c \quad\Longleftrightarrow\quad n^{\top} x = c, \quad n = \begin{bmatrix} a \\ b \end{bmatrix},\; x = \begin{bmatrix} x_1 \\ x_2 \end{bmatrix}`}</Tex>
      <p>
        Its solutions form the <b style={{ color: C.arc }}>purple line</b> — every point with the same
        shadow on <Tex>{String.raw`n`}</Tex> — always <b>perpendicular to the normal{' '}
        <span style={{ color: C.u }}>n</span></b>, at distance <Tex>{String.raw`c/|n|`}</Tex> from the
        origin. Slide <Tex>{String.raw`c`}</Tex>:
      </p>
      <p>
        Read the other way: <Tex>{String.raw`n^{\top}`}</Tex> defines a <b>whole stack of parallel lines</b> —
        one for each value of <Tex>{String.raw`c`}</Tex> — and <Tex>{String.raw`n^{\top}x`}</Tex> simply
        reports <b>which line <Tex>{String.raw`x`}</Tex> lands on</b>. That is what it means to call the row a
        measuring device rather than an arrow (see the Expert box in 1.0).
      </p>
      <Slider label="c =" value={c} onChange={setC} min={-4} max={4} step={0.1} color={C.arc} />
      <Formal title="Why a line, and why perpendicular?">
        If two vectors <Tex>{String.raw`x`}</Tex> and <Tex>{String.raw`y`}</Tex> both solve it,{' '}
        <Tex>{String.raw`n^{\top} x = c`}</Tex> and <Tex>{String.raw`n^{\top} y = c`}</Tex>, then{' '}
        <Tex>{String.raw`n^{\top}(x-y)=0`}</Tex>: the step between any two solutions is orthogonal to{' '}
        <Tex>{String.raw`n`}</Tex>. So all solutions lie on one line perpendicular to <Tex>{String.raw`n`}</Tex>.
      </Formal>
      <Check
        prompt="Two such equations give two lines. Generically, the solution of the 2×2 system is…"
        options={['the whole plane', 'where the two lines cross — a single point', 'always empty']}
        answer={1}
        explain="Each equation is a line; their intersection is the simultaneous solution. The full story is Chapter 5."
      />
    </Split>
  )
}

export default function DotProduct() {
  return (
    <Module>
      <header className="module-head">
        <h2>1 · The dot product</h2>
        <p className="lead">
          Adding and scaling never let you measure anything — no lengths, no angles. One operation unlocks
          both, and quietly underpins projections, least squares and orthogonality throughout the book: the{' '}
          <b>dot product</b>, written the way Chapter 0 set up — a <b>row times a column</b>.
        </p>
      </header>

      <Unit n="1.0" kicker="Definition" title="A row times a column">
        <p>
          Vectors are <b>columns</b>; a <b>row</b> is a transpose. The dot product of{' '}
          <span style={{ color: C.u }}>u</span> and <span style={{ color: C.v }}>v</span> is the row{' '}
          <Tex>{String.raw`u^{\top}`}</Tex> times the column <Tex>{String.raw`v`}</Tex> — multiply matching
          coordinates and add:
        </p>
        <Tex block>{String.raw`u^{\top} v
          = \begin{bmatrix} ${cu('u_1')} & ${cu('u_2')} \end{bmatrix}
            \begin{bmatrix} ${cv('v_1')} \\ ${cv('v_2')} \end{bmatrix}
          = ${cu('u_1')}${cv('v_1')} + ${cu('u_2')}${cv('v_2')}`}</Tex>
        <Formal title="Definition &amp; properties">
          For columns <Tex>{String.raw`u, v \in \mathbb{R}^2`}</Tex>,{' '}
          <Tex>{String.raw`u^{\top} v = u_1 v_1 + u_2 v_2 \in \mathbb{R}`}</Tex> (a scalar). It is{' '}
          <b>symmetric</b> <Tex>{String.raw`u^{\top}v = v^{\top}u`}</Tex>; <b>linear</b> in each argument;
          and <b>positive on itself</b> <Tex>{String.raw`v^{\top}v = |v|^2 \ge 0`}</Tex>. The older dot
          notation <Tex>{String.raw`u\cdot v`}</Tex> means the same thing. (A 1×2 row times a 2×1 column is a
          1×1 — a scalar — your first matrix product.)
        </Formal>
        <Expert
          title="What the transpose really is: arrows vs. rulers"
          solution={
            <>
              <p>
                A <b>column</b> <Tex>{String.raw`v`}</Tex> is an <b>object</b> in the space — an arrow. It
                points somewhere. It doesn't <em>do</em> anything to other vectors.
              </p>
              <p>
                A <b>row</b> <Tex>{String.raw`u^{\top}`}</Tex> is not "the same numbers, sideways." It's a{' '}
                <b>function</b>: hand it a vector and it returns a number.
              </p>
              <Tex block>{String.raw`u^{\top} : v \;\longmapsto\; u^{\top} v \in \mathbb{R}`}</Tex>
              <p>
                Such a "vector in, number out" machine is called a <b>linear functional</b> (or{' '}
                <b>covector</b>). This is exactly why <b>row&nbsp;×&nbsp;column</b> is defined but
                column&nbsp;×&nbsp;column is not: applying a function to an input is meaningful; asking one
                arrow to "act on" another is not. Matrix multiplication being "rows meet columns" is really{' '}
                <b>each row-functional evaluating the column-vector</b>.
              </p>
              <p>
                The picture is the one you'll build two units from now (<b>1.5</b>): the covector{' '}
                <Tex>{String.raw`u^{\top}`}</Tex> is a <b>stack of parallel lines</b>, and{' '}
                <Tex>{String.raw`u^{\top}v`}</Tex> reports <em>which line</em> <Tex>{String.raw`v`}</Tex> lands
                on. So an arrow <b>points</b>; a covector <b>measures</b>. The transpose is the operation that
                reinterprets the arrow <Tex>{String.raw`u`}</Tex> as the ruler "measure alignment with{' '}
                <Tex>{String.raw`u`}</Tex>" — and the dot product is the bridge that lets it.
              </p>
              <p>
                In ordinary Euclidean space every arrow matches exactly one ruler (the dot product pairs
                them up), so we blur the two and write both as "vectors." But they are genuinely different{' '}
                <b>types</b>. That distinction earns its keep at <b>change of basis</b> — where rows transform{' '}
                <em>inversely</em> to columns — and is unavoidable in calculus, geometry and relativity, where
                you can't identify the two without extra structure.
              </p>
            </>
          }
        >
          You've been told a row is just "a column, transposed." But what <b>kind of object</b> is a row,
          really — and why is <Tex>{String.raw`u^{\top}v`}</Tex> allowed when <Tex>{String.raw`u v`}</Tex>{' '}
          (column times column) is not?
        </Expert>
      </Unit>

      <Unit n="1.1" kicker="Explore" title="One panel: length, angle, sign, orthogonality">
        <Explorer />
      </Unit>

      <Unit n="1.2" kicker="Why they agree" title="Where does the cosine come from?">
        <p>
          The two formulas in the panel look incompatible: <Tex>{String.raw`u_1 v_1 + u_2 v_2`}</Tex> has{' '}
          <b>no trig</b>, yet equals <Tex>{String.raw`|u||v|\cos\theta`}</Tex>. The cosine is hiding{' '}
          <b>inside the coordinates</b>. A vector of length <Tex>{String.raw`r`}</Tex> at angle{' '}
          <Tex>{String.raw`\varphi`}</Tex> is <Tex>{String.raw`(r\cos\varphi,\, r\sin\varphi)`}</Tex>, so
          write u and v by their lengths and angles <Tex>{String.raw`\alpha, \beta`}</Tex>:
        </p>
        <Tex block>{String.raw`u = |u|\begin{bmatrix}\cos\alpha\\ \sin\alpha\end{bmatrix},\qquad v = |v|\begin{bmatrix}\cos\beta\\ \sin\beta\end{bmatrix}`}</Tex>
        <p>Multiply out the coordinate sum and factor the lengths:</p>
        <Tex block>{String.raw`u_1 v_1 + u_2 v_2 = (|u|\cos\alpha)(|v|\cos\beta) + (|u|\sin\alpha)(|v|\sin\beta) = |u|\,|v|\,\big(\cos\alpha\cos\beta + \sin\alpha\sin\beta\big)`}</Tex>
        <p>
          The bracket is the <b>angle-subtraction identity</b>, and <Tex>{String.raw`\alpha-\beta=\theta`}</Tex>{' '}
          is the angle between them:
        </p>
        <Tex block>{String.raw`\cos\alpha\cos\beta + \sin\alpha\sin\beta = \cos(\alpha-\beta) = \cos\theta \;\;\Longrightarrow\;\; u_1 v_1 + u_2 v_2 = |u|\,|v|\cos\theta`}</Tex>
        <Observation>
          Each coordinate is already a length times a cos or sin of that vector's own angle; the
          angle-subtraction identity melts the sum into a single <Tex>{String.raw`\cos\theta`}</Tex>. The two
          formulas are one fact in two outfits. (Geometrically, the same statement is "<Tex>{String.raw`u^{\top}v = |u|\times`}</Tex> the shadow of v on u" — the picture you'll use in projection, next but one.)
        </Observation>
      </Unit>

      <Unit n="1.3" kicker="Consequence" title="Length is hidden inside it">
        <LengthLab />
      </Unit>

      <Unit n="1.4" kicker="Application" title="Measuring overlap: projection">
        <ProjLab />
      </Unit>

      <Unit n="1.5" kicker="The bridge" title="A linear equation is a dot product">
        <EquationLab />
      </Unit>

      <Unit n="1.6" kicker="Recap" title="What you can now do, and what's next">
        <Observation>
          <b>In one sentence:</b> the dot product measures how much two vectors point in the same direction,
          giving the product of their lengths scaled by their alignment (the cosine of the angle between
          them).
        </Observation>
        <ul>
          <li><b>Length:</b> <Tex>{String.raw`|v| = \sqrt{v^{\top} v}`}</Tex>.</li>
          <li><b>Angle:</b> <Tex>{String.raw`\cos\theta = \dfrac{u^{\top} v}{|u||v|}`}</Tex>; its <b>sign</b> gives acute / right / obtuse.</li>
          <li><b>Orthogonality:</b> <Tex>{String.raw`u^{\top} v = 0 \iff u\perp v`}</Tex>.</li>
          <li><b>Projection &amp; equations:</b> overlap is <Tex>{String.raw`\tfrac{u^{\top} v}{|v|}`}</Tex>, and <Tex>{String.raw`n^{\top} x = c`}</Tex> is a line ⟂ to <Tex>{String.raw`n`}</Tex>.</li>
        </ul>
        <p>Next: <b>span &amp; independence</b> — which points a set of vectors can reach, and when one is redundant.</p>
        <Expert
          title="Cauchy–Schwarz from the dot product"
          solution={
            <>
              <p>Use the geometric form and take absolute values:</p>
              <Tex block>{String.raw`|u^{\top}v| = \big|\,|u|\,|v|\cos\theta\,\big| = |u|\,|v|\,|\cos\theta|.`}</Tex>
              <p>
                Since <Tex>{String.raw`|\cos\theta|\le 1`}</Tex>, this gives{' '}
                <Tex>{String.raw`|u^{\top}v|\le |u||v|`}</Tex>. Equality holds exactly when{' '}
                <Tex>{String.raw`|\cos\theta| = 1`}</Tex>, i.e. <Tex>{String.raw`\theta = 0`}</Tex> or{' '}
                <Tex>{String.raw`\pi`}</Tex> — when u and v are <b>parallel</b> (one a scalar multiple of the
                other). If either vector is <Tex>{String.raw`0`}</Tex>, both sides are 0.
              </p>
            </>
          }
        >
          Prove the <b>Cauchy–Schwarz inequality</b> <Tex>{String.raw`|u^{\top}v| \le |u|\,|v|`}</Tex> for all
          vectors u, v, and determine exactly when equality holds.
        </Expert>
      </Unit>

      <Quiz
        title="Dot product — chapter check"
        questions={[
          {
            q: 'Why does uᵀv produce a single number rather than a vector?',
            options: ['Because vectors are short', 'A 1×2 row times a 2×1 column is a 1×1 matrix — a scalar', 'Because of the angle', 'It does not; it gives a vector'],
            answer: 1,
            explain: 'Shapes: (1×2)(2×1) = (1×1). The row-times-column view makes the dot product your first matrix multiplication.',
          },
          {
            q: 'If uᵀv = 0 for nonzero vectors, then u and v are…',
            options: ['parallel', 'perpendicular', 'equal', 'both unit vectors'],
            answer: 1,
            explain: 'Zero dot product ⇒ cos θ = 0 ⇒ θ = 90°. This orthogonality test is used everywhere downstream.',
          },
          {
            q: 'For v = (3, 4), what is |v|?',
            options: ['7', '5', '12', '25'],
            answer: 1,
            explain: '|v| = √(vᵀv) = √(3² + 4²) = √25 = 5.',
          },
          {
            q: 'The solution set of the single equation 2x₁ + x₂ = 3 is…',
            options: ['a single point', 'a line perpendicular to (2, 1)', 'the whole plane', 'empty'],
            answer: 1,
            explain: 'It is nᵀx = 3 with n = (2,1) and x = (x₁, x₂): every point with the same shadow on the normal, forming a line perpendicular to it.',
          },
        ]}
      />
    </Module>
  )
}
