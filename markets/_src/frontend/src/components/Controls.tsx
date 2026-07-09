import { SERIES, GROUPS, GROUP_ORDER } from "../series";
import { InfoButton } from "./InfoButton";

type Scale = "log" | "linear";

interface Props {
  scale: Scale;
  onScale: (s: Scale) => void;
  visible: Record<string, boolean>;
  onToggleSeries: (key: string) => void;
}

// The control bar: series grouped by subject (each group colour-coded, each
// series with its own ⓘ), plus the price-axis log/linear switch.
export function Controls({ scale, onScale, visible, onToggleSeries }: Props) {
  return (
    <div className="controls">
      {GROUP_ORDER.map((gid) => {
        const group = GROUPS[gid];
        const items = SERIES.filter((s) => s.group === gid);
        return (
          <fieldset
            key={gid}
            className="control-group series-group"
            style={{ borderTopColor: group.color }}
          >
            <legend style={{ color: group.color }}>{group.label}</legend>
            {items.map((s) => (
              <label key={s.key} className="series-toggle">
                <input
                  type="checkbox"
                  checked={!!visible[s.key]}
                  onChange={() => onToggleSeries(s.key)}
                />
                <span className="swatch" style={{ background: s.color }} />
                <span className="series-label">{s.label}</span>
                <span
                  className={"axis-tag " + (s.axis === "price" ? "axis-l" : "axis-r")}
                  title={s.axis === "price" ? "Left axis" : "Right axis"}
                >
                  {s.axis === "price" ? "L" : "R"}
                </span>
                <InfoButton concept={s.concept} />
              </label>
            ))}
          </fieldset>
        );
      })}

      <fieldset className="control-group">
        <legend>
          Price scale <InfoButton concept="log-scale" />
        </legend>
        <div className="segmented">
          <button
            type="button"
            className={scale === "log" ? "active" : ""}
            onClick={() => onScale("log")}
          >
            Logarithmic
          </button>
          <button
            type="button"
            className={scale === "linear" ? "active" : ""}
            onClick={() => onScale("linear")}
          >
            Linear
          </button>
        </div>
      </fieldset>
    </div>
  );
}
