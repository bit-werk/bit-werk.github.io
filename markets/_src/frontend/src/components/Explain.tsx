import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CONCEPTS, type ConceptKey } from "../concepts";

const POP_WIDTH = 330;
const MARGIN = 12;
export const DWELL_MS = 1800;

export interface Anchor {
  x: number;
  y: number;
  /** extent of the thing being explained (viewport px); 0 for a point */
  w?: number;
  h?: number;
}

// The explanation card for a concept. Fixed-position in a portal; once mounted
// it is measured and flipped/clamped so it always stays fully on screen. The
// pointer may travel onto the card (to reach the link), so it reports enter/leave.
export function ConceptPopover({
  concept,
  anchor,
  onEnter,
  onLeave,
}: {
  concept: ConceptKey;
  anchor: Anchor;
  onEnter?: () => void;
  onLeave?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: -9999, left: -9999 });
  const c = CONCEPTS[concept];

  useLayoutEffect(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const gap = 8;
    const below = anchor.y + (anchor.h ?? 0) + gap;
    let top = below;
    if (below + r.height > window.innerHeight - MARGIN) top = anchor.y - r.height - gap;
    top = Math.max(MARGIN, Math.min(top, window.innerHeight - r.height - MARGIN));
    const left = Math.max(MARGIN, Math.min(anchor.x, window.innerWidth - r.width - MARGIN));
    setPos({ top, left });
  }, [anchor.x, anchor.y, anchor.w, anchor.h, concept]);

  return createPortal(
    <div
      className="pop"
      ref={ref}
      role="tooltip"
      style={{ top: pos.top, left: pos.left, width: Math.min(POP_WIDTH, window.innerWidth - 2 * MARGIN) }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <strong className="pop-term">{c.term}</strong>
      <span className="pop-text">{c.short}</span>
      <a className="pop-link" href={c.url} target="_blank" rel="noreferrer">
        Read more on Wikipedia
      </a>
    </div>,
    document.body,
  );
}

// Wrap anything to give it a hover explanation: rest the pointer on it (or focus
// it) for a moment and the concept card appears. Leaves on pointer-out, unless
// the pointer is moving onto the card itself.
export function Explain({
  concept,
  children,
  className,
}: {
  concept: ConceptKey;
  children: ReactNode;
  className?: string;
}) {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const elRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | null>(null);
  const overPop = useRef(false);

  const clear = () => {
    if (timer.current != null) window.clearTimeout(timer.current);
    timer.current = null;
  };
  const arm = (ms: number) => {
    clear();
    timer.current = window.setTimeout(() => {
      const r = elRef.current?.getBoundingClientRect();
      if (r) setAnchor({ x: r.left, y: r.top, w: r.width, h: r.height });
    }, ms);
  };
  const leave = useCallback(() => {
    clear();
    timer.current = window.setTimeout(() => {
      if (!overPop.current) setAnchor(null);
    }, 220);
  }, []);

  useEffect(() => {
    if (!anchor) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAnchor(null);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [anchor]);
  useEffect(() => clear, []);

  return (
    <span
      ref={elRef}
      className={className}
      onMouseEnter={() => arm(DWELL_MS)}
      onMouseLeave={leave}
      onFocus={() => arm(600)}
      onBlur={leave}
    >
      {children}
      {anchor && (
        <ConceptPopover
          concept={concept}
          anchor={anchor}
          onEnter={() => {
            overPop.current = true;
          }}
          onLeave={() => {
            overPop.current = false;
            leave();
          }}
        />
      )}
    </span>
  );
}
