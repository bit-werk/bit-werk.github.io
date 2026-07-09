import { EVENTS, POINT_COLOR, type MarketEvent } from "../events";

interface Props {
  index: number | null;
  onSelect: (i: number | null) => void;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const month = (iso: string) => `${MONTHS[+iso.slice(5, 7) - 1]} ${iso.slice(0, 4)}`;
const when = (e: MarketEvent) =>
  e.end ? `${e.date.slice(0, 4)} – ${e.end.slice(0, 4)}` : month(e.date);

// The events reference: step through the curated market events, each focusing
// the chart on its moment and telling its story. (The narrative *course* lives
// in Course.tsx; this panel is the plain event index.)
export function Events({ index, onSelect }: Props) {
  const active = index != null ? EVENTS[index] : null;

  return (
    <section className="narrative events-panel">
      <div className="narr-top">
        <h3>Events</h3>
      </div>

      <div className="narr-nav">
        <button
          type="button"
          className="btn"
          disabled={index == null || index <= 0}
          onClick={() => onSelect((index ?? 0) - 1)}
        >
          ← Prev
        </button>

        <select
          className="narr-select"
          value={index ?? ""}
          onChange={(e) => onSelect(e.target.value === "" ? null : Number(e.target.value))}
        >
          <option value="">Jump to an event…</option>
          {EVENTS.map((e, i) => (
            <option key={e.id} value={i}>
              {when(e)} — {e.title}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="btn"
          disabled={index == null || index >= EVENTS.length - 1}
          onClick={() => onSelect((index ?? -1) + 1)}
        >
          Next →
        </button>
      </div>

      {active ? (
        <article className="narr-card">
          <div className="narr-head">
            <span className="narr-badge" style={{ background: POINT_COLOR[active.type] }}>
              {active.type}
            </span>
            <strong>{active.title}</strong>
            <span className="narr-when">{when(active)}</span>
            <button type="button" className="narr-exit" onClick={() => onSelect(null)}>
              Exit tour
            </button>
          </div>
          <p className="narr-text">{active.text}</p>
          <a href={active.url} target="_blank" rel="noreferrer">
            Read more on Wikipedia →
          </a>
          <div className="narr-count">
            Event {index! + 1} of {EVENTS.length}
          </div>
        </article>
      ) : (
        <p className="narr-intro">
          Step through {EVENTS.length} turning points — booms, bubbles, crashes and
          recoveries. Each one focuses the chart on its moment.{" "}
          <button type="button" className="btn" onClick={() => onSelect(0)}>
            Start the tour →
          </button>
        </p>
      )}
    </section>
  );
}
