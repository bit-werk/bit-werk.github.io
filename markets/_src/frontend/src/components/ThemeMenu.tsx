import { useEffect, useRef, useState } from "react";
import { THEMES, type Theme } from "../design";

interface Props {
  value: string;
  onChange: (id: string) => void;
}

// Each entry previews its theme: its own ground, ink, accent and type.
function Swatch({ t }: { t: Theme }) {
  return (
    <span className="th-prev" style={{ background: t.bg, color: t.ink, borderColor: t.accent, fontFamily: t.read }}>
      <span className="th-aa" style={{ color: t.accent, fontFamily: t.tech }}>
        Aa
      </span>
      <span className="th-name">{t.label}</span>
      <span className="th-chips" aria-hidden="true">
        <i style={{ background: t.plot, borderColor: t.faint }} />
        <i style={{ background: t.accent }} />
        <i style={{ background: t.up }} />
        <i style={{ background: t.down }} />
      </span>
    </span>
  );
}

export function ThemeMenu({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cur = THEMES.find((t) => t.id === value) ?? THEMES[0];

  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  return (
    <div className="theme-menu" ref={ref}>
      <button
        type="button"
        className="th-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Theme: ${cur.label}`}
        onClick={() => setOpen((o) => !o)}
      >
        Theme
        <span className="th-caret" aria-hidden="true" />
      </button>
      {open && (
        <ul className="th-list" role="listbox" aria-label="Theme">
          {THEMES.map((t) => (
            <li key={t.id} role="option" aria-selected={t.id === value}>
              <button
                type="button"
                className={"th-opt" + (t.id === value ? " on" : "")}
                onClick={() => {
                  onChange(t.id);
                  setOpen(false);
                }}
              >
                <Swatch t={t} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
