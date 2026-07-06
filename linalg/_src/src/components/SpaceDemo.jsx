import { useRef, useEffect, useState } from 'react'

// A self-contained hero animation: 3-D space (a lattice cube + the three basis
// vectors î, ĵ, k̂) endlessly deformed by a random walk of *volume-preserving*
// linear maps — rotations, shears, squeezes — with a short pause between each.
// Every few steps space relaxes back to the orthonormal identity.
//
// Interactive:
//   • Click-drag the canvas → auto-pauses and you orbit the view by hand.
//   • Click into the matrix → auto-pauses and you can edit the nine numbers;
//     space redraws live from whatever you type. Hit ▶ to resume the walk.
//
// Rendered on a <canvas> (not SVG like the rest of the lab) because it repaints
// ~60 fps; the matrix cells are uncontrolled <input>s the animation writes to
// via refs, so React never has to re-render during playback.

// ---- tiny 3×3 linear algebra (row-major arrays of arrays) ------------------
const I3 = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
]

const matmul = (A, B) => {
  const R = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      R[i][j] = A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j]
  return R
}
const applyM = (M, p) => [
  M[0][0] * p[0] + M[0][1] * p[1] + M[0][2] * p[2],
  M[1][0] * p[0] + M[1][1] * p[1] + M[1][2] * p[2],
  M[2][0] * p[0] + M[2][1] * p[1] + M[2][2] * p[2],
]
const lerpM = (A, B, t) => {
  const R = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) R[i][j] = A[i][j] + (B[i][j] - A[i][j]) * t
  return R
}
const smooth = (t) => t * t * (3 - 2 * t)
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const rand = (a, b) => a + Math.random() * (b - a)
const pick = (arr) => arr[(Math.random() * arr.length) | 0]

// Rotation about a random unit axis (Rodrigues). Length-preserving ⇒ bounded.
function randomRotation() {
  const z = rand(-1, 1)
  const th = rand(0, Math.PI * 2)
  const r = Math.sqrt(1 - z * z)
  const u = [r * Math.cos(th), r * Math.sin(th), z]
  const a = rand(0.45, 0.9) * (Math.random() < 0.5 ? -1 : 1) // ~26°–52°
  const c = Math.cos(a)
  const s = Math.sin(a)
  const t = 1 - c
  const [x, y, w] = u
  return {
    M: [
      [t * x * x + c, t * x * y - s * w, t * x * w + s * y],
      [t * x * y + s * w, t * y * y + c, t * y * w - s * x],
      [t * x * w - s * y, t * y * w + s * x, t * w * w + c],
    ],
    type: 'Rotation',
  }
}

// Shear: add a slice of one axis onto another. det = 1.
function randomShear() {
  const [i, j] = pick([[0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1]])
  const k = rand(0.35, 0.65) * (Math.random() < 0.5 ? -1 : 1)
  const M = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
  M[i][j] = k
  return { M, type: 'Shear' }
}

// Squeeze: stretch one axis, compress another by the reciprocal. det = 1.
function randomSqueeze() {
  const axes = [0, 1, 2].sort(() => Math.random() - 0.5)
  const s = rand(1.3, 1.7)
  const d = [1, 1, 1]
  d[axes[0]] = s
  d[axes[1]] = 1 / s
  return { M: [[d[0], 0, 0], [0, d[1], 0], [0, 0, d[2]]], type: 'Squeeze' }
}

const randomStep = () => pick([randomRotation, randomShear, randomSqueeze, randomRotation])()

// ---- the lattice we deform: integer points −1,0,1 on each axis -------------
const TICKS = [-1, 0, 1]
const LATTICE_LINES = (() => {
  const lines = []
  for (let axis = 0; axis < 3; axis++) {
    for (const u of TICKS) {
      for (const v of TICKS) {
        const a = [0, 0, 0]
        const b = [0, 0, 0]
        const other = [0, 1, 2].filter((x) => x !== axis)
        a[other[0]] = b[other[0]] = u
        a[other[1]] = b[other[1]] = v
        a[axis] = -1
        b[axis] = 1
        lines.push([a, b])
      }
    }
  }
  return lines
})()

const CUBE_CORNERS = []
for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) CUBE_CORNERS.push([x, y, z])

const BASIS = [
  { v: [1, 0, 0], color: '#1769ff', label: 'î' },
  { v: [0, 1, 0], color: '#e8590c', label: 'ĵ' },
  { v: [0, 0, 1], color: '#12b886', label: 'k̂' },
]

const ORBIT_SPEED = 0.00028 // rad per ms
const MORPH = 1700
const HOLD = 700

const fmt = (n) => (Math.abs(n) < 0.005 ? 0 : n).toFixed(2)

export default function SpaceDemo() {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const cellRefs = useRef([])
  const typeRef = useRef(null)
  const [mode, setMode] = useState('auto') // 'auto' | 'paused'

  // All mutable animation state lives here so both the rAF loop (below) and the
  // React event handlers can read/write it without re-rendering.
  const scene = useRef({
    M: I3, cur: I3, tgt: I3, segType: 'Identity', segStart: 0,
    stepsLeft: 4, didReset: true, clock: 0,
    theta: 0.0, phi: 0.44, curScale: 90, mode: 'auto',
  })
  const drag = useRef({ active: false, x: 0, y: 0 })

  // ---- interaction helpers (render scope) ----
  const setType = (t) => {
    if (typeRef.current) typeRef.current.textContent = t
  }
  const pause = (label) => {
    scene.current.mode = 'paused'
    if (label) setType(label)
    setMode('paused')
  }
  const startAuto = () => {
    const s = scene.current
    s.cur = s.M
    const step = randomStep()
    s.tgt = matmul(step.M, s.M)
    s.segType = step.type
    s.stepsLeft = 3 + ((Math.random() * 3) | 0)
    s.didReset = false
    s.segStart = s.clock
    setType(s.segType)
    s.mode = 'auto'
    setMode('auto')
  }
  const readInputs = () => {
    const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        const v = parseFloat(cellRefs.current[i * 3 + j]?.value)
        M[i][j] = Number.isFinite(v) ? v : 0
      }
    return M
  }
  const onEdit = () => {
    scene.current.M = readInputs()
    setType('Your matrix')
  }
  const onCanvasDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    pause('Drag to rotate')
    drag.current = { active: true, x: e.clientX, y: e.clientY }
  }
  const onCanvasMove = (e) => {
    const d = drag.current
    if (!d.active) return
    const s = scene.current
    s.theta -= (e.clientX - d.x) * 0.01
    s.phi = clamp(s.phi + (e.clientY - d.y) * 0.01, -1.3, 1.3)
    d.x = e.clientX
    d.y = e.clientY
  }
  const onCanvasUp = () => {
    drag.current.active = false
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const s = scene.current
    let raf = 0

    let W = 0
    let H = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = wrapRef.current.getBoundingClientRect()
      W = rect.width
      H = rect.height
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrapRef.current)

    const nextSegment = (clock) => {
      s.cur = s.tgt
      if (s.didReset) {
        const step = randomStep()
        s.tgt = matmul(step.M, s.cur)
        s.segType = step.type
        s.stepsLeft = 3 + ((Math.random() * 3) | 0)
        s.didReset = false
      } else if (s.stepsLeft <= 0) {
        s.tgt = I3
        s.segType = 'Return to identity'
        s.didReset = true
      } else {
        const step = randomStep()
        s.tgt = matmul(step.M, s.cur)
        s.segType = step.type
        s.stepsLeft -= 1
      }
      s.segStart = clock
      setType(s.segType)
    }

    const draw = (M) => {
      ctx.clearRect(0, 0, W, H)
      const cx = W / 2
      const cy = H / 2 + H * 0.04
      const ct = Math.cos(s.theta)
      const st = Math.sin(s.theta)
      const cp = Math.cos(s.phi)
      const sp = Math.sin(s.phi)

      let maxr = 1e-6
      for (const c of CUBE_CORNERS) {
        const p = applyM(M, c)
        maxr = Math.max(maxr, Math.hypot(p[0], p[1], p[2]))
      }
      const fit = 0.4 * Math.min(W, H)
      s.curScale += (clamp(fit / maxr, 24, 320) - s.curScale) * 0.06

      const project = (p) => {
        const x = p[0] * ct - p[2] * st
        const z = p[0] * st + p[2] * ct
        const y = p[1]
        const yt = y * cp - z * sp
        const depth = y * sp + z * cp
        return { x: cx + x * s.curScale, y: cy - yt * s.curScale, depth }
      }

      // faint static reference lattice (identity)
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(120,130,150,0.14)'
      for (const [a, b] of LATTICE_LINES) {
        const pa = project(a)
        const pb = project(b)
        ctx.beginPath()
        ctx.moveTo(pa.x, pa.y)
        ctx.lineTo(pb.x, pb.y)
        ctx.stroke()
      }

      // deforming lattice — sorted back-to-front so it reads as 3-D
      const seg = LATTICE_LINES.map(([a, b]) => {
        const pa = project(applyM(M, a))
        const pb = project(applyM(M, b))
        return { pa, pb, depth: (pa.depth + pb.depth) / 2 }
      }).sort((u, v) => u.depth - v.depth)
      for (const g of seg) {
        const near = (g.depth + 1.8) / 3.6
        ctx.strokeStyle = `rgba(91,84,255,${(0.28 + 0.42 * near).toFixed(3)})`
        ctx.lineWidth = 1.1
        ctx.beginPath()
        ctx.moveTo(g.pa.x, g.pa.y)
        ctx.lineTo(g.pb.x, g.pb.y)
        ctx.stroke()
      }

      const O = project([0, 0, 0])
      ctx.fillStyle = '#1a1d24'
      ctx.beginPath()
      ctx.arc(O.x, O.y, 3, 0, 7)
      ctx.fill()

      const arrows = BASIS.map((b) => ({ ...b, tip: project(applyM(M, b.v)) })).sort(
        (u, v) => u.tip.depth - v.tip.depth,
      )
      ctx.font = '600 15px Inter, sans-serif'
      for (const ar of arrows) {
        drawArrow(ctx, O, ar.tip, ar.color)
        ctx.fillStyle = ar.color
        ctx.fillText(ar.label, ar.tip.x + 8, ar.tip.y - 6)
      }
    }

    let last = performance.now()
    const frame = (now) => {
      const dt = now - last
      last = now
      if (s.mode === 'auto') {
        s.clock += dt
        s.theta += dt * ORBIT_SPEED
        const el = s.clock - s.segStart
        if (el < MORPH) s.M = lerpM(s.cur, s.tgt, smooth(el / MORPH))
        else if (el < MORPH + HOLD) s.M = s.tgt
        else {
          nextSegment(s.clock)
          s.M = s.cur
        }
        for (let i = 0; i < 3; i++)
          for (let j = 0; j < 3; j++) {
            const elc = cellRefs.current[i * 3 + j]
            if (elc && document.activeElement !== elc) elc.value = fmt(s.M[i][j])
          }
      }
      draw(s.M)
      raf = requestAnimationFrame(frame)
    }

    nextSegment(0)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  const editable = mode === 'paused'

  return (
    <div className="space-demo">
      <div className="space-canvas-wrap" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className="space-canvas"
          onPointerDown={onCanvasDown}
          onPointerMove={onCanvasMove}
          onPointerUp={onCanvasUp}
          onPointerCancel={onCanvasUp}
        />
        <button
          className="space-pause"
          onClick={() => (mode === 'auto' ? pause('Paused') : startAuto())}
          aria-label={mode === 'auto' ? 'Pause' : 'Play'}
        >
          {mode === 'auto' ? '❚❚ Pause' : '▶ Play'}
        </button>
        <span className="space-hint">drag to rotate</span>
      </div>

      <div className="space-side">
        <div className="space-type" ref={typeRef}>
          Identity
        </div>
        <div
          className={`matrix-readout ${editable ? 'editable' : ''}`}
          onFocusCapture={() => pause('Your matrix')}
        >
          <span className="mbrace">[</span>
          <div className="mgrid">
            {[0, 1, 2].map((i) =>
              [0, 1, 2].map((j) => (
                <input
                  key={`${i}${j}`}
                  className={`mcell col${j}`}
                  ref={(el) => (cellRefs.current[i * 3 + j] = el)}
                  defaultValue="0.00"
                  type="text"
                  inputMode="decimal"
                  spellCheck="false"
                  readOnly={!editable}
                  onChange={onEdit}
                  onFocus={(e) => e.target.select()}
                />
              )),
            )}
          </div>
          <span className="mbrace">]</span>
        </div>
        <div className="matrix-cols">
          <span style={{ color: '#1769ff' }}>î</span>
          <span style={{ color: '#e8590c' }}>ĵ</span>
          <span style={{ color: '#12b886' }}>k̂</span>
        </div>
        <p className="muted small center space-caption">
          Columns are where î, ĵ, k̂ land. Click a number to edit it.
        </p>
      </div>
    </div>
  )
}

function drawArrow(ctx, from, to, color) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy)
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 3.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y)
  ctx.stroke()
  if (len < 6) return
  const ux = dx / len
  const uy = dy / len
  const h = 11
  const w = 6
  ctx.beginPath()
  ctx.moveTo(to.x, to.y)
  ctx.lineTo(to.x - ux * h - uy * w, to.y - uy * h + ux * w)
  ctx.lineTo(to.x - ux * h + uy * w, to.y - uy * h - ux * w)
  ctx.closePath()
  ctx.fill()
}
