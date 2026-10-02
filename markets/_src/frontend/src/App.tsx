import { useEffect, useMemo, useState } from "react";
import type { Dataset, MacroDataset, IndicesDataset, MarketRecord } from "./types";
import { SERIES } from "./series";
import { MarketChart } from "./components/MarketChart";
import { SeriesIndex } from "./components/SeriesIndex";
import { Events } from "./components/Events";
import { ThemeMenu } from "./components/ThemeMenu";
import { applyTheme, DEFAULT_THEME, THEMES } from "./design";
import { Sources } from "./components/Sources";
import { Course } from "./components/Course";
import { EVENTS } from "./events";
import { CHAPTERS } from "./course";

type Tab = "series" | "readout" | "course" | "events" | "sources";
const TABS: { id: Tab; label: string }[] = [
  { id: "series", label: "Series" },
  { id: "readout", label: "Readout" },
  { id: "course", label: "Course" },
  { id: "events", label: "Events" },
  { id: "sources", label: "Sources" },
];

// Pad an ISO date by whole years (keeps month/day), for the focus window.
const shiftYear = (iso: string, years: number) =>
  `${(+iso.slice(0, 4) + years).toString().padStart(4, "0")}${iso.slice(4)}`;

const initialVisible = () =>
  Object.fromEntries(SERIES.map((s) => [s.key, s.default]));

// Nulls for every field that lives outside sp500.json (macro + indices), so all
// records share a consistent shape even where a measure has no data.
const EXTRA: Partial<MarketRecord> = {
  vix: null, fedFunds: null, unemployment: null, population: null, gold: null,
  us2y: null, ch10y: null, jp10y: null, gb10y: null, eu10y: null,
  gdp: null, gdpPerCapita: null, chGdp: null, chGdpPerCapita: null,
  jpGdp: null, jpGdpPerCapita: null, ukGdp: null, ukGdpPerCapita: null,
  euroGdp: null, euroGdpPerCapita: null, worldGdp: null, worldGdpPerCapita: null,
  oil: null, copper: null, inflation: null,
  nasdaq: null, dow: null, russell: null, japanIndex: null, ukIndex: null,
  europeIndex: null, swissIndex: null, worldIndex: null, bitcoin: null,
};

// Merge the S&P 500 series with the macro indicators and the extra stock
// indices / assets by month, then derive year-over-year inflation from CPI (12
// months apart; the series is monthly and consecutive). Each chart series
// filters its own nulls, so the differing coverage of each measure is handled
// automatically.
function mergeData(
  sp: Dataset,
  macro: MacroDataset | null,
  indices: IndicesDataset | null,
): MarketRecord[] {
  const map = new Map<string, MarketRecord>();
  for (const r of sp.data) map.set(r.date, { ...r, ...EXTRA });
  // Copy every field (except date) from a supplementary dataset onto the
  // matching month; extra fields simply widen the record.
  const apply = (rows?: readonly ({ date: string } & Record<string, number | null>)[]) => {
    for (const m of rows ?? []) {
      const e = map.get(m.date);
      if (!e) continue;
      const rec = e as unknown as Record<string, number | null>;
      for (const k in m) if (k !== "date") rec[k] = m[k];
    }
  };
  apply(macro?.data);
  apply(indices?.data);
  const arr = [...map.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
  for (let i = 12; i < arr.length; i++) {
    const cur = arr[i].cpi;
    const prev = arr[i - 12].cpi;
    if (cur != null && prev != null && prev !== 0) {
      arr[i].inflation = Math.round((cur / prev - 1) * 1000) / 10;
    }
  }
  return arr;
}

const loadTheme = () => {
  try {
    const t = localStorage.getItem("mc-theme");
    if (t && THEMES.some((x) => x.id === t)) return t;
  } catch {
    /* storage unavailable */
  }
  return DEFAULT_THEME;
};

export function App() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [records, setRecords] = useState<MarketRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<"log" | "linear">("log");
  const [visible, setVisible] = useState<Record<string, boolean>>(initialVisible);
  const [storyIndex, setStoryIndex] = useState<number | null>(null);
  const [annotationsOn, setAnnotationsOn] = useState(true);
  const [selectionActive, setSelectionActive] = useState(false);
  const [yAxisMode, setYAxisMode] = useState<"fit" | "manual">("fit");
  const [manualRange, setManualRange] = useState<[number, number] | null>(null);
  const [chapterIndex, setChapterIndex] = useState<number | null>(null);
  // Narrow screens show one section at a time beneath the chart.
  const [tab, setTab] = useState<Tab>("series");
  const [lowerTab, setLowerTab] = useState<"course" | "events">("course");
  const [theme, setTheme] = useState(loadTheme);
  // Installed during render so every child (and the canvas tokens) sees the new
  // palette on the very pass that follows the switch. It is idempotent.
  applyTheme(theme);
  const chooseTheme = (id: string) => {
    setTheme(id);
    try {
      localStorage.setItem("mc-theme", id);
    } catch {
      /* ignore */
    }
  };
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [indexOpen, setIndexOpen] = useState(() => {
    try {
      return localStorage.getItem("mc-index") !== "0";
    } catch {
      return true;
    }
  });
  const toggleIndex = () =>
    setIndexOpen((v) => {
      try {
        localStorage.setItem("mc-index", v ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !v;
    });

  // Switching to manual: seed the range from the visible price-axis series so
  // the user has a sensible starting point to edit.
  const setYMode = (m: "fit" | "manual") => {
    if (m === "manual" && records) {
      let lo = Infinity;
      let hi = -Infinity;
      for (const r of records) {
        for (const s of SERIES) {
          if (s.axis !== "price" || !visible[s.key]) continue;
          const v = r[s.field] as number | null;
          if (v != null) {
            if (v < lo) lo = v;
            if (v > hi) hi = v;
          }
        }
      }
      if (!Number.isFinite(lo)) {
        lo = 0;
        hi = 100;
      }
      setManualRange([Math.floor(lo), Math.ceil(hi)]);
    }
    setYAxisMode(m);
  };

  // Selecting a course chapter drives the chart: show exactly its series, set
  // its scale/zoom, and highlight the event it covers (in the Events panel and
  // on the chart).
  const selectChapter = (i: number | null) => {
    setChapterIndex(i);
    setLowerTab("course");
    if (i == null) return;
    const ch = CHAPTERS[i];
    setVisible(Object.fromEntries(SERIES.map((s) => [s.key, ch.series.includes(s.key)])));
    if (ch.scale) setScale(ch.scale);
    const ev = ch.eventId ? EVENTS.findIndex((e) => e.id === ch.eventId) : -1;
    setStoryIndex(ev >= 0 ? ev : null);
  };

  // Picking an individual event leaves any active course chapter (the two share
  // the chart's focus, and a direct event pick should win).
  const selectEvent = (i: number | null) => {
    setChapterIndex(null);
    setStoryIndex(i);
    if (i != null) setLowerTab("events");
  };

  // Where to zoom the chart. A course chapter takes priority; otherwise the
  // selected event; nothing while a measurement period is active.
  const focus = useMemo((): [string, string] | null => {
    if (selectionActive) return null;
    if (chapterIndex != null) return CHAPTERS[chapterIndex].focus ?? null;
    if (storyIndex == null) return null;
    const e = EVENTS[storyIndex];
    // ~10 years of context before the start and after the end, for the big picture
    return [shiftYear(e.date, -10), shiftYear(e.end ?? e.date, 10)];
  }, [chapterIndex, storyIndex, selectionActive]);

  useEffect(() => {
    const getJson = (url: string) =>
      fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))));
    Promise.all([
      getJson("./data/sp500.json"),
      getJson("./data/macro.json").catch(() => null), // macro is optional
      getJson("./data/indices.json").catch(() => null), // indices optional
    ])
      .then(([sp, macro, indices]: [Dataset, MacroDataset | null, IndicesDataset | null]) => {
        setDataset(sp);
        setRecords(mergeData(sp, macro, indices));
      })
      .catch((e) => setError(String(e)));
  }, []);

  const toggleSeries = (key: string) => setVisible((v) => ({ ...v, [key]: !v[key] }));
  // Toggle a whole box: if every key is on, turn them all off, else turn all on.
  const toggleMany = (keys: string[]) => {
    const allOn = keys.every((k) => visible[k]);
    setVisible((v) => {
      const nv = { ...v };
      for (const k of keys) nv[k] = !allOn;
      return nv;
    });
  };
  const clearAll = () =>
    setVisible((v) => {
      const nv = { ...v };
      for (const s of SERIES) nv[s.key] = false;
      return nv;
    });

  const meta = dataset?.meta;

  return (
    <div className="page">
      <div className="sheet" data-tab={tab} data-lower={lowerTab} data-index={indexOpen ? "open" : "closed"}>
        <div className="workspace">
        <header className="mast">
          <h1>Market Cycles</h1>
          <p className="slogan">Market history since 1871, read against the economy that moved it.</p>
          <div className="mast-right">
            <ThemeMenu value={theme} onChange={chooseTheme} />
            {dataset && (
              <button type="button" className="link mast-sources" onClick={() => setSourcesOpen(true)}>
                Sources
              </button>
            )}
          </div>
        </header>

        {error && (
          <div className="notice error">
            Could not load data ({error}). Run the pipeline, then <code>npm run dev</code> (it copies{" "}
            <code>data/sp500.json</code> in).
          </div>
        )}

        {!dataset && !error && <div className="notice">Loading 150 years of data…</div>}

        {dataset && records && (
          <>
            <SeriesIndex
              visible={visible}
              onToggleSeries={toggleSeries}
              onToggleMany={toggleMany}
              onClearAll={clearAll}
            />

            <MarketChart
              data={records}
              scale={scale}
              onScale={setScale}
              visible={visible}
              onToggleSeries={toggleSeries}
              annotationsOn={annotationsOn}
              onToggleAnnotations={() => setAnnotationsOn((v) => !v)}
              yAxisMode={yAxisMode}
              onSetYAxisMode={setYMode}
              manualRange={manualRange}
              onSetManualRange={setManualRange}
              focus={focus}
              activeEventIndex={storyIndex}
              onSelectEvent={selectEvent}
              onSelectionActiveChange={setSelectionActive}
              theme={theme}
              indexOpen={indexOpen}
              onToggleIndex={toggleIndex}
            />
            </>
          )}
        </div>

        {dataset && records && (
          <>
            <nav className="tabs" role="tablist" aria-label="Sections">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  className={tab === t.id ? "active" : ""}
                  onClick={() => (t.id === "sources" ? setSourcesOpen(true) : setTab(t.id))}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="lower panel-scroll">
              <Course index={chapterIndex} onSelect={selectChapter} />
              <Events index={storyIndex} onSelect={selectEvent} />
              <div className="lower-tabs" role="tablist" aria-label="Reading panels">
                {(["course", "events"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={lowerTab === t}
                    className={lowerTab === t ? "active" : ""}
                    onClick={() => setLowerTab(t)}
                  >
                    {t === "course" ? "Market Cycles & Macroeconomics" : "Events"}
                  </button>
                ))}
              </div>
            </div>

            {sourcesOpen && (
              <Sources
                source={meta!.source}
                sourceUrl={meta!.sourceUrl}
                license={meta!.license}
                onClose={() => setSourcesOpen(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
