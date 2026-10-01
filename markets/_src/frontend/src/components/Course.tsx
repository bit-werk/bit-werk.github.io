import { Chevron } from "./Chevron";
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
    <section className="panel course">
      <div className="panel-col">
        <div className="panel-main panel-fit">
      {ch ? (
        <article className="chapter">
          <div className="chapter-top">
            <h3 className="chapter-title">{ch.title}</h3>
            <span className="chapter-era">{ch.era}</span>
            <span className="chapter-n">
              Chapter {index! + 1} of {CHAPTERS.length}
            </span>
          </div>
          <p className="chapter-look">
            <span className="chapter-look-k">Look for</span>{" "}
            <RichInline text={ch.observe} />
          </p>
          <div className="chapter-body">
            <RichText text={ch.body} />
          </div>
        </article>
      ) : (
        <div className="panel-intro">
          <p>
            <RichInline text="A short history of booms, bubbles, wars and policy, and the ideas ([[keynes|Keynes]], [[hyman-minsky|Minsky]], [[robert-shiller|Shiller]], [[friedman|Friedman]]) that explain them." />
          </p>
          <button type="button" className="link strong" onClick={() => onSelect(0)}>
            Begin with chapter 1
          </button>
        </div>
      )}
        </div>
        <div className="nav">
        <button type="button" className="link nav-step" aria-label="Previous" disabled={index == null || index <= 0} onClick={() => onSelect((index ?? 0) - 1)}>
          <Chevron dir="left" />
        </button>
        <select
          className="pick"
          aria-label="Choose a chapter"
          value={index ?? ""}
          onChange={(e) => onSelect(e.target.value === "" ? null : Number(e.target.value))}
        >
          <option value="">Choose a chapter</option>
          {CHAPTERS.map((c, i) => (
            <option key={c.id} value={i}>
              {i + 1}. {c.title}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="link nav-step"
          aria-label="Next"
          disabled={index != null && index >= CHAPTERS.length - 1}
          onClick={() => onSelect((index ?? -1) + 1)}
        >
          <Chevron dir="right" />
        </button>
      </div>
      </div>
    </section>
  );
}
