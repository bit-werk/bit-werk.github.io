import type { ReactNode } from "react";
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

function Term({ slug, text }: { slug: string; text: string }) {
  const g = GLOSSARY[slug];
  if (!g) return <>{text}</>;
  return (
    <span className="term" tabIndex={0}>
      {text}
      <span className="term-pop" role="tooltip">
        <span className="term-pop-title">{g.term}</span>
        <span className="term-pop-def">{g.short}</span>
        <a href={g.url} target="_blank" rel="noreferrer">
          Wikipedia →
        </a>
      </span>
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
