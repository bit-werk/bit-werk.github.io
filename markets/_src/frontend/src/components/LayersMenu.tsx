import { useState } from "react";
import {
  SERIES,
  REGIONS,
  REGION_ORDER,
  GROUPS,
  GROUP_ORDER,
  type RegionId,
  type GroupId,
} from "../series";
import { InfoButton } from "./InfoButton";

interface Props {
  visible: Record<string, boolean>;
  onToggleSeries: (key: string) => void;
  onToggleMany: (keys: string[]) => void;
  onClearAll: () => void;
}

type GroupBy = "region" | "type";

// Collapsible left-hand menu of toggleable series.
//   • A pinned "Shown" section at the top mirrors everything currently on the
//     chart as removable chips, so active series are visible together at a glance.
//   • The catalog below is boxes-in-boxes: outer boxes by region or by subject
//     type (switchable), inner sub-groups by the other dimension. Checked rows
//     are highlighted; unchecked rows are muted. Row order is stable.
export function LayersMenu({ visible, onToggleSeries, onToggleMany, onClearAll }: Props) {
  const [open, setOpen] = useState(true);
  const [groupBy, setGroupBy] = useState<GroupBy>("region");

  if (!open) {
    return (
      <aside className="layers collapsed">
        <button type="button" className="layers-toggle" onClick={() => setOpen(true)} title="Show series menu">
          ☰ Series
        </button>
      </aside>
    );
  }

  const shown = SERIES.filter((s) => visible[s.key]);

  // Which dimension is the outer box vs. the inner sub-group.
  const byRegion = groupBy === "region";
  const outerOrder: string[] = byRegion ? REGION_ORDER : GROUP_ORDER;
  const innerOrder: string[] = byRegion ? GROUP_ORDER : REGION_ORDER;
  const outerOf = (s: (typeof SERIES)[number]) => (byRegion ? s.region : s.group);
  const innerOf = (s: (typeof SERIES)[number]) => (byRegion ? s.group : s.region);
  const outerMeta = (id: string) =>
    byRegion ? REGIONS[id as RegionId] : GROUPS[id as GroupId];
  // Inner header: subject uses its short tag; region uses its full label.
  const innerMeta = (id: string) =>
    byRegion
      ? { label: GROUPS[id as GroupId].short, color: GROUPS[id as GroupId].color }
      : { label: REGIONS[id as RegionId].label, color: REGIONS[id as RegionId].color };

  return (
    <aside className="layers">
      <button type="button" className="layers-toggle wide" onClick={() => setOpen(false)} title="Hide menu">
        ◂ Series
      </button>

      <div className="groupby">
        <span>Group by</span>
        <span className="segmented small">
          <button type="button" className={byRegion ? "active" : ""} onClick={() => setGroupBy("region")}>
            Region
          </button>
          <button type="button" className={!byRegion ? "active" : ""} onClick={() => setGroupBy("type")}>
            Type
          </button>
        </span>
      </div>

      {shown.length > 0 && (
        <fieldset className="layer-box shown-box">
          <legend>
            <span className="lg-title">Shown</span>
            <span className="lg-count">· {shown.length}</span>
            <button type="button" className="clear-all" onClick={onClearAll}>
              clear all
            </button>
          </legend>
          <div className="chips">
            {shown.map((s) => (
              <button
                key={s.key}
                type="button"
                className="chip"
                onClick={() => onToggleSeries(s.key)}
                title={"Remove " + s.label}
              >
                <span className="chip-dot" style={{ background: s.color }} />
                <span className="chip-label">{s.label}</span>
                <span className="chip-x">✕</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {outerOrder.map((oid) => {
        const items = SERIES.filter((s) => outerOf(s) === oid);
        if (!items.length) return null;
        const onCount = items.filter((s) => visible[s.key]).length;
        const all = onCount === items.length;
        const some = onCount > 0 && !all;
        const om = outerMeta(oid);
        const inners = innerOrder.filter((iid) => items.some((s) => innerOf(s) === iid));
        return (
          <fieldset className="layer-box" key={oid} style={{ borderTopColor: om.color }}>
            <legend>
              <input
                type="checkbox"
                checked={all}
                ref={(el) => {
                  if (el) el.indeterminate = some;
                }}
                onChange={() => onToggleMany(items.map((s) => s.key))}
                title="Toggle all in this box"
              />
              <span className="lg-title" style={{ color: om.color }}>
                {om.label}
              </span>
              <span className="lg-count">
                {onCount}/{items.length}
              </span>
            </legend>

            {inners.map((iid) => {
              const im = innerMeta(iid);
              const its = items.filter((s) => innerOf(s) === iid);
              return (
                <div className="subject-sub" key={iid}>
                  <div className="subject-head" style={{ color: im.color }}>
                    <span className="subject-dot" style={{ background: im.color }} />
                    {im.label}
                  </div>
                  {its.map((s) => {
                    const on = !!visible[s.key];
                    return (
                      <label
                        key={s.key}
                        className={"layer-item" + (on ? " on" : "")}
                        style={on ? { borderLeftColor: s.color } : undefined}
                      >
                        <input type="checkbox" checked={on} onChange={() => onToggleSeries(s.key)} />
                        <span className="swatch" style={{ background: s.color }} />
                        <span className="series-label">{s.label}</span>
                        <InfoButton concept={s.concept} />
                      </label>
                    );
                  })}
                </div>
              );
            })}
          </fieldset>
        );
      })}
    </aside>
  );
}
