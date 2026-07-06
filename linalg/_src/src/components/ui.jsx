import { createContext, useContext, useState, useEffect, useCallback } from 'react'

// Accordion controller for a chapter: tracks the ordered units and which one is
// open ("in focus"). Wrap a chapter's body in <Module> so its <Unit>s collapse.
const UnitCtx = createContext(null)

export function Module({ children }) {
  const [order, setOrder] = useState([])
  const [active, setActive] = useState(null)
  const register = useCallback((n) => {
    setOrder((o) => (o.includes(n) ? o : [...o, n]))
  }, [])
  useEffect(() => {
    if (active == null && order.length) setActive(order[0])
  }, [order, active])
  return (
    <div className="module">
      <UnitCtx.Provider value={{ order, active, setActive, register }}>{children}</UnitCtx.Provider>
    </div>
  )
}

export function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>
}

export function Panel({ title, children }) {
  return (
    <div className="panel">
      {title && <h4 className="panel-title">{title}</h4>}
      {children}
    </div>
  )
}

export function Btn({ children, onClick, active, ghost }) {
  return (
    <button className={`btn ${active ? 'active' : ''} ${ghost ? 'ghost' : ''}`} onClick={onClick}>
      {children}
    </button>
  )
}

export function PresetRow({ presets, onPick, active = null }) {
  return (
    <div className="preset-row">
      {presets.map((p) => (
        <button
          key={p.label}
          className={`chip ${active === p.label ? 'active' : ''}`}
          onClick={() => onPick(p.value, p.label)}
          title={p.title}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

export function Stat({ label, value, color, hint }) {
  return (
    <div className="stat" title={hint}>
      <span className="stat-label">{label}</span>
      <span className="stat-value" style={color ? { color } : undefined}>
        {value}
      </span>
    </div>
  )
}

export function Experiment({ children }) {
  return (
    <div className="experiment">
      <span className="experiment-tag">Try it</span>
      <div>{children}</div>
    </div>
  )
}

// A single self-contained "thinking step". Inside a <Module>, units act as an
// accordion: only the focused one is expanded; the rest collapse to a header
// and dim, so long chapters stay legible.
export function Unit({ n, title, kicker, children }) {
  const ctx = useContext(UnitCtx)
  useEffect(() => {
    ctx?.register(n)
  }, [ctx, n])

  const isOpen = !ctx || ctx.active === n
  const order = ctx?.order || []
  const idx = order.indexOf(n)
  const next = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null

  const toggle = () => ctx && ctx.setActive(isOpen ? null : n)
  const goNext = () => {
    if (!ctx || !next) return
    ctx.setActive(next)
    setTimeout(() => {
      document.getElementById(`unit-${next}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 30)
  }

  return (
    <section className={`unit ${isOpen ? 'open' : 'collapsed'}`} id={`unit-${n}`}>
      <button className="unit-head" onClick={toggle} aria-expanded={isOpen}>
        <span className="unit-n">{n}</span>
        <span className="unit-headtext">
          {kicker && <span className="unit-kicker">{kicker}</span>}
          <span className="unit-title">{title}</span>
        </span>
        {ctx && <span className="unit-caret">{isOpen ? '▾' : '▸'}</span>}
      </button>
      {isOpen && (
        <div className="unit-body">
          {children}
          {next && (
            <button className="unit-next" onClick={goNext}>
              Next · {next} ›
            </button>
          )}
        </div>
      )}
    </section>
  )
}

// The one-sentence takeaway of a unit.
export function Observation({ children }) {
  return (
    <div className="observation">
      <span className="observation-tag">Takeaway</span>
      <div>{children}</div>
    </div>
  )
}

// A boxed bit of formalism (definitions, properties) to sit beside the intuition.
export function Formal({ title = 'Formally', children }) {
  return (
    <div className="formal">
      <div className="formal-tag">{title}</div>
      <div>{children}</div>
    </div>
  )
}

// An "expert challenge": a hard task (derive / prove) with a collapsible
// worked solution. No input field — the answers are long and open-ended.
export function Expert({ title = 'Challenge', children, solution }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="expert">
      <div className="expert-head">
        <span className="expert-tag">Expert</span>
        <span>{title}</span>
      </div>
      <div className="expert-task">{children}</div>
      <button className="expert-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? '▾ Hide solution' : '▸ Reveal solution'}
      </button>
      {open && <div className="expert-solution">{solution}</div>}
    </div>
  )
}

// Two-column layout: visual on the left, prose/controls on the right.
export function Split({ visual, children }) {
  return (
    <div className="split">
      <div className="split-visual">{visual}</div>
      <div className="split-side">{children}</div>
    </div>
  )
}
