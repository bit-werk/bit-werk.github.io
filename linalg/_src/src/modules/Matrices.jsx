import { useState } from 'react'
import Plane, { Vector, DraggableVector, Dot, Segment } from '../components/Plane.jsx'
import MatrixInput from '../components/MatrixInput.jsx'
import Quiz from '../components/Quiz.jsx'
import Check from '../components/Check.jsx'
import { Tex } from '../components/Tex.jsx'
import { Module, Unit, Observation, Split, Formal, Btn, PresetRow, Stat, Expert } from '../components/ui.jsx'
import { useAnimatedT } from '../hooks/useAnimatedT.js'
import {
  apply,
  det,
  lerpMat,
  naturalPath,
  isReflection,
  rotation,
  scaling,
  fmt,
} from '../lib/math.js'

const sc = (v, k) => ({ x: v.x * k, y: v.y * k })
const add = (u, v) => ({ x: u.x + v.x, y: u.y + v.y })
const S = 340 // plane size used throughout the chapter

// Colors shared by arrows and formulas: î = blue, ĵ = orange, result = green.
const COL = { i: '#1769ff', j: '#e8590c', v: '#12b886', acc: '#7c5cff' }
const ci = (s) => String.raw`\textcolor{${COL.i}}{${s}}`
const cj = (s) => String.raw`\textcolor{${COL.j}}{${s}}`
const cg = (s) => String.raw`\textcolor{${COL.v}}{${s}}`
const colvecTex = (x, y) => String.raw`\begin{bmatrix} ${fmt(x)} \\ ${fmt(y)} \end{bmatrix}`

// A small editable 2×1 column vector, to sit beside a matrix as "M v".
function ColVec({ value, onChange, step = 0.5, color, caption }) {
  const set = (k) => (e) => {
    const n = parseFloat(e.target.value)
    onChange?.({ ...value, [k]: Number.isFinite(n) ? n : 0 })
  }
  const box = (
    <div className="colvec">
      <div className="bracket left" />
      <div className="colvec-grid">
        <input className="matrix-cell" type="number" step={step} value={fmt(value.x, 3)} onChange={set('x')} style={color ? { color } : undefined} />
        <input className="matrix-cell" type="number" step={step} value={fmt(value.y, 3)} onChange={set('y')} style={color ? { color } : undefined} />
      </div>
      <div className="bracket right" />
    </div>
  )
  // A caption below matches the matrix's "where î/ĵ lands" labels, so the two
  // stacks line up in height and the numbers sit at the same level.
  if (!caption) return box
  return (
    <div className="colvec-labeled">
      {box}
      <div className="colvec-caption">{caption}</div>
    </div>
  )
}

// A small decorative grid deformed by an arbitrary point map `f` (linear or
// not). Straight lines are sampled into short segments so non-linear warps
// render as curves. Used for the little "visual aid" figures (3.0, 3.2).
function MiniGrid({ f, size = 150, range = 2, label, stroke = '#c4cbe0', square = '#7c5cff' }) {
  const scale = size / (2 * range)
  const cx = size / 2
  const cy = size / 2
  const N = 16
  const P = (p) => {
    const q = f(p)
    return `${(cx + q.x * scale).toFixed(1)},${(cy - q.y * scale).toFixed(1)}`
  }
  const sample = (a, b) => {
    const pts = []
    for (let i = 0; i <= N; i++) {
      const t = i / N
      pts.push(P({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }))
    }
    return pts.join(' ')
  }
  const lines = []
  for (let i = -range; i <= range; i++) {
    const axis = i === 0
    lines.push(
      <polyline key={`v${i}`} points={sample({ x: i, y: -range }, { x: i, y: range })} fill="none" stroke={axis ? '#9aa3b2' : stroke} strokeWidth={axis ? 1.4 : 1} />,
      <polyline key={`h${i}`} points={sample({ x: -range, y: i }, { x: range, y: i })} fill="none" stroke={axis ? '#9aa3b2' : stroke} strokeWidth={axis ? 1.4 : 1} />,
    )
  }
  const corners = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]
  const sq = []
  for (let e = 0; e < 4; e++) {
    const a = corners[e]
    const b = corners[(e + 1) % 4]
    for (let i = 0; i < N; i++) {
      const t = i / N
      sq.push(P({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }))
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 10, border: '1px solid var(--line)', background: '#fbfcfe' }}>
      {lines}
      <polygon points={sq.join(' ')} fill={square} fillOpacity="0.16" stroke={square} strokeWidth="1.6" />
      {label && <text x={9} y={20} fontSize="14" fontWeight="700" fill="#495057">{label}</text>}
    </svg>
  )
}

const idMap = (p) => p
const linMap = (M) => (p) => apply(M, p)

/* ── 3.1 · recall: the recipe ───────────────────────────────────────────── */
function DecomposeLab() {
  const [v, setV] = useState({ x: 3, y: 2 })
  const i = { x: 1, y: 0 }
  const j = { x: 0, y: 1 }
  return (
    <Split
      visual={
        <Plane size={S} range={4}>
          <Vector to={sc(i, v.x)} color={COL.i} width={3} />
          <Vector to={sc(j, v.y)} color={COL.j} width={3} />
          <Segment from={v} to={sc(i, v.x)} color={COL.i} dashed width={1.5} />
          <Segment from={v} to={sc(j, v.y)} color={COL.j} dashed width={1.5} />
          <Vector to={i} color={COL.i} width={2} label="î" />
          <Vector to={j} color={COL.j} width={2} label="ĵ" />
          <DraggableVector value={v} onChange={setV} color={COL.v} label="v" snap={1} />
        </Plane>
      }
    >
      <p>
        One idea from <b>Chapter 0</b> is the launchpad for this whole chapter, so let's re-anchor it. The
        basis vectors <b style={{ color: COL.i }}>î = (1, 0)</b> and <b style={{ color: COL.j }}>ĵ = (0, 1)</b>{' '}
        are the unit steps along the axes, and a vector's coordinates are exactly the <b>amounts</b> of
        each you combine:
      </p>
      <Tex block>{String.raw`v = v_1\,${ci('\\hat\\imath')} + v_2\,${cj('\\hat\\jmath')} \;=\; ${fmt(v.x)}\,${ci('\\hat\\imath')} + ${fmt(v.y)}\,${cj('\\hat\\jmath')}`}</Tex>
      <p>Writing î and ĵ as columns, that recipe is literally the coordinates:</p>
      <Tex block>{String.raw`${fmt(v.x)}\,${ci(colvecTex(1, 0))} + ${fmt(v.y)}\,${cj(colvecTex(0, 1))} = ${cg(colvecTex(v.x, v.y))}`}</Tex>
      <Observation>
        Read every vector as "<b>so much î plus so much ĵ</b>". Once we move î and ĵ, this recipe is what
        carries every other vector along — that single sentence is the engine of the whole chapter.
      </Observation>
      <Check
        prompt="Written in the recipe form, what is the vector (−3, 4)?"
        options={['−3·î + 4·ĵ', '4·î − 3·ĵ', '−3·ĵ + 4·î']}
        answer={0}
        explain="Coordinates are the amounts of î and ĵ: the first number multiplies î, the second multiplies ĵ."
      />
    </Split>
  )
}

/* ── 3.3 · where î and ĵ go decides everything ──────────────────────────── */
function BasisDragLab() {
  const [iL, setIL] = useState({ x: 1.4, y: 0.3 })
  const [jL, setJL] = useState({ x: -0.4, y: 1.3 })
  const [v, setV] = useState({ x: 1.5, y: 1 })
  const A = sc(iL, v.x)
  const B = sc(jL, v.y)
  const Tv = add(A, B)
  const M = { a: iL.x, b: iL.y, c: jL.x, d: jL.y }
  const setFromM = (m) => {
    setIL({ x: m.a, y: m.b })
    setJL({ x: m.c, y: m.d })
  }
  return (
    <Split
      visual={
        <Plane size={S} range={4} showGhost grid={{ a: iL.x, b: iL.y, c: jL.x, d: jL.y }} showGrid={false}>
          <Segment from={{ x: 0, y: 0 }} to={A} color={COL.i} dashed width={1.5} />
          <Segment from={B} to={Tv} color={COL.i} dashed width={1.5} />
          <Segment from={{ x: 0, y: 0 }} to={B} color={COL.j} dashed width={1.5} />
          <Segment from={A} to={Tv} color={COL.j} dashed width={1.5} />
          <DraggableVector value={iL} onChange={setIL} color={COL.i} label="new î" />
          <DraggableVector value={jL} onChange={setJL} color={COL.j} label="new ĵ" />
          <DraggableVector value={v} onChange={setV} color="#9aa3b2" label="v" snap={0.5} />
          <Vector to={Tv} color={COL.v} width={3} label="T(v)" />
          <Dot at={Tv} color={COL.v} />
        </Plane>
      }
    >
      <p>
        Here is the central move. Drag where <b style={{ color: COL.i }}>î</b> and{' '}
        <b style={{ color: COL.j }}>ĵ</b> land (or type into the matrix), and move <b>v</b>. Because{' '}
        <Tex>{String.raw`T`}</Tex> is linear, v keeps the <b>same recipe</b> — only the basis vectors it's
        built from have moved:
      </p>
      <Tex block>{String.raw`T(v) = v_1\,T(${ci('\\hat\\imath')}) + v_2\,T(${cj('\\hat\\jmath')})`}</Tex>
      <p>Stacking the two landing spots as <b>columns</b> gives the matrix M, and applying it is just this recipe:</p>
      <div className="mat-times-vec">
        <MatrixInput value={M} onChange={setFromM} />
        <div className="colvec-labeled">
          <span className="op">·</span>
          <div className="colvec-caption">&nbsp;</div>
        </div>
        <ColVec value={v} onChange={setV} color="#495057" caption="↑ the vector v" />
      </div>
      <Tex block>{String.raw`T(v) = ${fmt(v.x)}\,${ci(colvecTex(iL.x, iL.y))} + ${fmt(v.y)}\,${cj(colvecTex(jL.x, jL.y))} = ${cg(colvecTex(Tv.x, Tv.y))}`}</Tex>
      <Observation>
        A linear map is <b>completely determined by where î and ĵ go</b>. Pin those two landing spots and
        every other vector's destination is forced. That is why a 2×2 matrix — just two columns — can
        describe moving the entire infinite plane.
      </Observation>
      <Check
        prompt="To predict where every vector in the plane lands under a linear map, the minimum you must know is…"
        options={['the whole deformed grid', 'just where î and ĵ land', 'infinitely many points']}
        answer={1}
        explain="Every vector is v₁·î + v₂·ĵ, so linearity sends it to v₁·T(î) + v₂·T(ĵ). Two landing spots fix everything."
      />
    </Split>
  )
}

/* ── 3.4 · columns of a matrix ──────────────────────────────────────────── */
function ColumnsLab() {
  const [iL, setIL] = useState({ x: 1.5, y: 0.5 })
  const [jL, setJL] = useState({ x: -0.5, y: 1.2 })
  const M = { a: iL.x, b: iL.y, c: jL.x, d: jL.y }
  return (
    <Split
      visual={
        <Plane size={S} range={4} grid={M} showGhost>
          <Vector to={iL} color={COL.i} width={3.5} label="î" />
          <Vector to={jL} color={COL.j} width={3.5} label="ĵ" />
          <DraggableVector value={iL} onChange={setIL} color={COL.i} />
          <DraggableVector value={jL} onChange={setJL} color={COL.j} />
        </Plane>
      }
    >
      <p>
        Write the two landing spots side by side and you have a <b>matrix</b>. The landing spot of{' '}
        <b style={{ color: COL.i }}>î</b> is the <b>first column</b>; the landing spot of{' '}
        <b style={{ color: COL.j }}>ĵ</b> is the <b>second column</b>:
      </p>
      <Tex block>{String.raw`M = \begin{bmatrix} ${ci(fmt(iL.x))} & ${cj(fmt(jL.x))} \\ ${ci(fmt(iL.y))} & ${cj(fmt(jL.y))} \end{bmatrix}`}</Tex>
      <Formal title="What 'a matrix represents a linear map' means">
        Fixing the basis <Tex>{String.raw`\hat\imath, \hat\jmath`}</Tex>, the matrix whose columns are{' '}
        <Tex>{String.raw`T(\hat\imath)`}</Tex> and <Tex>{String.raw`T(\hat\jmath)`}</Tex> records the map{' '}
        <Tex>{String.raw`T`}</Tex> completely. A <b>column</b> is a landing spot (read vertically); a{' '}
        <b>row</b> collects one coordinate (x or y) of both landing spots.
      </Formal>
      <Check
        prompt="A matrix has first column (0, 1) and second column (−1, 0). Where does ĵ land?"
        options={['(0, 1)', '(−1, 0)', '(1, 0)']}
        answer={1}
        explain="The second column is the landing spot of ĵ, so ĵ → (−1, 0). (The first column, (0,1), is where î lands.)"
      />
    </Split>
  )
}

/* ── 3.5 · what one entry means ─────────────────────────────────────────── */
const ENTRY_INFO = {
  a: { who: 'î', axis: 'x', color: COL.i },
  b: { who: 'î', axis: 'y', color: COL.i },
  c: { who: 'ĵ', axis: 'x', color: COL.j },
  d: { who: 'ĵ', axis: 'y', color: COL.j },
}
function EntryMeaningLab() {
  const [M, setM] = useState({ a: 1.5, b: 0.5, c: -0.5, d: 1.2 })
  const [key, setKey] = useState('b')
  const info = ENTRY_INFO[key]
  return (
    <Split
      visual={
        <Plane size={S} range={4} grid={M} showGhost>
          <Vector to={{ x: M.a, y: M.b }} color={COL.i} width={3.5} label="î" />
          <Vector to={{ x: M.c, y: M.d }} color={COL.j} width={3.5} label="ĵ" />
        </Plane>
      }
    >
      <p>So what does a single number inside the matrix mean? Pick an entry and edit it:</p>
      <div className="btn-row">
        {['a', 'b', 'c', 'd'].map((k) => (
          <Btn key={k} active={key === k} onClick={() => setKey(k)}>
            {k} = {fmt(M[k])}
          </Btn>
        ))}
      </div>
      <div style={{ margin: '8px 0' }}>
        <MatrixInput
          value={M}
          onChange={setM}
          highlight={key}
          columnLabels={false}
          rowLabels={['→ x-coordinate of each landing spot', '→ y-coordinate of each landing spot']}
        />
      </div>
      <p>
        Entry <b>{key}</b> is the{' '}
        <b style={{ color: info.color }}>{info.axis}-coordinate of where {info.who} lands</b>. Change it
        and only the <span style={{ color: info.color }}>{info.who}</span> arrow's tip slides, along the{' '}
        {info.axis}-axis.
      </p>
      <Observation>
        Nothing here is mysterious: <b>columns</b> say <i>which</i> vector lands where, <b>rows</b> say{' '}
        <i>which axis</i>. Top row = x-coordinates of the landing spots; bottom row = y-coordinates.
      </Observation>
      <Check
        prompt="In the matrix, you increase the bottom-left entry b. What happens?"
        options={['ĵ’s tip moves right', 'î’s tip moves up (its y-coordinate grows)', 'nothing moves']}
        answer={1}
        explain="b is the y-coordinate of î’s landing spot (first column, bottom entry), so raising b lifts the î arrow."
      />
    </Split>
  )
}

/* ── 3.6 · multiply M by a vector ───────────────────────────────────────── */
function MultiplyByHandLab() {
  const [col1, setCol1] = useState({ x: 2, y: 0 })
  const [col2, setCol2] = useState({ x: 1, y: 2 })
  const [v, setV] = useState({ x: 1, y: 1 })
  const M = { a: col1.x, b: col1.y, c: col2.x, d: col2.y }
  const Mv = add(sc(col1, v.x), sc(col2, v.y))
  return (
    <Split
      visual={
        <Plane size={S} range={6} grid={M} showGhost>
          <Vector to={sc(col1, v.x)} color={COL.i} width={3} dashed />
          <Vector from={sc(col1, v.x)} to={Mv} color={COL.j} width={3} dashed />
          <Vector to={Mv} color={COL.v} width={3} label="Mv" />
          <Dot at={Mv} color={COL.v} />
          <DraggableVector value={col1} onChange={setCol1} color={COL.i} label="col 1" snap={0.5} />
          <DraggableVector value={col2} onChange={setCol2} color={COL.j} label="col 2" snap={0.5} />
          <DraggableVector value={v} onChange={setV} color="#9aa3b2" label="v" snap={1} />
        </Plane>
      }
    >
      <p>
        Multiplying M by v is the same recipe — but using M's <b>columns</b> in place of î and ĵ.{' '}
        <b>Drag the two columns</b> (or v) and every number below follows. With{' '}
        <Tex>{`v = ${colvecTex(v.x, v.y)}`}</Tex> and columns{' '}
        <b style={{ color: COL.i }}>({fmt(col1.x)}, {fmt(col1.y)})</b>,{' '}
        <b style={{ color: COL.j }}>({fmt(col2.x)}, {fmt(col2.y)})</b>:
      </p>
      <Tex block>{String.raw`M v = ${fmt(v.x)}\,${ci(colvecTex(col1.x, col1.y))} + ${fmt(v.y)}\,${cj(colvecTex(col2.x, col2.y))} = ${cg(colvecTex(Mv.x, Mv.y))}`}</Tex>
      <Formal title="The general rule">
        <Tex block>{String.raw`M v = \begin{bmatrix} ${ci('a')} & ${cj('c')} \\ ${ci('b')} & ${cj('d')} \end{bmatrix}\begin{bmatrix} v_1 \\ v_2 \end{bmatrix} = v_1\,${ci('\\begin{bmatrix} a \\\\ b \\end{bmatrix}')} + v_2\,${cj('\\begin{bmatrix} c \\\\ d \\end{bmatrix}')} = \begin{bmatrix} ${ci('a')}v_1 + ${cj('c')}v_2 \\ ${ci('b')}v_1 + ${cj('d')}v_2 \end{bmatrix}`}</Tex>
        A matrix times a vector is a <b>weighted sum of the columns</b>, with the weights taken from v.
      </Formal>
      <Check
        prompt="Reading columns as landing spots, what is M(2, 0) — i.e. v₁ = 2, v₂ = 0?"
        options={['col 1 + col 2', '2 · col 1', '(2, 0) unchanged']}
        answer={1}
        explain="M(2,0) = 2·col1 + 0·col2 = 2·col1. With v₂ = 0, only the first column contributes."
      />
    </Split>
  )
}

/* ── 3.7 · apply to all of space ────────────────────────────────────────── */
const APPLY_PRESETS = [
  { label: 'Rotate 90°', value: rotation(90) },
  { label: 'Rotate 180°', value: rotation(180) },
  { label: 'Shear', value: { a: 1, b: 0, c: 1, d: 1 } },
  { label: 'Scale', value: { a: 1.6, b: 0, c: 0, d: 0.6 } },
  { label: 'Reflect', value: { a: 1, b: 0, c: 0, d: -1 } },
]
function ApplyToSpaceLab() {
  const [M, setM] = useState(rotation(180))
  const [preset, setPreset] = useState('Rotate 180°')
  const [natural, setNatural] = useState(true)
  const anim = useAnimatedT(1100)
  const current = natural ? naturalPath(M, anim.t) : lerpMat(M, anim.t)
  const reflect = isReflection(M)
  // Picking a preset selects its chip and plays the transform right away
  // (identity → M), exactly as if the user had pressed Apply.
  const pickPreset = (val, label) => {
    setM(val)
    setPreset(label)
    anim.setRaw(0)
    anim.play()
  }
  return (
    <Split
      visual={
        <Plane size={380} range={5} grid={current} showGhost showUnitSquare>
          <Vector to={apply(current, { x: 1, y: 0 })} color={COL.i} width={3.5} label="î" />
          <Vector to={apply(current, { x: 0, y: 1 })} color={COL.j} width={3.5} label="ĵ" />
        </Plane>
      }
    >
      <p>
        Because the same recipe applies to <i>every</i> point, one matrix moves <b>all of space at
        once</b>. The faint dashed grid is the start; the solid grid is where every point has gone. Scrub
        slowly and watch the in-between matrix.
      </p>
      <div className="btn-row">
        <Btn onClick={anim.toggle} active={anim.playing}>
          {anim.raw > 0.5 ? '↺ Reset' : '▶ Apply'}
        </Btn>
        <Btn active={natural} onClick={() => setNatural((n) => !n)}>
          {natural ? '✓ natural motion' : 'naïve entry-blend'}
        </Btn>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={anim.raw}
        onChange={(e) => anim.setRaw(parseFloat(e.target.value))}
        className="scrub"
      />
      <div style={{ marginTop: 8 }}>
        <div className="stat-label">matrix right now (t = {fmt(anim.raw, 2)})</div>
        <Tex block>{String.raw`\begin{bmatrix} ${ci(fmt(current.a))} & ${cj(fmt(current.c))} \\ ${ci(fmt(current.b))} & ${cj(fmt(current.d))} \end{bmatrix}`}</Tex>
      </div>
      <PresetRow presets={APPLY_PRESETS} onPick={pickPreset} active={preset} />
      <div style={{ marginTop: 10 }}>
        <MatrixInput value={M} onChange={(m) => { setM(m); setPreset(null); anim.reset() }} />
      </div>
      <Observation>
        Turn <b>natural motion</b> off and scrub the <b>Rotate 180°</b> preset: the "naïve" path averages
        the numbers and the whole plane <b>collapses to a single point</b> at t = 0.5 — a "rotation" that
        destroys all of space. The honest path actually turns. <b>How you interpolate is a real
        mathematical choice, not decoration.</b>
      </Observation>
      {reflect && (
        <p className="small muted">
          A <b>reflection</b> can't be reached by any smooth rotate-and-stretch, so even natural motion must
          flip through a flat state. That impossibility is exactly what a <b>negative determinant</b>{' '}
          records — coming in Chapter 6.
        </p>
      )}
      <Check
        prompt="Under a matrix M, where does the single point sitting at î’s tip, (1, 0), end up?"
        options={['at the origin', 'at column 1 of M', 'it never moves']}
        answer={1}
        explain="(1,0) = î, and M sends î to its landing spot, which is column 1. Every point rides the same recipe."
      />
      <Check
        prompt="A matrix sends î → (0, 1) and ĵ → (−1, 0). Which map is it?"
        options={['Scaling', 'Rotation 90° counter-clockwise', 'Reflection']}
        answer={1}
        explain="Reading the columns: (0,1) and (−1,0) are î and ĵ each turned a quarter-turn counter-clockwise."
      />
    </Split>
  )
}

/* ── 3.8 · collapse ─────────────────────────────────────────────────────── */
function CollapseLab() {
  const [c1, setC1] = useState({ x: 1.5, y: 0.5 })
  const [c2, setC2] = useState({ x: 1, y: 1.3 })
  const M = { a: c1.x, b: c1.y, c: c2.x, d: c2.y }
  const D = det(M)
  const collapsed = Math.abs(D) < 0.06
  return (
    <Split
      visual={
        <Plane size={S} range={4} grid={M} showGhost showUnitSquare unitSquareColor={collapsed ? '#e03131' : COL.acc}>
          <DraggableVector value={c1} onChange={setC1} color={COL.i} label="col 1" snap={0.25} />
          <DraggableVector value={c2} onChange={setC2} color={COL.j} label="col 2" snap={0.25} />
        </Plane>
      }
    >
      <p>
        Drag the two columns until they point the <b>same way</b>. The grid flattens — the whole plane is
        crushed onto a single <b>line</b>.
      </p>
      <Stat label="how much area survives" value={fmt(Math.abs(D))} color={collapsed ? '#e03131' : COL.v} />
      {collapsed && <p style={{ color: '#e03131', fontWeight: 600 }}>Collapsed onto a line!</p>}
      <Observation>
        Parallel columns are <b>linearly dependent</b> (Chapter 2): they span only a line, so the map's
        whole output is that line — it has <b>lost a dimension</b>. Many input points now land on the same
        output, so the map <b>cannot be undone</b>. The shrinking area you watched hit zero is the{' '}
        <b>determinant</b>, the subject of Chapter 6.
      </Observation>
      <Check
        prompt="When a matrix’s two columns become parallel, the image of the whole plane is…"
        options={['still the whole plane', 'a single line through the origin', 'empty']}
        answer={1}
        explain="Dependent (parallel) columns span only a line, so every output lies on that line. The map is not invertible; det = 0."
      />
    </Split>
  )
}

/* ── 3.10 · orthogonal ──────────────────────────────────────────────────── */
function OrthogonalLab() {
  const [angle, setAngle] = useState(30)
  const [stretch, setStretch] = useState(false)
  const r = (angle * Math.PI) / 180
  const M = stretch
    ? { a: Math.cos(r) * 1.7, b: Math.sin(r) * 1.7, c: -Math.sin(r) * 0.6, d: Math.cos(r) * 0.6 }
    : rotation(angle)
  return (
    <Split
      visual={
        <Plane size={S} range={4} grid={M} showGhost showUnitSquare unitSquareColor={stretch ? COL.j : COL.v}>
          <Vector to={apply(M, { x: 1, y: 0 })} color={COL.i} width={3.5} label="î" />
          <Vector to={apply(M, { x: 0, y: 1 })} color={COL.j} width={3.5} label="ĵ" />
        </Plane>
      }
    >
      <p>
        Some maps are <b>rigid</b>: they move space like a solid sheet, never stretching it. Rotations (and
        reflections) are the examples — the grid squares stay <b>unit squares</b>.
      </p>
      <label className="slider">
        <span className="slider-label">angle<b>{fmt(angle, 0)}°</b></span>
        <input type="range" min="-180" max="180" step="1" value={angle} onChange={(e) => setAngle(parseFloat(e.target.value))} />
      </label>
      <Btn active={stretch} onClick={() => setStretch((s) => !s)}>
        {stretch ? '✓ added a stretch (no longer rigid)' : 'add a stretch'}
      </Btn>
      <Formal title="Orthogonal matrix">
        A matrix is <b>orthogonal</b> when its columns are <b>perpendicular unit vectors</b> — equivalently{' '}
        <Tex>{String.raw`Q^{\top} Q = I`}</Tex>. Such maps preserve every length and angle (and the dot
        product, Chapter 1). They return in QR and least squares.
      </Formal>
      <Check
        prompt="Which property makes a 2×2 matrix orthogonal (a rigid motion)?"
        options={['Its determinant is 0', 'Its columns are perpendicular unit vectors', 'It is diagonal']}
        answer={1}
        explain="Orthonormal columns (perpendicular, length 1) keep lengths and angles intact — a rotation or reflection."
      />
    </Split>
  )
}

/* ── the chapter ───────────────────────────────────────────────────────── */
export default function Matrices() {
  return (
    <Module>
      <header className="module-head">
        <h2>3 · Linear maps &amp; matrices</h2>
        <p className="lead">
          A <b>linear map</b> is a rule that moves every point of the plane while keeping grid lines
          straight and the origin fixed. The remarkable fact of this chapter: each such map is captured by
          just <b>two columns of numbers</b> — a matrix — which you can read straight off as "where î and ĵ
          land".
        </p>
      </header>

      <Unit n="3.0" kicker="Motivation" title="Why package a transformation as numbers?">
        <p>
          Spinning a game character, warping a photo, fitting a line to data, solving many equations at
          once — underneath, each is one <b>linear map</b>: a rule taking every point to a new point,
          straight lines staying straight. We want to <i>compute</i> with such rules, so we need to write
          them down. A matrix is that written form.
        </p>
        <p>
          The plan: recall that every vector is a recipe of î and ĵ (Chapter 0), pin down what "linear"
          means, then discover that fixing where î and ĵ go fixes the entire map.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, flexWrap: 'wrap', margin: '6px 0 2px' }}>
          <MiniGrid f={idMap} label="before" />
          <span style={{ fontSize: 30, color: 'var(--muted)' }}>→</span>
          <MiniGrid f={linMap({ a: 1.15, b: 0.32, c: 0.55, d: 0.82 })} label="after" />
        </div>
        <p className="muted small center">
          A linear map takes the grid on the left to the one on the right — lines stay straight and evenly
          spaced, the origin stays put. All of that is captured by two columns of numbers.
        </p>
      </Unit>

      <Unit n="3.1" kicker="Recall (Ch 0)" title="Every vector is a recipe of î and ĵ">
        <DecomposeLab />
      </Unit>

      <Unit n="3.2" kicker="Definition" title="What makes a map linear?">
        <p>
          A transformation <Tex>{String.raw`T`}</Tex> is <b>linear</b> if it respects the two operations
          from Chapter 0 — scaling and adding. Visually, that means <b>(1)</b> grid lines stay straight and
          evenly spaced and <b>(2)</b> the origin doesn't move. Anything that bends lines or shifts the
          origin is <i>not</i> linear.
        </p>
        <Formal title="Definition">
          <Tex>{String.raw`T`}</Tex> is <b>linear</b> when it preserves linear combinations:
          <Tex block>{String.raw`T(a\,u + b\,w) = a\,T(u) + b\,T(w) \quad\text{for all vectors } u,w \text{ and scalars } a,b.`}</Tex>
          Setting <Tex>{String.raw`a=b=0`}</Tex> forces <Tex>{String.raw`T(0)=0`}</Tex> (the origin is
          fixed). Applying it to <Tex>{String.raw`v = v_1\hat\imath + v_2\hat\jmath`}</Tex> gives the recipe
          that drives everything:
          <Tex block>{String.raw`T(v) = v_1\,T(\hat\imath) + v_2\,T(\hat\jmath).`}</Tex>
        </Formal>
        <Check
          prompt="Which of these is NOT a linear map of the plane?"
          options={['Rotate by 45°', 'Shift every point 2 units right', 'Scale x by 3']}
          answer={1}
          explain="A shift (translation) moves the origin: T(0) ≠ 0, breaking linearity. Rotations and scalings keep the origin fixed and lines straight."
        />
        <p style={{ marginTop: 16 }}>
          Now judge by picture. Three of these four grids are produced by a linear map; one is not.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', margin: '4px 0' }}>
          <MiniGrid f={linMap(rotation(30))} label="A" />
          <MiniGrid f={linMap({ a: 1, b: 0, c: 0.6, d: 1 })} label="B" />
          <MiniGrid f={(p) => ({ x: p.x, y: p.y + 0.35 * Math.sin(p.x * 1.4) })} label="C" />
          <MiniGrid f={linMap(scaling(1.4, 0.7))} label="D" />
        </div>
        <Check
          prompt="Which grid is NOT a linear map?"
          options={['A — a rotation', 'B — a shear', 'C — the wavy one', 'D — a scaling']}
          answer={2}
          explain="Only C bends straight grid lines into curves, so it cannot be linear (a linear map sends straight lines to straight lines, evenly spaced, origin fixed). A rotation, B shear and D scaling all keep the lines straight."
        />
      </Unit>

      <Unit n="3.3" kicker="The key idea" title="Where î and ĵ go decides everything">
        <BasisDragLab />
      </Unit>

      <Unit n="3.4" kicker="Definition" title="Two landing spots = the columns of a matrix">
        <ColumnsLab />
      </Unit>

      <Unit n="3.5" kicker="Reading numbers" title="What does one entry mean?">
        <EntryMeaningLab />
      </Unit>

      <Unit n="3.6" kicker="Computation" title="Multiplying a matrix by a vector">
        <MultiplyByHandLab />
      </Unit>

      <Unit n="3.7" kicker="The big picture" title="Applying the matrix to all of space">
        <ApplyToSpaceLab />
      </Unit>

      <Unit n="3.8" kicker="Edge case" title="When space collapses">
        <CollapseLab />
      </Unit>

      <Unit n="3.9" kicker="Special family" title="Rigid motions (orthogonal matrices)">
        <OrthogonalLab />
      </Unit>

      <Unit n="3.10" kicker="Looking up" title="What changes in higher dimensions?">
        <p>
          Nothing about the <i>idea</i> changes — only the counting. In 3D there are three basis vectors
          <Tex>{String.raw`\,\hat\imath, \hat\jmath, \hat k`}</Tex>, so a map needs <b>three landing
          spots</b>: a 3×3 matrix, one column per basis vector. In n dimensions, an n×n matrix has n
          columns, each saying where one axis goes.
        </p>
        <p>
          Matrices need not be square. An <b>m×n</b> matrix sends n-dimensional space into m-dimensional
          space — its n columns are landing spots living in m dimensions. A 3×2 matrix places a flat plane
          into 3D; a 2×3 matrix flattens 3D onto the plane (like a camera). "Columns are landing spots"
          works every time.
        </p>
        <Check
          prompt="How many columns does a matrix that maps 3D space to 3D space have?"
          options={['2', '3', '9']}
          answer={1}
          explain="One column per input basis vector î, ĵ, k̂ — three columns, each a 3-number landing spot, so the matrix is 3×3 (9 entries)."
        />
      </Unit>

      <Unit n="3.11" kicker="Recap" title="What you can now do, and what's next">
        <Observation>
          <b>In one sentence:</b> a matrix is a linear map written down — its columns are where the basis
          vectors land, and multiplying it by a vector rebuilds that vector's recipe from those columns.
        </Observation>
        <ul>
          <li>A map is <b>linear</b> iff <Tex>{String.raw`T(au+bw)=aT(u)+bT(w)`}</Tex> (origin fixed, lines straight).</li>
          <li>Its <b>columns</b> are <Tex>{String.raw`T(\hat\imath), T(\hat\jmath)`}</Tex>; rows split those into x- and y-parts.</li>
          <li><Tex>{String.raw`Mv`}</Tex> is the weighted sum <Tex>{String.raw`v_1\,\text{col}_1 + v_2\,\text{col}_2`}</Tex>.</li>
          <li>Dependent columns <b>collapse</b> a dimension; orthogonal matrices keep space <b>rigid</b>.</li>
        </ul>
        <p>
          Next: doing one map <b>after</b> another is <b>matrix multiplication</b> (Chapter 4); and the
          area factor that hit zero on collapse is the <b>determinant</b> (Chapter 6).
        </p>
        <Expert
          title="Derive the rotation matrix"
          solution={
            <>
              <p>A linear map is fixed by where î and ĵ go. A counter-clockwise rotation by <Tex>{String.raw`\theta`}</Tex> sends</p>
              <Tex block>{String.raw`\hat\imath = (1,0) \mapsto (\cos\theta, \sin\theta), \qquad \hat\jmath = (0,1) \mapsto (-\sin\theta, \cos\theta).`}</Tex>
              <p>Stacking those landing spots as columns gives</p>
              <Tex block>{String.raw`R_\theta = \begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix}.`}</Tex>
              <p>
                Check: <Tex>{String.raw`R_\theta\,\hat\imath = (\cos\theta, \sin\theta)`}</Tex> ✓, and{' '}
                <Tex>{String.raw`\det R_\theta = \cos^2\theta + \sin^2\theta = 1`}</Tex> — a rigid,
                area-preserving motion, as it must be.
              </p>
            </>
          }
        >
          Derive the matrix of a counter-clockwise rotation by angle <Tex>{String.raw`\theta`}</Tex> by tracking
          where î and ĵ land — then check its determinant.
        </Expert>
      </Unit>

      <Quiz
        title="Linear maps &amp; matrices — chapter check"
        questions={[
          {
            q: 'The columns of a 2×2 matrix tell you…',
            options: [
              'the eigenvalues',
              'where the basis vectors î and ĵ land',
              'the area of the plane',
              'the rows of its inverse',
            ],
            answer: 1,
            explain: 'Column 1 is where î goes, column 2 is where ĵ goes. That pair is the entire content of the matrix.',
          },
          {
            q: 'Why does Mv equal v₁·(column 1) + v₂·(column 2)?',
            options: [
              'It is an arbitrary convention',
              'Because v = v₁·î + v₂·ĵ and linearity carries the recipe to the columns',
              'Because matrices are square',
              'Only when det = 1',
            ],
            answer: 1,
            explain: 'Linearity sends v₁·î + v₂·ĵ to v₁·T(î) + v₂·T(ĵ) = v₁·col1 + v₂·col2.',
          },
          {
            q: 'A naïve animation of a 180° rotation passes through the zero matrix halfway. What does that show?',
            options: [
              'Rotations are impossible',
              'Blending matrix entries linearly is not the geometric motion — it can collapse space',
              'The determinant stays 1 throughout',
              'Nothing — it is correct',
            ],
            answer: 1,
            explain: 'Entry-by-entry averaging is a straight chord in matrix-space, not a rotation; it can pass through singular (even zero) matrices.',
          },
          {
            q: 'A linear map must satisfy…',
            options: [
              'T(u + w) = T(u) · T(w)',
              'T(au + bw) = a·T(u) + b·T(w)',
              'T(v) = v + constant',
              'T(0) ≠ 0',
            ],
            answer: 1,
            explain: 'Linearity is preservation of linear combinations: T(au+bw) = aT(u)+bT(w). It forces T(0)=0.',
          },
        ]}
      />
    </Module>
  )
}
