import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { GLOSSARY } from "../glossary";

// Lightweight inline markup for course text:
//   [[slug|display text]]  → a glossary term with a hover/focus tooltip
//   [[slug]]               → same, using the slug as the display text
//   **bold**               → <strong>
// Paragraphs are separated by blank lines. Unknown slugs render as plain text.

const TOKEN = /\[\[([^\]]+)\]\]/g;
const BOLD = /\*\*([^*]+)\*\*/g;

// Render **bold** spans within a plain text run.
function withBold(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  BOLD.lastIndex = 0;
  while ((m = BOLD.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<strong key={`${keyBase}-b${i++}`}>{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const EDGE = 8; // minimum gap between a popup and the viewport edge
const GAP = 6;

function Term({ slug, text }: { slug: string; text: string }) {
  const g = GLOSSARY[slug];
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number; maxHeight: number } | null>(null);
  const termRef = useRef<HTMLSpanElement>(null);
  const popRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<number>();

  const show = () => {
    window.clearTimeout(timer.current);
    setOpen(true);
  };
  // A short delay lets the pointer cross the gap between the term and its popup.
  const hide = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), 120);
  };

  // Place the popup in fixed viewport coordinates so it is never clipped by a
  // scrolling container: below the term if it fits, else above, else on the
  // roomier side with a scrollable body; always clamped horizontally.
  useLayoutEffect(() => {
    if (!open || !termRef.current || !popRef.current) return;
    const rects = termRef.current.getClientRects();
    const r = rects[rects.length - 1] ?? termRef.current.getBoundingClientRect();
    const first = rects[0] ?? r;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = popRef.current.offsetWidth;
    const h = popRef.current.scrollHeight + 2;
    const below = vh - r.bottom - GAP - EDGE;
    const above = first.top - GAP - EDGE;
    let top: number;
    let maxHeight: number;
    if (h <= below) {
      top = r.bottom + GAP;
      maxHeight = below;
    } else if (h <= above) {
      top = first.top - GAP - h;
      maxHeight = above;
    } else if (below >= above) {
      top = r.bottom + GAP;
      maxHeight = below;
    } else {
      maxHeight = above;
      top = first.top - GAP - Math.min(h, above);
    }
    const left = Math.max(EDGE, Math.min(r.left, vw - w - EDGE));
    setPos({ left, top: Math.max(EDGE, top), maxHeight: Math.max(80, maxHeight) });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e?: Event) => {
      if (e?.target instanceof Node && popRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  if (!g) return <>{text}</>;
  return (
    <span
      className="term"
      tabIndex={0}
      ref={termRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {text}
      {open && (
        <span
          className="term-pop"
          role="tooltip"
          ref={popRef}
          style={pos ? { left: pos.left, top: pos.top, maxHeight: pos.maxHeight } : { visibility: "hidden" }}
        >
          <span className="term-pop-title">{g.term}</span>
          <span className="term-pop-def">{g.short}</span>
          <a href={g.url} target="_blank" rel="noreferrer">
            Wikipedia
          </a>
        </span>
      )}
    </span>
  );
}

function renderInline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(text))) {
    if (m.index > last) out.push(...withBold(text.slice(last, m.index), `${keyBase}-t${i}`));
    const [slug, display] = m[1].split("|");
    out.push(<Term key={`${keyBase}-x${i}`} slug={slug.trim()} text={(display ?? slug).trim()} />);
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) out.push(...withBold(text.slice(last), `${keyBase}-tend`));
  return out;
}

/** Inline rich text (no paragraph wrapping). */
export function RichInline({ text }: { text: string }) {
  return <>{renderInline(text, "inl")}</>;
}

/** Block rich text: blank-line-separated paragraphs. */
export function RichText({ text }: { text: string }) {
  const paras = text.split(/\n\n+/);
  return (
    <>
      {paras.map((p, i) => (
        <p key={i} className="rt-p">
          {renderInline(p, `p${i}`)}
        </p>
      ))}
    </>
  );
}
