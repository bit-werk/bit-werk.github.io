import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CONCEPTS, type ConceptKey } from "../concepts";

const POP_WIDTH = 320;
const MARGIN = 12;

// A small "ⓘ" that opens a popover explaining a concept, with a "read more"
// link. The popover renders in a portal with fixed positioning, and after it
// mounts we measure it and clamp/flip it so it always stays fully on screen.
export function InfoButton({ concept }: { concept: ConceptKey }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: -9999, left: -9999 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const c = CONCEPTS[concept];

  // Position within the viewport once the popover has a measurable size.
  useLayoutEffect(() => {
    if (!open || !popRef.current || !btnRef.current) return;
    const pop = popRef.current.getBoundingClientRect();
    const btn = btnRef.current.getBoundingClientRect();
    // prefer below the button; flip above if it would overflow the bottom
    let top = btn.bottom + 6;
    if (top + pop.height > window.innerHeight - MARGIN) top = btn.top - pop.height - 6;
    top = Math.max(MARGIN, Math.min(top, window.innerHeight - pop.height - MARGIN));
    const left = Math.max(MARGIN, Math.min(btn.left, window.innerWidth - pop.width - MARGIN));
    setPos({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!popRef.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <span className="info">
      <button
        type="button"
        className="info-btn"
        ref={btnRef}
        aria-label={`What is ${c.term}?`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        i
      </button>
      {open &&
        createPortal(
          <span
            className="info-pop"
            ref={popRef}
            role="dialog"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: Math.min(POP_WIDTH, window.innerWidth - 2 * MARGIN),
            }}
          >
            <strong>{c.term}</strong>
            <span className="info-text">{c.short}</span>
            <a href={c.url} target="_blank" rel="noreferrer">
              Read more on Wikipedia →
            </a>
          </span>,
          document.body,
        )}
    </span>
  );
}
