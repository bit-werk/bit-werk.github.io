import { useState } from 'react'
import Plane, { Vector, DraggableVector, Segment, Dot } from '../components/Plane.jsx'
import Slider from '../components/Slider.jsx'
import Check from '../components/Check.jsx'
import Quiz from '../components/Quiz.jsx'
import { Tex } from '../components/Tex.jsx'
import { Module, Unit, Observation, Split, Stat, Formal, Expert } from '../components/ui.jsx'
import { inverse, apply, fmt, normalize } from '../lib/math.js'
import { knum, kcol } from '../lib/texfmt.js'

const sc = (v, k) => ({ x: v.x * k, y: v.y * k })
const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y })
const cross = (a, b) => a.x * b.y - a.y * b.x
const S = 340
const C = { u: '#1769ff', w: '#e8590c', t: '#12b886', acc: '#7c5cff' }

/* 2.1 — span of one vector */
function SpanOneLab() {
  const [v, setV] = useState({ x: 2, y: 1 })
  const [t, setT] = useState(1.5)
  const nv = normalize(v)
  const tv = sc(v, t)
  return (
    <Split
      visual={
        <Plane size={S} range={4}>
          <Segment from={sc(nv, -9)} to={sc(nv, 9)} color="#e9ecf3" dashed={false} width={1.5} />
          <DraggableVector value={v} onChange={setV} color={C.u} label="v" snap={0.5} />
          <Vector to={tv} color={C.acc} width={3} label="t·v" />
          <Dot at={tv} color={C.acc} />
        </Plane>
      }
    >
      <p>
        Start with one vector and only the power to <b>scale</b> it. Where can you get to? Every multiple{' '}
        <Tex>{String.raw`t\,v`}</Tex> lands on a single <b>line through the origin</b>. That reachable set
        is called the <b>span</b> of v.
      </p>
      <Slider label="t =" value={t} onChange={setT} min={-3} max={3} step={0.1} color={C.acc} />
      <Formal title="Span of one vector">
        <Tex block>{String.raw`\operatorname{span}\{v\} = \{\, t\,v : t \in \mathbb{R} \,\}`}</Tex>
        For <Tex>{String.raw`v \neq 0`}</Tex> this is a line through the origin; for{' '}
        <Tex>{String.raw`v = 0`}</Tex> it is just the origin <Tex>{String.raw`\{0\}`}</Tex>.
      </Formal>
      <Observation>
        One nonzero vector spans a <b>1-dimensional</b> space — a line. Scaling alone can never carry you
        off that line.
      </Observation>
    </Split>
  )
}

/* 2.2 — span of two vectors */
function SpanTwoLab() {
  const [u, setU] = useState({ x: 2, y: 0.6 })
  const [w, setW] = useState({ x: 0.5, y: 2 })
  const [target, setTarget] = useState({ x: 2.4, y: 2.2 })
  const M = { a: u.x, b: u.y, c: w.x, d: w.y }
  const inv = inverse(M)
  const coords = inv ? apply(inv, target) : null
  const a = coords ? coords.x : 0
  const b = coords ? coords.y : 0
  const au = sc(u, a)
  return (
    <Split
      visual={
        <Plane size={S} range={5}>
          {coords && (
            <>
              <Segment from={{ x: 0, y: 0 }} to={au} color={C.u} dashed width={2} />
              <Segment from={au} to={target} color={C.w} dashed width={2} />
            </>
          )}
          <DraggableVector value={u} onChange={setU} color={C.u} label="u" snap={0.5} />
          <DraggableVector value={w} onChange={setW} color={C.w} label="w" snap={0.5} />
          <DraggableVector value={target} onChange={setTarget} color={C.t} label="target" snap={0.5} />
          <Dot at={target} color={C.t} />
        </Plane>
      }
    >
      <p>
        Add a second vector and a second dial. Now you can <b>scale each and add</b>:{' '}
        <Tex>{String.raw`a\,u + b\,w`}</Tex>. As long as <b style={{ color: C.u }}>u</b> and{' '}
        <b style={{ color: C.w }}>w</b> point in different directions, you can reach <b>any</b> target —
        drag the green point anywhere and watch the weights adjust.
      </p>
      {coords ? (
        <>
          <Tex block>{String.raw`\text{target} = ${knum(C.u, a)}\,${kcol(C.u, u.x, u.y)} + ${knum(C.w, b)}\,${kcol(C.w, w.x, w.y)} = ${kcol(C.t, target.x, target.y)}`}</Tex>
          <div className="stat-row">
            <Stat label="a (amount of u)" value={fmt(a)} color={C.u} />
            <Stat label="b (amount of w)" value={fmt(b)} color={C.w} />
          </div>
        </>
      ) : (
        <p style={{ color: '#e03131', fontWeight: 600 }}>
          u and w are parallel — they span only a line, so most targets can't be reached.
        </p>
      )}
      <Formal title="Span of two vectors">
        <Tex block>{String.raw`\operatorname{span}\{u, w\} = \{\, a\,u + b\,w : a, b \in \mathbb{R} \,\}`}</Tex>
        If u and w are not parallel, this is the <b>whole plane</b> <Tex>{String.raw`\mathbb{R}^2`}</Tex>.
        If they are parallel, it collapses to a line.
      </Formal>
    </Split>
  )
}

/* 2.3 — dependence as redundancy / collapse */
function RedundantLab() {
  const [u, setU] = useState({ x: 1.6, y: 0.4 })
  const [w, setW] = useState({ x: 0.5, y: 1.6 })
  const cr = cross(u, w)
  const dependent = Math.abs(cr) < 0.12
  const dots = []
  for (let a = -3; a <= 3; a++)
    for (let b = -3; b <= 3; b++) dots.push({ p: add(sc(u, a), sc(w, b)), key: `${a},${b}` })
  return (
    <Split
      visual={
        <Plane size={S} range={5}>
          {dots.map((d) => (
            <Dot key={d.key} at={d.p} color={dependent ? '#e03131' : '#b4c6ef'} r={2.6} />
          ))}
          <DraggableVector value={u} onChange={setU} color={C.u} label="u" snap={0.5} />
          <DraggableVector value={w} onChange={setW} color={C.w} label="w" snap={0.5} />
        </Plane>
      }
    >
      <p>
        The dots mark everything you can build with whole-number weights, <Tex>{String.raw`a\,u + b\,w`}</Tex>.
        Drag <b style={{ color: C.w }}>w</b> until it lines up with <b style={{ color: C.u }}>u</b> and
        watch the cloud of reachable points <b>collapse onto a line</b>.
      </p>
      <Stat
        label="independent?"
        value={dependent ? 'no — collapsed to a line' : 'yes — fills the plane'}
        color={dependent ? '#e03131' : C.t}
      />
      <p>
        {dependent ? (
          <>
            <b style={{ color: C.w }}>w</b> is now a multiple of <b style={{ color: C.u }}>u</b>, so it
            adds <b>nothing new</b>: the span stays a line. The two vectors are <b>linearly dependent</b>.
          </>
        ) : (
          <>
            The dots fill the plane: each vector contributes a genuinely new direction. The two are{' '}
            <b>linearly independent</b>.
          </>
        )}
      </p>
      <Observation>
        Dependence = <b>redundancy</b>. If one vector is a combination of the others, throwing it away
        doesn't shrink the span. Geometrically, the reachable set drops a dimension.
      </Observation>
    </Split>
  )
}

/* 2.5 — basis & unique coordinates */
function BasisLab() {
  const u = { x: 2, y: 0.5 }
  const w = { x: -0.6, y: 1.8 }
  const [target, setTarget] = useState({ x: 2.2, y: 1.6 })
  const M = { a: u.x, b: u.y, c: w.x, d: w.y }
  const coords = apply(inverse(M), target)
  const a = coords.x
  const b = coords.y
  const au = sc(u, a)
  const lines = []
  for (let k = -5; k <= 5; k++) {
    lines.push({ from: add(sc(w, k), sc(u, -7)), to: add(sc(w, k), sc(u, 7)), key: `u${k}` })
    lines.push({ from: add(sc(u, k), sc(w, -7)), to: add(sc(u, k), sc(w, 7)), key: `w${k}` })
  }
  return (
    <Split
      visual={
        <Plane size={S} range={5} showAxes={false}>
          {lines.map((l) => (
            <Segment key={l.key} from={l.from} to={l.to} color="#edf0f5" dashed={false} width={1} />
          ))}
          <Segment from={{ x: 0, y: 0 }} to={au} color={C.u} dashed width={2} />
          <Segment from={au} to={target} color={C.w} dashed width={2} />
          <Vector to={u} color={C.u} label="u" width={3} />
          <Vector to={w} color={C.w} label="w" width={3} />
          <DraggableVector value={target} onChange={setTarget} color={C.t} label="target" snap={0.25} />
          <Dot at={target} color={C.t} />
        </Plane>
      }
    >
      <p>
        Two independent vectors do more than fill the plane — they lay down their <b>own coordinate
        grid</b>. Every point then has <b>exactly one</b> address <Tex>{String.raw`(a, b)`}</Tex> in that
        grid. Such a spanning, independent pair is a <b>basis</b>.
      </p>
      <Tex block>{String.raw`\text{target} = ${knum(C.u, a)}\,${kcol(C.u, u.x, u.y)} + ${knum(C.w, b)}\,${kcol(C.w, w.x, w.y)} = ${kcol(C.t, target.x, target.y)}`}</Tex>
      <div className="stat-row">
        <Stat label="coordinate a" value={fmt(a)} color={C.u} />
        <Stat label="coordinate b" value={fmt(b)} color={C.w} />
      </div>
      <Formal title="Basis">
        A <b>basis</b> of a space is a set of vectors that is both <b>independent</b> (no redundancy) and{' '}
        <b>spanning</b> (reaches everything). In a basis, every vector has a <b>unique</b> set of
        coordinates.
      </Formal>
      <Observation>
        The familiar <Tex>{String.raw`\hat\imath, \hat\jmath`}</Tex> are just <i>one</i> basis (a square
        grid). Any independent pair works — drag the target and read its coordinates off this skewed grid.
        Switching between bases is the whole story of <b>Chapter 13</b>.
      </Observation>
    </Split>
  )
}

export default function Span() {
  return (
    <Module>
      <header className="module-head">
        <h2>2 · Span &amp; linear independence</h2>
        <p className="lead">
          Chapter 0 gave us linear combinations <Tex>{String.raw`a\,u + b\,w`}</Tex>. Two questions follow
          immediately: <b>which points can they reach</b> (the span), and <b>is any vector redundant</b>
          (independence)? These two ideas quietly decide invertibility, rank, and much of what's ahead.
        </p>
      </header>

      <Unit n="2.0" kicker="Motivation" title="Reach and redundancy">
        <p>
          With scaling and adding, a handful of vectors generates a whole set of reachable points. We want
          to know two things about any such set: <b>how far it reaches</b> (a line? the whole plane?), and
          whether we're carrying <b>dead weight</b> — a vector that doesn't extend the reach at all. Those
          are <i>span</i> and <i>independence</i>, and they are two sides of one coin.
        </p>
      </Unit>

      <Unit n="2.1" kicker="One vector" title="The span of a single vector">
        <SpanOneLab />
      </Unit>

      <Unit n="2.2" kicker="Two vectors" title="Reaching the whole plane">
        <SpanTwoLab />
      </Unit>

      <Unit n="2.3" kicker="Redundancy" title="When a vector adds nothing new">
        <RedundantLab />
      </Unit>

      <Unit n="2.4" kicker="Definition" title="Linear independence, made precise">
        <p>
          The pictures suggest a crisp algebraic test. Vectors are <b>linearly independent</b> when the{' '}
          <i>only</i> way to combine them into the zero vector is the trivial way — all weights zero:
        </p>
        <Tex block>{String.raw`a\,u + b\,w = 0 \quad\Longrightarrow\quad a = 0 \ \text{and}\ b = 0.`}</Tex>
        <p>
          If instead some <b>non-trivial</b> combination (weights not all zero) gives <Tex>{String.raw`0`}</Tex>,
          the vectors are <b>linearly dependent</b> — and you can solve that relation to write one vector as
          a combination of the others.
        </p>
        <Formal title="In general (any number of vectors)">
          <Tex block>{String.raw`v_1, \dots, v_k \ \text{are independent} \iff \big( c_1 v_1 + \cdots + c_k v_k = 0 \Rightarrow c_1 = \cdots = c_k = 0 \big).`}</Tex>
          Equivalently: <b>none</b> of them is a linear combination of the others. Dependence means at
          least one is redundant.
        </Formal>
        <Check
          prompt="Are u = (2, 1) and w = (−4, −2) independent?"
          options={['Yes', 'No — w = −2·u, so they are dependent', 'Only if we scale them']}
          answer={1}
          explain="w is exactly −2 times u, so 2·u + 1·w = 0 with non-zero weights. They point along the same line: dependent."
        />
      </Unit>

      <Unit n="2.5" kicker="Basis" title="A basis and unique coordinates">
        <BasisLab />
      </Unit>

      <Unit n="2.6" kicker="Counting" title="Dimension">
        <p>
          The number of vectors in a basis is the <b>dimension</b> of the space — and every basis of the
          same space has the same size. A line is 1-dimensional, the plane{' '}
          <Tex>{String.raw`\mathbb{R}^2`}</Tex> is 2-dimensional, space{' '}
          <Tex>{String.raw`\mathbb{R}^3`}</Tex> is 3-dimensional.
        </p>
        <p>
          A consequence with real bite: in the plane, <b>any three vectors must be dependent</b> — there
          simply isn't room for three independent directions. Two is already enough to reach everything, so
          a third is always a combination of the others.
        </p>
        <Check
          prompt="Can three vectors in the plane ℝ² ever be linearly independent?"
          options={['Yes, if they are long enough', 'No — at most 2 can be independent in ℝ²', 'Only if one is zero']}
          answer={1}
          explain="Dimension 2 caps the number of independent vectors at 2. A third always lies in the span of the other two."
        />
      </Unit>

      <Unit n="2.7" kicker="The big picture" title="What this is secretly about">
        <p>
          Independence of the two columns of a 2×2 matrix is the hinge for almost everything coming up.
          When the columns are <b>independent</b>, the matrix reaches the whole plane and can be undone;
          when they are <b>dependent</b>, it collapses a dimension and cannot. These statements are all the
          same statement:
        </p>
        <Formal title="One condition, many faces (previewing later chapters)">
          For a 2×2 matrix with columns u, w, the following are equivalent:
          <ul className="tight">
            <li>u and w are <b>linearly independent</b>;</li>
            <li>they <b>span</b> all of <Tex>{String.raw`\mathbb{R}^2`}</Tex>;</li>
            <li>the <b>determinant</b> is non-zero (Ch 6);</li>
            <li>the matrix is <b>invertible</b> (Ch 8);</li>
            <li>it has <b>full rank</b> = 2 (Ch 8);</li>
            <li><Tex>{String.raw`Mx = 0`}</Tex> has <b>only</b> the solution <Tex>{String.raw`x = 0`}</Tex>.</li>
          </ul>
        </Formal>
        <Observation>
          Keep this list in mind — a persistent panel later in the book will light it up live. "Dependent
          columns" and "determinant zero" are not two facts to memorize; they are one idea wearing
          different clothes.
        </Observation>
      </Unit>

      <Unit n="2.8" kicker="Recap" title="What you can now do, and what's next">
        <Observation>
          <b>In one sentence:</b> the span is everything a set of vectors can reach by scaling and adding,
          and independence means no vector is redundant — so a basis is the smallest set that still reaches
          everything.
        </Observation>
        <ul>
          <li><b>Span:</b> all linear combinations; one vector → a line, two independent → the plane.</li>
          <li><b>Independent</b> ⇔ the only combination giving <Tex>{String.raw`0`}</Tex> is trivial.</li>
          <li><b>Basis</b> = independent + spanning ⇒ unique coordinates; its size is the <b>dimension</b>.</li>
        </ul>
        <p>
          Next we package "where the basis vectors go" into a matrix and watch it move the whole plane —
          <b> Chapter 3: linear maps &amp; matrices</b>.
        </p>
        <Expert
          title="Three vectors in the plane are always dependent"
          solution={
            <>
              <p>
                Look for a non-trivial combination equal to zero,{' '}
                <Tex>{String.raw`c_1 u + c_2 v + c_3 w = 0`}</Tex>. Componentwise that is <b>2 equations</b>{' '}
                (the x- and y-parts) in <b>3 unknowns</b> <Tex>{String.raw`c_1, c_2, c_3`}</Tex>.
              </p>
              <p>
                A homogeneous system with more unknowns than equations always has a non-trivial solution:
                solve the two equations for two of the <Tex>{String.raw`c_i`}</Tex> in terms of the third,
                which is then free to take any non-zero value. That non-trivial relation is exactly linear
                dependence.
              </p>
              <p>
                (Equivalently: two of the vectors already span <Tex>{String.raw`\mathbb{R}^2`}</Tex>, so the
                third is a combination of them.)
              </p>
            </>
          }
        >
          Prove that <b>any three vectors</b> <Tex>{String.raw`u, v, w \in \mathbb{R}^2`}</Tex> are linearly
          dependent.
        </Expert>
      </Unit>

      <Quiz
        title="Span &amp; independence — chapter check"
        questions={[
          {
            q: 'The span of a single non-zero vector v in the plane is…',
            options: ['the whole plane', 'a line through the origin', 'a single point', 'two lines'],
            answer: 1,
            explain: 'Every scalar multiple t·v lies on one line through the origin; that line is span{v}.',
          },
          {
            q: 'Two vectors are linearly dependent exactly when…',
            options: [
              'they are perpendicular',
              'one is a scalar multiple of the other (they are parallel)',
              'they have the same length',
              'their dot product is 1',
            ],
            answer: 1,
            explain: 'In 2D, dependence means parallel: one is a multiple of the other, so together they span only a line.',
          },
          {
            q: 'Why does a basis give every vector a unique set of coordinates?',
            options: [
              'Because the vectors are unit length',
              'Because it spans (so coordinates exist) and is independent (so they are unique)',
              'Because the determinant is 1',
              'It does not — coordinates can vary',
            ],
            answer: 1,
            explain: 'Spanning guarantees at least one combination reaches the vector; independence rules out a second one, forcing uniqueness.',
          },
          {
            q: 'A 2×2 matrix has linearly dependent columns. What follows?',
            options: [
              'It is invertible',
              'Its determinant is non-zero',
              'It collapses the plane onto a line (and is not invertible)',
              'It is a rotation',
            ],
            answer: 2,
            explain: 'Dependent columns span only a line, so the image is a line: the map loses a dimension and cannot be undone. det = 0.',
          },
        ]}
      />
    </Module>
  )
}
