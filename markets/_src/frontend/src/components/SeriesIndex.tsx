import { useState } from "react";
import {
  SERIES,
  REGIONS,
  REGION_ORDER,
  GROUPS,
  GROUP_ORDER,
  type RegionId,
  type GroupId,
  type SeriesDef,
} from "../series";
import { CONCEPTS } from "../concepts";
import { tone } from "../design";
import { Explain } from "./Explain";

interface Props {
  visible: Record<string, boolean>;
  onToggleSeries: (key: string) => void;
  onToggleMany: (keys: string[]) => void;
  onClearAll: () => void;
}

// The series index. Always present beside (or, in some designs, beneath) the
// chart. Shows what is on the chart, then every series grouped by region or by
// kind. Each row toggles its series; resting on a name explains it, and a
// chevron opens the same explanation in place (for touch and keyboard).
export function SeriesIndex({ visible, onToggleSeries, onToggleMany, onClearAll }: Props) {
  const [openDetail, setOpenDetail] = useState<string | null>(null);

  const shown = SERIES.filter((s) => visible[s.key]);
  const byRegion = false;
  const outerOrder: string[] = byRegion ? REGION_ORDER : GROUP_ORDER;
  const innerOrder: string[] = byRegion ? GROUP_ORDER : REGION_ORDER;
  const outerOf = (s: SeriesDef) => (byRegion ? s.region : s.group);
  const innerOf = (s: SeriesDef) => (byRegion ? s.group : s.region);
  const outerLabel = (id: string) => (byRegion ? REGIONS[id as RegionId].label : GROUPS[id as GroupId].label);
  const innerLabel = (id: string) => (byRegion ? GROUPS[id as GroupId].short : REGIONS[id as RegionId].label);

  const row = (s: SeriesDef) => {
    const on = !!visible[s.key];
    const concept = CONCEPTS[s.concept];
    const open = openDetail === s.key;
    return (
      <li key={s.key} className={"ix-item" + (on ? " on" : "") + (open ? " open" : "")}>
        <div className="ix-row">
          <label className="ix-label">
            <input type="checkbox" className="sr" checked={on} onChange={() => onToggleSeries(s.key)} />
            <span className="ix-key" style={{ ["--c" as string]: tone(s.color) }} aria-hidden="true" />
            <Explain concept={s.concept} className="ix-name">
              {s.label}
            </Explain>
          </label>
          <button
            type="button"
            className="ix-more"
            aria-expanded={open}
            aria-label={`About ${s.label}`}
            onClick={() => setOpenDetail(open ? null : s.key)}
          >
            <svg viewBox="0 0 10 10" width="9" height="9" aria-hidden="true">
              <path d="M3 1.5 6.5 5 3 8.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>
        {open && (
          <div className="ix-detail">
            <span>{concept.short}</span>{" "}
            <a href={concept.url} target="_blank" rel="noreferrer">
              Read more on Wikipedia
            </a>
          </div>
        )}
      </li>
    );
  };

  return (
    <aside className="ix" aria-label="Series">
      <div className="ix-scroll" tabIndex={-1}>
        <div className="ix-bar">
          <span className="ix-count">{shown.length} on chart</span>
          {shown.length > 0 && (
            <button type="button" className="link" onClick={onClearAll}>
              Clear
            </button>
          )}
        </div>

        {outerOrder.map((oid) => {
          const items = SERIES.filter((s) => outerOf(s) === oid);
          if (!items.length) return null;
          const onCount = items.filter((s) => visible[s.key]).length;
          const inners = innerOrder.filter((iid) => items.some((s) => innerOf(s) === iid));
          return (
            <section className="ix-group" key={oid}>
              <button
                type="button"
                className="ix-group-head"
                onClick={() => onToggleMany(items.map((s) => s.key))}
                title={onCount === items.length ? "Hide all in this group" : "Show all in this group"}
              >
                <span className="ix-group-name">{outerLabel(oid)}</span>
                <span className="ix-group-n">
                  {onCount}/{items.length}
                </span>
              </button>
              {inners.map((iid) => (
                <div className="ix-sub" key={iid}>
                  <div className="ix-sub-head">{innerLabel(iid)}</div>
                  <ul>{items.filter((s) => innerOf(s) === iid).map(row)}</ul>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </aside>
  );
}
