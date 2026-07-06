import { useState } from 'react'
import Plane, { Vector, DraggableVector, Segment, Dot } from '../components/Plane.jsx'
import Slider from '../components/Slider.jsx'
import Check from '../components/Check.jsx'
import Quiz from '../components/Quiz.jsx'
import { Module, Unit, Observation, Split, Stat, Formal } from '../components/ui.jsx'
import { Tex } from '../components/Tex.jsx'
import { fmt } from '../lib/math.js'
import { C, par, knum, kc, kcol, krow } from '../lib/texfmt.js'

const sc = (v, k) => ({ x: v.x * k, y: v.y * k })
const add = (u, v) => ({ x: u.x + v.x, y: u.y + v.y })
const S = 340

/* 0.1 — arrow ↔ coordinates */
function ArrowLab() {
  const [v, setV] = useState({ x: 3, y: 2 })
  return (
    <Split
      visual={
        <Plane size={S} range={4}>
          <Segment from={{ x: 0, y: 0 }} to={{ x: v.x, y: 0 }} color="#1769ff" dashed width={2} />
          <Segment from={{ x: v.x, y: 0 }} to={v} color="#e8590c" dashed width={2} />
          <DraggableVector value={v} onChange={setV} color="#12b886" label="v" snap={0.5} />
        </Plane>
      }
    >
      <p>
        A vector has two faces. <b>Geometrically</b> it is an <b>arrow</b> from the origin — a length and
        a direction. <b>Numerically</b> it is a <b>list of coordinates</b> telling you how far to travel
        along each axis. They are the same object.
      </p>
      <Stat label="as a list" value={`(${fmt(v.x)}, ${fmt(v.y)})`} color="#12b886" />
      <Observation>
        Drag the arrow: the tip's coordinates change in lock-step. "Arrow" and "list of numbers" are two
        languages for one idea — we'll switch between them constantly.
      </Observation>
    </Split>
  )
}

/* notation: columns, rows, points & vectors */
function NotationLab() {
  const [v, setV] = useState({ x: 3, y: 1 })
  const anchor = { x: -1.5, y: -2.5 }
  const tip2 = add(anchor, v)
  return (
    <Split
      visual={
        <Plane size={S} range={5}>
          <Vector from={anchor} to={tip2} color="#adb5bd" width={2.5} dashed label="same v, moved" />
          <DraggableVector value={v} onChange={setV} color="#12b886" label="v" snap={1} />
          <Dot at={v} color="#1c7ed6" label="point (x, y)" />
        </Plane>
      }
    >
      <p>
        Before going further, let's pin down notation so nothing surprises us later. We've written a
        vector inline as a tuple <Tex>{String.raw`(x, y)`}</Tex>. The form we'll actually use once
        matrices arrive is a <b>column</b> — and its sideways twin is a <b>row</b>:
      </p>
      <Tex block>{String.raw`v = ${kcol(C.green, v.x, v.y)} \;\equiv\; (${fmt(v.x)},\, ${fmt(v.y)}), \qquad v^{\top} = ${krow(C.green, v.x, v.y)}`}</Tex>
      <p>
        The bracketed column and the inline tuple are the <b>same vector</b> — the tuple is just written
        sideways to save space. Turning a column on its side <i>for real</i> is <b>transposition</b>,{' '}
        <Tex>{String.raw`v^{\top}`}</Tex> (a row), and doing it twice returns the original:{' '}
        <Tex>{String.raw`(v^{\top})^{\top} = v`}</Tex>.
      </p>
      <Formal title="Convention used in this book">
        A vector is a <b>column</b>. We write <Tex>{String.raw`(x,y)`}</Tex> inline only to save vertical
        space — it means the same column. A <b>row</b> denotes a transpose. We need the column form the
        moment matrices appear, since <Tex>{String.raw`Mv`}</Tex> multiplies a{' '}
        <Tex>{String.raw`2\times 2`}</Tex> by a <Tex>{String.raw`2\times 1`}</Tex>. (Sneak peek: a row
        times a column, <Tex>{String.raw`u^{\top}v`}</Tex>, is exactly the dot product of the next
        chapter.)
      </Formal>
      <p>
        Does row-versus-column change the arrow? <b>No</b> — same point, same displacement. It only
        decides what <b>multiplication</b> does later, where shapes must line up.
      </p>
      <Formal title="Point vs vector — the same numbers, different jobs">
        A <b>point</b> is a location; a <b>vector</b> is a displacement — a direction and length with no
        fixed home (the gray arrow is the same v, just moved). Both store the same pair of numbers, and we
        identify a point <Tex>{String.raw`P`}</Tex> with its <b>position vector</b>{' '}
        <Tex>{String.raw`\overrightarrow{OP}`}</Tex> from the origin. The distinction matters for what is
        allowed: adding two displacements is natural, and we <b>anchor vectors at the origin</b> so that
        scaling and adding stay linear.
      </Formal>
      <Observation>
        One object, several outfits: <Tex>{String.raw`(x,y)`}</Tex>, a bracketed column, or its row
        transpose. Fixing the convention now — <b>vectors are columns</b> — means the matrix formulas
        later click into place instead of catching us off guard.
      </Observation>
    </Split>
  )
}

/* 0.3 — addition, tip-to-tail */
function AddLab() {
  const [u, setU] = useState({ x: 2, y: 1 })
  const [w, setW] = useState({ x: 1, y: 2 })
  const s = add(u, w)
  return (
    <Split
      visual={
        <Plane size={S} range={5}>
          <Vector to={u} color="#1769ff" label="u" width={3} />
          <Vector to={w} color="#e8590c" label="w" width={3} />
          {/* w shifted to the tip of u — the "tip-to-tail" step */}
          <Vector from={u} to={s} color="#e8590c" width={2} dashed />
          <Vector from={w} to={s} color="#1769ff" width={2} dashed />
          <Vector to={s} color="#12b886" label="u + w" width={3.5} />
          <DraggableVector value={u} onChange={setU} color="#1769ff" snap={0.5} />
          <DraggableVector value={w} onChange={setW} color="#e8590c" snap={0.5} />
          <Dot at={s} color="#12b886" />
        </Plane>
      }
    >
      <p>
        To add two vectors, walk one then the other: place <b style={{ color: '#e8590c' }}>w</b>'s tail at{' '}
        <b style={{ color: '#1769ff' }}>u</b>'s tip. Where you end up is <b style={{ color: '#12b886' }}>u + w</b>.
        Numerically you just add coordinates.
      </p>
      <div className="formula">
        <Tex block>{String.raw`\begin{aligned} u + w &= ${kcol(C.blue, u.x, u.y)} + ${kcol(C.orange, w.x, w.y)} \\[4pt] &= \begin{pmatrix} ${par(u.x)} + ${par(w.x)} \\[2pt] ${par(u.y)} + ${par(w.y)} \end{pmatrix} = ${kcol(C.green, s.x, s.y)} \end{aligned}`}</Tex>
      </div>
      <Observation>
        The two dashed copies close up a <b>parallelogram</b>: u + w = w + u, so it doesn't matter which
        arrow you walk first. Addition is commutative — and you can see why.
      </Observation>
    </Split>
  )
}

/* 0.3 — scalar multiplication */
function ScaleLab() {
  const u = { x: 2, y: 1 }
  const [k, setK] = useState(1.5)
  const ku = sc(u, k)
  return (
    <Split
      visual={
        <Plane size={S} range={5}>
          <Segment from={sc(u, -3)} to={sc(u, 3)} color="#dee2e6" dashed={false} width={1.5} />
          <Vector to={u} color="#adb5bd" width={2} label="u" />
          <Vector to={ku} color="#7c5cff" width={3.5} label="k·u" />
          <Dot at={ku} color="#7c5cff" />
        </Plane>
      }
    >
      <p>
        <b>Scaling</b> a vector by a number k stretches it (k &gt; 1), shrinks it (0 &lt; k &lt; 1), or
        flips it around (k &lt; 0). The direction line never changes — only how far along it you land.
      </p>
      <Slider label="k =" value={k} onChange={setK} min={-3} max={3} step={0.1} color="#7c5cff" />
      <Stat label="k·u" value={`(${fmt(ku.x)}, ${fmt(ku.y)})`} color="#7c5cff" />
      <Observation>
        Every multiple of u lies on one <b>line through the origin</b> (the gray line). Multiplying by a
        negative number is the only way scaling reverses direction. Hold onto "all multiples of a vector
        = a line" — that's the seed of <b>span</b>.
      </Observation>
    </Split>
  )
}

/* 0.5 — linear combinations */
const BLUE = '#1769ff'
const ORANGE = '#e8590c'
const GREEN = '#12b886'

function ComboLab() {
  const [u, setU] = useState({ x: 1.5, y: 0.5 })
  const [w, setW] = useState({ x: -0.5, y: 1.5 })
  const [a, setA] = useState(1)
  const [b, setB] = useState(1)
  const au = sc(u, a)
  const target = add(au, sc(w, b))

  const formula = String.raw`\begin{aligned}
a\,u + b\,w
  &= ${knum(BLUE, a)}\,${kcol(BLUE, u.x, u.y)} \;+\; ${knum(ORANGE, b)}\,${kcol(ORANGE, w.x, w.y)} \\[4pt]
  &= \begin{pmatrix} ${par(a)}\cdot ${par(u.x)} + ${par(b)}\cdot ${par(w.x)} \\[2pt] ${par(a)}\cdot ${par(u.y)} + ${par(b)}\cdot ${par(w.y)} \end{pmatrix} \\[4pt]
  &= ${kcol(GREEN, target.x, target.y)}
\end{aligned}`

  return (
    <Split
      visual={
        <Plane size={S} range={5}>
          <Vector to={au} color={BLUE} width={3} dashed />
          <Vector from={au} to={target} color={ORANGE} width={3} dashed />
          <Vector to={target} color={GREEN} width={3.5} label="a·u + b·w" />
          <Dot at={target} color={GREEN} />
          <DraggableVector value={u} onChange={setU} color={BLUE} label="u" snap={0.5} />
          <DraggableVector value={w} onChange={setW} color={ORANGE} label="w" snap={0.5} />
        </Plane>
      }
    >
      <p>
        Combine the two moves: scale <b style={{ color: BLUE }}>u</b> by{' '}
        <b style={{ color: BLUE }}>a</b>, scale <b style={{ color: ORANGE }}>w</b> by{' '}
        <b style={{ color: ORANGE }}>b</b>, and add. The result <b style={{ color: GREEN }}>a·u + b·w</b>{' '}
        is a <b>linear combination</b> — the single most important phrase in the whole subject.{' '}
        <b>Drag u or w</b>, or turn the dials, and every number below updates.
      </p>
      <Slider label="a =" value={a} onChange={setA} min={-3} max={3} step={0.1} color={BLUE} />
      <Slider label="b =" value={b} onChange={setB} min={-3} max={3} step={0.1} color={ORANGE} />
      <div className="formula">
        <Tex block>{formula}</Tex>
      </div>
      <Observation>
        By dragging the vectors or turning the two dials you can steer the green tip{' '}
        <b>anywhere in the plane</b>. That reach — every point you can hit with some a and b — is what the
        next chapter calls the <b>span</b> of u and w.
      </Observation>
      <Check
        prompt="With these two (non-parallel) vectors, which points can a·u + b·w reach?"
        options={['Only a line', 'The entire plane', 'Only the first quadrant']}
        answer={1}
        explain="Two non-parallel vectors let you reach every point — adjust a and b to hit any (x, y). If they were parallel, you'd be stuck on a line."
      />
    </Split>
  )
}

/* 0.5 — coordinates as a combination of î, ĵ */
function BasisComboLab() {
  const [v, setV] = useState({ x: 3, y: 2 })
  return (
    <Split
      visual={
        <Plane size={S} range={4}>
          <Vector to={sc({ x: 1, y: 0 }, v.x)} color="#1769ff" width={3} />
          <Vector to={sc({ x: 0, y: 1 }, v.y)} color="#e8590c" width={3} />
          <Segment from={v} to={{ x: v.x, y: 0 }} color="#1769ff" dashed width={1.5} />
          <Segment from={v} to={{ x: 0, y: v.y }} color="#e8590c" dashed width={1.5} />
          <Vector to={{ x: 1, y: 0 }} color="#1769ff" width={2} label="î" />
          <Vector to={{ x: 0, y: 1 }} color="#e8590c" width={2} label="ĵ" />
          <DraggableVector value={v} onChange={setV} color="#12b886" label="v" snap={1} />
        </Plane>
      }
    >
      <p>
        Here's the punchline that powers everything next. The coordinates of v <i>are</i> the amounts in a
        special linear combination — of the unit vectors <b style={{ color: '#1769ff' }}>î = (1,0)</b> and{' '}
        <b style={{ color: '#e8590c' }}>ĵ = (0,1)</b>:
      </p>
      <div className="formula">
        <Tex block>{String.raw`v = ${fmt(v.x)}\,${kc(C.blue, String.raw`\hat{\imath}`)} + ${fmt(v.y)}\,${kc(C.orange, String.raw`\hat{\jmath}`)} = ${fmt(v.x)}${kcol(C.blue, 1, 0)} + ${fmt(v.y)}${kcol(C.orange, 0, 1)} = ${kcol(C.green, v.x, v.y)}`}</Tex>
      </div>
      <Observation>
        "Reading off coordinates" and "writing v as a combination of î and ĵ" are the same act. When a
        matrix later sends î and ĵ somewhere new, v rides along on this exact recipe — that's the bridge
        to Chapter 3.
      </Observation>
    </Split>
  )
}

export default function Vectors() {
  return (
    <Module>
      <header className="module-head">
        <h2>0 · Vectors &amp; linear combinations</h2>
        <p className="lead">
          Everything in this book is built from two moves: <b>scaling</b> a vector and <b>adding</b>{' '}
          vectors. Master those and "linear combination" — and the rest of linear algebra is variations on
          a theme.
        </p>
      </header>

      <Unit n="0.0" kicker="Motivation" title="What is a vector, really?">
        <p>
          A vector models anything with a <b>size and a direction</b>: a displacement, a velocity, a
          force — or, just as usefully, a <b>row of data</b> (three test scores, the RGB of a pixel). The
          power of linear algebra is that the same geometry works whether your vector is an arrow on a
          page or a list of a thousand numbers.
        </p>
        <p>We start in 2D, where we can <i>see</i> everything, then trust the pictures to scale up.</p>
      </Unit>

      <Unit n="0.1" kicker="Two languages" title="An arrow and a list of numbers">
        <ArrowLab />
      </Unit>

      <Unit n="0.2" kicker="Conventions" title="Notation: columns, rows, points & vectors">
        <NotationLab />
      </Unit>

      <Unit n="0.3" kicker="Move 1" title="Adding vectors: walk one, then the other">
        <AddLab />
      </Unit>

      <Unit n="0.4" kicker="Move 2" title="Scaling a vector">
        <ScaleLab />
      </Unit>

      <Unit n="0.5" kicker="The big idea" title="Linear combinations">
        <ComboLab />
      </Unit>

      <Unit n="0.6" kicker="The bridge" title="Coordinates are a combination of î and ĵ">
        <BasisComboLab />
      </Unit>

      <Unit n="0.7" kicker="Looking up" title="Vectors beyond 2D">
        <p>
          Nothing forces a vector to have two coordinates. A 3D vector is a list of three numbers (an
          arrow in space); an n-dimensional vector is a list of n numbers. You can't draw a 50-dimensional
          arrow, but you can still <b>add</b> two of them and <b>scale</b> them — coordinate by
          coordinate — so every idea here keeps working.
        </p>
        <p>
          This is why a spreadsheet row, an image, or a sound clip can all be treated as vectors: linear
          combinations still mean exactly what they mean on this page.
        </p>
        <Check
          prompt="What is (1, 2, 3) + 2·(0, 1, -1) ?"
          options={['(1, 4, 1)', '(2, 4, 6)', '(1, 3, 2)']}
          answer={0}
          explain="Scale then add componentwise: (1,2,3) + (0,2,-2) = (1, 4, 1). The 2D rules carry over unchanged."
        />
      </Unit>

      <Unit n="0.8" kicker="Recap" title="What you can now do, and what's next">
        <p>You can read a vector both ways, and you have the two fundamental operations:</p>
        <ul>
          <li><b>Add</b> vectors tip-to-tail (or coordinatewise).</li>
          <li><b>Scale</b> a vector along its line through the origin.</li>
          <li>Combine both into a <b>linear combination</b> a·u + b·w — the workhorse of everything ahead.</li>
        </ul>
        <p>
          Two questions open the next chapters: <b>how do we measure</b> a vector's length and the angle
          between two (the <b>dot product</b>, next), and <b>which points</b> can a set of vectors reach
          (their <b>span</b>)?
        </p>
      </Unit>

      <Quiz
        title="Vectors — chapter check"
        questions={[
          {
            q: 'Geometrically, what does scaling a vector by −2 do?',
            options: [
              'Rotates it 90°',
              'Doubles its length and reverses its direction',
              'Moves it 2 units right',
              'Leaves it unchanged',
            ],
            answer: 1,
            explain: 'A negative scalar flips direction; the magnitude |−2| = 2 doubles the length. It stays on the same line through the origin.',
          },
          {
            q: 'A "linear combination" of u and w is any vector of the form…',
            options: ['u · w', 'a·u + b·w for numbers a, b', 'the longer of u and w', 'u rotated by w'],
            answer: 1,
            explain: 'Scale each vector by some amount and add: a·u + b·w. Choosing different a, b sweeps out everything you can build from u and w.',
          },
          {
            q: 'Why are the coordinates (3, 2) the "same thing" as 3·î + 2·ĵ?',
            options: [
              'They are not related',
              'Because î = (1,0) and ĵ = (0,1), so 3·î + 2·ĵ = (3, 2)',
              'Only when the vector is short',
              'Because of the dot product',
            ],
            answer: 1,
            explain: 'Coordinates literally are the amounts of î and ĵ you combine. This identity is what lets matrices act on any vector.',
          },
        ]}
      />
    </Module>
  )
}
