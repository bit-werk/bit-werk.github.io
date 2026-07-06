import { createContext, useContext, useRef, useCallback, useState, useEffect, useId } from 'react'
import { apply, IDENTITY, fmt } from '../lib/math.js'

// Shared coordinate context: maps world (math) coordinates to screen (SVG) px.
const PlaneCtx = createContext(null)

export function usePlane() {
  return useContext(PlaneCtx)
}

/**
 * An SVG coordinate plane. World origin is centered; +y points up.
 * The rendered pixel width is governed by the CSS var --plane-max (responsive);
 * `size` is only the internal drawing resolution.
 *
 * Built-in, consistent across every lab:
 *   • a value readout (draggable vectors auto-register their coordinates)
 *   • a zoom control            • a grid-snap toggle
 */
export default function Plane({
  size = 440,
  range: range0 = 5,
  grid = null,
  showGrid = true,
  showAxes = true,
  showUnitSquare = false,
  showGhost = false,
  unitSquareColor = '#7c5cff',
  snap: snap0 = true,
  zoom = true,
  readout = true,
  children,
}) {
  const ref = useRef(null)
  const [range, setRange] = useState(range0)
  const [snapEnabled, setSnapEnabled] = useState(snap0)
  const [handles, setHandles] = useState({})

  const scale = size / (2 * range)
  const cx = size / 2
  const cy = size / 2

  const toScreen = useCallback((p) => ({ x: cx + p.x * scale, y: cy - p.y * scale }), [cx, cy, scale])
  const toWorld = useCallback((sx, sy) => ({ x: (sx - cx) / scale, y: (cy - sy) / scale }), [cx, cy, scale])
  const clientToWorld = useCallback(
    (clientX, clientY) => {
      const rect = ref.current.getBoundingClientRect()
      const sx = ((clientX - rect.left) / rect.width) * size
      const sy = ((clientY - rect.top) / rect.height) * size
      return toWorld(sx, sy)
    },
    [size, toWorld],
  )

  const register = useCallback((id, info) => setHandles((h) => ({ ...h, [id]: info })), [])
  const unregister = useCallback(
    (id) => setHandles((h) => { const n = { ...h }; delete n[id]; return n }),
    [],
  )

  const ctx = { toScreen, toWorld, clientToWorld, scale, range, size, snapEnabled, register, unregister }
  const entries = Object.values(handles)

  return (
    <PlaneCtx.Provider value={ctx}>
      <div className="plane-wrap">
        <svg ref={ref} className="plane" viewBox={`0 0 ${size} ${size}`}>
          <rect x="0" y="0" width={size} height={size} className="plane-bg" rx="10" />
          {showGhost && grid && (
            <g className="ghost-layer">
              <GridField matrix={IDENTITY} range={range} faint />
              <GhostBasis />
              <UnitSquare matrix={IDENTITY} color="#adb5bd" />
            </g>
          )}
          {showGrid && <GridField matrix={grid} range={range} />}
          {showAxes && <Axes range={range} matrix={grid} />}
          {showGhost && grid && <Axes range={range} matrix={null} />}
          {showUnitSquare && grid && <UnitSquare matrix={grid} color={unitSquareColor} />}
          {children}
        </svg>

        {readout && entries.length > 0 && (
          <div className="plane-hud">
            {entries.map((e, k) => (
              <div className="hud-row" key={k}>
                <span className="hud-dot" style={{ background: e.color }} />
                {e.label && <span className="hud-label" style={{ color: e.color }}>{e.label}</span>}
                <span className="hud-val">({fmt(e.value.x)}, {fmt(e.value.y)})</span>
              </div>
            ))}
          </div>
        )}

        <div className="plane-tools">
          {zoom && (
            <>
              <button className="ptool" title="Zoom in" onClick={() => setRange((r) => Math.max(2, r * 0.8))}>+</button>
              <button className="ptool" title="Zoom out" onClick={() => setRange((r) => Math.min(14, r / 0.8))}>−</button>
            </>
          )}
          <button
            className={`ptool wide ${snapEnabled ? 'on' : ''}`}
            title="Lock dragging to grid points (toggle for free movement)"
            onClick={() => setSnapEnabled((s) => !s)}
          >
            {snapEnabled ? '🔒 lock to grid' : '🔓 free drag'}
          </button>
        </div>
      </div>
    </PlaneCtx.Provider>
  )
}

function GridField({ matrix, range, faint = false }) {
  const { toScreen } = usePlane()
  const lines = []
  const N = Math.ceil(range) + 2
  const M = matrix
  const tx = (p) => (M ? apply(M, p) : p)
  for (let i = -N; i <= N; i++) {
    const big = N + 1
    const va = toScreen(tx({ x: i, y: -big }))
    const vb = toScreen(tx({ x: i, y: big }))
    const ha = toScreen(tx({ x: -big, y: i }))
    const hb = toScreen(tx({ x: big, y: i }))
    const cls = (i === 0 ? 'grid-axis' : 'grid-line') + (faint ? '-faint' : '')
    lines.push(<line key={`v${i}`} x1={va.x} y1={va.y} x2={vb.x} y2={vb.y} className={cls} />)
    lines.push(<line key={`h${i}`} x1={ha.x} y1={ha.y} x2={hb.x} y2={hb.y} className={cls} />)
  }
  return <g className="grid">{lines}</g>
}

function Axes({ range, matrix }) {
  if (matrix) return null
  const { toScreen } = usePlane()
  const ticks = []
  for (let i = -Math.floor(range); i <= Math.floor(range); i++) {
    if (i === 0) continue
    const px = toScreen({ x: i, y: 0 })
    const py = toScreen({ x: 0, y: i })
    ticks.push(<text key={`tx${i}`} x={px.x} y={px.y + 14} className="tick">{i}</text>)
    ticks.push(<text key={`ty${i}`} x={py.x + 6} y={py.y + 4} className="tick">{i}</text>)
  }
  return <g>{ticks}</g>
}

function GhostBasis() {
  const { toScreen } = usePlane()
  const o = toScreen({ x: 0, y: 0 })
  const i = toScreen({ x: 1, y: 0 })
  const j = toScreen({ x: 0, y: 1 })
  return (
    <g opacity="0.4">
      <line x1={o.x} y1={o.y} x2={i.x} y2={i.y} stroke="#9aa3b2" strokeWidth="2" strokeDasharray="3 3" />
      <line x1={o.x} y1={o.y} x2={j.x} y2={j.y} stroke="#9aa3b2" strokeWidth="2" strokeDasharray="3 3" />
    </g>
  )
}

export function UnitSquare({ matrix, color = '#7c5cff' }) {
  const { toScreen } = usePlane()
  const corners = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ].map((p) => toScreen(apply(matrix, p)))
  const pts = corners.map((p) => `${p.x},${p.y}`).join(' ')
  return <polygon points={pts} fill={color} fillOpacity="0.22" stroke={color} strokeWidth="1.5" />
}

export function Vector({ to, from = { x: 0, y: 0 }, color = '#222', width = 2.5, label, dashed }) {
  const { toScreen } = usePlane()
  const a = toScreen(from)
  const b = toScreen(to)
  const id = `arrow-${color.replace('#', '')}`
  const len = Math.hypot(b.x - a.x, b.y - a.y)
  return (
    <g>
      <defs>
        <marker id={id} markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
          <path d="M0,0 L7,3 L0,6 Z" fill={color} />
        </marker>
      </defs>
      <line
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke={color}
        strokeWidth={width}
        markerEnd={len > 6 ? `url(#${id})` : undefined}
        strokeDasharray={dashed ? '5 5' : undefined}
        strokeLinecap="round"
      />
      {label && (
        <text x={b.x + 8} y={b.y - 6} className="vec-label" fill={color}>
          {label}
        </text>
      )}
    </g>
  )
}

export function Dot({ at, color = '#222', r = 4, label }) {
  const { toScreen } = usePlane()
  const p = toScreen(at)
  return (
    <g>
      <circle cx={p.x} cy={p.y} r={r} fill={color} />
      {label && (
        <text x={p.x + 8} y={p.y - 8} className="vec-label" fill={color}>
          {label}
        </text>
      )}
    </g>
  )
}

export function Segment({ from, to, color = '#888', dashed = true, width = 1.5 }) {
  const { toScreen } = usePlane()
  const a = toScreen(from)
  const b = toScreen(to)
  return (
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={width} strokeDasharray={dashed ? '4 4' : undefined} />
  )
}

/**
 * A draggable vector handle. Calls onChange(worldPoint) while dragging.
 * Honors the plane's grid-snap toggle, and auto-registers its value into the
 * plane's readout (pass a `label` so the readout can name it).
 */
export function DraggableVector({ value, onChange, color = '#1769ff', label, snap }) {
  const ctx = usePlane()
  const { toScreen, clientToWorld, snapEnabled, register, unregister } = ctx
  const id = useId()
  const p = toScreen(value)

  useEffect(() => {
    register(id, { label, color, value })
    return () => unregister(id)
  }, [id, label, color, value, register, unregister])

  const onDown = (e) => {
    e.preventDefault()
    e.target.setPointerCapture?.(e.pointerId)
    const move = (ev) => {
      let w = clientToWorld(ev.clientX, ev.clientY)
      if (snapEnabled && snap) w = { x: Math.round(w.x / snap) * snap, y: Math.round(w.y / snap) * snap }
      onChange(w)
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <g>
      <Vector to={value} color={color} label={label} width={3} />
      <circle
        cx={p.x}
        cy={p.y}
        r={12}
        fill={color}
        fillOpacity="0.001"
        stroke={color}
        strokeOpacity="0.5"
        strokeWidth="2"
        style={{ cursor: 'grab' }}
        onPointerDown={onDown}
      />
    </g>
  )
}
