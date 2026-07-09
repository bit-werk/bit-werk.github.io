import { CHAPTERS } from "../course";
import { RichText, RichInline } from "./RichText";

interface Props {
  index: number | null;
  onSelect: (i: number | null) => void;
}

// The narrative course panel: a click-through history of market cycles &
// macroeconomics. Selecting a chapter drives the chart (App applies the
// chapter's series / scale / zoom and highlights the linked event).
export function Course({ index, onSelect }: Props) {
  const ch = index != null ? CHAPTERS[index] : null;

  return (
    <section className="course">
      <div className="course-top">
        <h3>Market Cycles &amp; Macroeconomics</h3>
        <span className="course-sub">A guided history course — click through; the chart follows.</span>
      </div>

      <div className="course-nav">
        <button
          type="button"
          className="btn"
          disabled={index == null || index <= 0}
          onClick={() => onSelect((index ?? 0) - 1)}
        >
          ← Prev
        </button>
        <select
          className="course-select"
          value={index ?? ""}
          onChange={(e) => onSelect(e.target.value === "" ? null : Number(e.target.value))}
        >
          <option value="">Start the course…</option>
          {CHAPTERS.map((c, i) => (
            <option key={c.id} value={i}>
              {i + 1}. {c.title}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn"
          disabled={index == null || index >= CHAPTERS.length - 1}
          onClick={() => onSelect((index ?? -1) + 1)}
        >
          Next →
        </button>
      </div>

      {ch ? (
        <article className="course-card">
          <div className="course-head">
            <span className="course-era">{ch.era}</span>
            <strong>{ch.title}</strong>
            <button type="button" className="course-exit" onClick={() => onSelect(null)}>
              Exit
            </button>
          </div>
          <div className="course-observe">
            <span className="obs-label">Look for</span>
            <span className="obs-text">
              <RichInline text={ch.observe} />
            </span>
          </div>
          <div className="course-body">
            <RichText text={ch.body} />
          </div>
          <div className="course-count">
            Chapter {index! + 1} of {CHAPTERS.length} · hover the underlined terms for definitions
          </div>
        </article>
      ) : (
        <div className="course-intro">
          <p>
            <RichInline text="A short, click-through history of booms, bubbles, wars and policy — and the ideas ([[keynes|Keynes]], [[hyman-minsky|Minsky]], [[robert-shiller|Shiller]], [[friedman|Friedman]]…) that explain them. Each chapter zooms the chart and shows the series that tell the story." />
          </p>
          <button type="button" className="btn" onClick={() => onSelect(0)}>
            Begin the course →
          </button>
        </div>
      )}
    </section>
  );
}
