import { Chevron } from "./Chevron";
import { EVENTS, type MarketEvent } from "../events";
import { evColor } from "../design";
import EXCERPTS from "../excerpts.json";

const EXCERPT = EXCERPTS as Record<string, string[]>;

interface Props {
  index: number | null;
  onSelect: (i: number | null) => void;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const month = (iso: string) => `${MONTHS[+iso.slice(5, 7) - 1]} ${iso.slice(0, 4)}`;
const when = (e: MarketEvent) =>
  e.end ? (e.end.slice(0, 4) === e.date.slice(0, 4) ? e.date.slice(0, 4) : `${e.date.slice(0, 4)}–${e.end.slice(0, 4)}`) : month(e.date);

const wikiTitle = (url: string) => {
  const seg = url.split("/").pop()?.split("#")[0] ?? "";
  try {
    return decodeURIComponent(seg).replace(/_/g, " ");
  } catch {
    return seg.replace(/_/g, " ");
  }
};

// The events reference: step through the curated market events, each focusing
// the chart on its moment and telling its story. (The narrative *course* lives
// in Course.tsx; this panel is the plain event index.)
export function Events({ index, onSelect }: Props) {
  const active = index != null ? EVENTS[index] : null;

  return (
    <section className="panel events">
      <div className="panel-col">
        <div className="panel-main panel-fit">

      {active ? (
        <article className="story">
          <div className="story-top">
            <h3 className="story-title">{active.title}</h3>
            <span className="story-type" style={{ color: evColor(active.type) }}>
              {active.type}
            </span>
            <span className="story-when">{when(active)}</span>
            <span className="story-n">
              Event {index! + 1} of {EVENTS.length}
            </span>
          </div>
          <div className="story-body">
            <p className="story-text">{active.text}</p>
            {(EXCERPT[active.id] ?? []).map((p, k) => (
              <p className="story-excerpt" key={k}>
                {p}
              </p>
            ))}
            <p className="story-src">
              <a className="story-link" href={active.url} target="_blank" rel="noreferrer">
                Wikipedia: {wikiTitle(active.url)}
              </a>{" "}
              (CC BY-SA)
            </p>
          </div>
        </article>
      ) : (
        <p className="panel-intro">
          {EVENTS.length} turning points: booms, bubbles, crashes and recoveries.{" "}
          <button type="button" className="link strong" onClick={() => onSelect(0)}>
            Start with the first
          </button>
        </p>
      )}
        </div>
      <div className="nav">
        <button type="button" className="link nav-step" aria-label="Previous" disabled={index == null || index <= 0} onClick={() => onSelect((index ?? 0) - 1)}>
          <Chevron dir="left" />
        </button>
        <select
          className="pick"
          aria-label="Jump to an event"
          value={index ?? ""}
          onChange={(e) => onSelect(e.target.value === "" ? null : Number(e.target.value))}
        >
          <option value="">Jump to an event</option>
          {EVENTS.map((e, i) => (
            <option key={e.id} value={i}>
              {when(e)}  {e.title}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="link nav-step"
          aria-label="Next"
          disabled={index != null && index >= EVENTS.length - 1}
          onClick={() => onSelect((index ?? -1) + 1)}
        >
          <Chevron dir="right" />
        </button>
      </div>
      </div>
    </section>
  );
}
