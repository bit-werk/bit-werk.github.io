import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import type { MarketRecord } from "../types";
import { SERIES, type SeriesDef } from "../series";
import { EVENTS, POINT_COLOR, AREA_FILL, AREA_FILL_STRONG } from "../events";
import { InfoButton } from "./InfoButton";

interface Props {
  data: MarketRecord[];
  scale: "log" | "linear";
  onScale: (s: "log" | "linear") => void;
  visible: Record<string, boolean>;
  onToggleSeries: (key: string) => void;
  annotationsOn: boolean;
  onToggleAnnotations: () => void;
  yAxisMode: "fit" | "manual";
  onSetYAxisMode: (m: "fit" | "manual") => void;
  manualRange: [number, number] | null;
  onSetManualRange: (r: [number, number]) => void;
  /** [startISO, endISO] to zoom to (narrative focus), or null. */
  focus: [string, string] | null;
  /** Currently selected narrative event (saturated on chart), or null. */
  activeEventIndex: number | null;
  /** Called when an event is picked on the chart (label / line / band). */
  onSelectEvent: (index: number) => void;
  /** Notifies parent whether a measurement period is active (suppresses focus). */
  onSelectionActiveChange: (active: boolean) => void;
}

interface Selection {
  seriesKey: string;
  seriesLabel: string;
  color: string;
  isDrag: boolean; // true = user-dragged period; false = whole visible window
  t0: number;
  t1: number;
  startDate: string;
  endDate: string;
  startVal: number;
  endVal: number;
  diff: number;
  pct: number;
  years: number;
  cagr: number | null;
}

type Drag =
  | { mode: "create"; startX: number; startT: number; pending: string | null }
  | { mode: "resize"; startX: number; fixedT: number };

const GRID = { top: 104, bottom: 80, left: 64 };
const RIGHT_WIDE = 64;
const RIGHT_NARROW = 24;
const EDGE_PX = 6;
const YEAR_MS = 365.25 * 864e5;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthLabel = (iso: string) => `${MONTHS[+iso.slice(5, 7) - 1]} ${iso.slice(0, 4)}`;
const fmt = (n: number, d = 2) =>
  n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
const signed = (n: number, d = 2) => (n >= 0 ? "+" : "") + fmt(n, d);

export function MarketChart({
  data,
  scale,
  onScale,
  visible,
  onToggleSeries,
  annotationsOn,
  onToggleAnnotations,
  yAxisMode,
  onSetYAxisMode,
  manualRange,
  onSetManualRange,
  focus,
  activeEventIndex,
  onSelectEvent,
  onSelectionActiveChange,
}: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [, setViewTick] = useState(0); // bumps to reposition axis boxes on zoom/resize
  const bump = () => setViewTick((v) => v + 1);

  // refs so init-once handlers always see current props
  const dataRef = useRef<MarketRecord[]>(data);
  const timesRef = useRef<number[]>([]);
  const visibleRef = useRef(visible);
  const rightMarginRef = useRef(RIGHT_NARROW);
  const activeSeriesRef = useRef<string | null>(null);
  const selRangeRef = useRef<{ t0: number; t1: number } | null>(null);
  const bandRef = useRef<echarts.graphic.Rect | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const prevYModeRef = useRef(yAxisMode);
  const animTimerRef = useRef<number | null>(null);
  const onSelectEventRef = useRef(onSelectEvent);
  const annotationsOnRef = useRef(annotationsOn);
  dataRef.current = data;
  visibleRef.current = visible;
  onSelectEventRef.current = onSelectEvent;
  annotationsOnRef.current = annotationsOn;

  const redrawRef = useRef<() => void>(() => {});
  const clearBandRef = useRef<() => void>(() => {});
  const recomputeRef = useRef<() => void>(() => {});

  const visibleSeries = () => SERIES.filter((s) => visibleRef.current[s.key]);

  const valueAt = (def: SeriesDef, t: number): number | null => {
    const times = timesRef.current;
    if (!times.length) return null;
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < times.length; i++) {
      const d = Math.abs(times[i] - t);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return (dataRef.current[best][def.field] as number | null) ?? null;
  };

  // Compute stats for a time range against the active series. Used live while
  // dragging and on release, so the RHS box updates in real time.
  const buildSelection = (t0: number, t1: number): Selection | null => {
    let key = activeSeriesRef.current;
    if (!key || !visibleRef.current[key]) key = visibleSeries()[0]?.key;
    const def = SERIES.find((s) => s.key === key);
    if (!def) return null;
    const pts = dataRef.current
      .map((r) => ({ t: Date.parse(r.date), date: r.date, v: r[def.field] as number | null }))
      .filter((p) => p.v != null && p.t >= t0 && p.t <= t1) as {
      t: number;
      date: string;
      v: number;
    }[];
    if (!pts.length) return null;
    const a = pts[0];
    const b = pts[pts.length - 1];
    const years = (b.t - a.t) / (365.25 * 864e5);
    const cagr = a.v > 0 && years >= 0.08 ? (Math.pow(b.v / a.v, 1 / years) - 1) * 100 : null;
    return {
      seriesKey: def.key,
      seriesLabel: def.label,
      color: def.color,
      isDrag: false,
      t0,
      t1,
      startDate: a.date,
      endDate: b.date,
      startVal: a.v,
      endVal: b.v,
      diff: b.v - a.v,
      pct: a.v ? ((b.v - a.v) / a.v) * 100 : 0,
      years,
      cagr,
    };
  };

  const commitSelection = (t0: number, t1: number, isDrag: boolean) => {
    const s = buildSelection(t0, t1);
    if (s) s.isDrag = isDrag;
    setSelection(s);
  };

  useEffect(() => {
    if (!elRef.current) return;
    const chart = echarts.init(elRef.current);
    chartRef.current = chart;
    const zr = chart.getZr();

    chart.setOption({
      // updates are instant by default; the fit/full toggle temporarily bumps
      // animationDurationUpdate so that axis re-scale animates smoothly.
      animation: true,
      animationDuration: 0,
      animationDurationUpdate: 0,
      animationEasingUpdate: "cubicInOut",
      legend: { show: false },
      tooltip: {
        trigger: "axis",
        valueFormatter: (v: number | null) =>
          v == null ? "—" : Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 }),
      },
      grid: { left: GRID.left, right: RIGHT_NARROW, top: GRID.top, bottom: GRID.bottom },
      xAxis: {
        type: "time",
        minInterval: YEAR_MS,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "rgba(0,0,0,0.3)" } },
        axisLabel: {
          hideOverlap: true,
          color: "rgba(0,0,0,0.62)",
          fontSize: 10,
          formatter: (val: number) => `${new Date(val).getFullYear()}`,
        },
      },
      yAxis: [
        { type: "value", scale: true, axisLabel: { formatter: (v: number) => Number(v).toLocaleString() } },
        { type: "value", scale: true, position: "right", show: false, splitLine: { show: false } },
        // hidden 0..1 axis that pins the event-label scatter to the top
        { type: "value", min: 0, max: 1, show: false },
      ],
      dataZoom: [
        { type: "inside", filterMode: "filter", moveOnMouseMove: false, moveOnMouseWheel: true, zoomOnMouseWheel: "ctrl" },
        { type: "slider", filterMode: "filter", bottom: 24, height: 28 },
      ],
      series: [],
    });

    // ---- selection band (pixel space) ----
    const bounds = () => ({
      top: GRID.top,
      bottom: chart.getHeight() - GRID.bottom,
      left: GRID.left,
      right: chart.getWidth() - rightMarginRef.current,
    });
    const inGridY = (y: number) => {
      const b = bounds();
      return y >= b.top && y <= b.bottom;
    };
    const inGrid = (x: number, y: number) => {
      const b = bounds();
      return x >= b.left && x <= b.right && y >= b.top && y <= b.bottom;
    };
    const band = () => {
      if (!bandRef.current) {
        bandRef.current = new echarts.graphic.Rect({
          silent: true,
          z: 100,
          ignore: true,
          style: { fill: "rgba(37,99,235,0.10)", stroke: "rgba(37,99,235,0.5)", lineWidth: 1 },
          shape: { x: 0, y: 0, width: 0, height: 0 },
        });
        zr.add(bandRef.current);
      }
      return bandRef.current;
    };
    const drawPixels = (xa: number, xb: number) => {
      const b = bounds();
      const left = Math.max(Math.min(xa, xb), b.left);
      const right = Math.min(Math.max(xa, xb), b.right);
      const r = band();
      r.setShape({ x: left, y: b.top, width: Math.max(0, right - left), height: b.bottom - b.top });
      r.ignore = false;
      zr.refresh();
    };
    const redrawFromTime = () => {
      const r = selRangeRef.current;
      if (!r) return;
      try {
        drawPixels(
          chart.convertToPixel({ xAxisIndex: 0 }, r.t0) as number,
          chart.convertToPixel({ xAxisIndex: 0 }, r.t1) as number,
        );
      } catch {
        /* axis not ready */
      }
    };
    const clearBand = () => {
      selRangeRef.current = null;
      if (bandRef.current) {
        bandRef.current.ignore = true;
        zr.refresh();
      }
    };
    redrawRef.current = redrawFromTime;
    clearBandRef.current = clearBand;

    const currentWindow = (): [number, number] => {
      try {
        return [
          chart.convertFromPixel({ xAxisIndex: 0 }, GRID.left) as number,
          chart.convertFromPixel({ xAxisIndex: 0 }, chart.getWidth() - rightMarginRef.current) as number,
        ];
      } catch {
        const d = dataRef.current;
        return [Date.parse(d[0].date), Date.parse(d[d.length - 1].date)];
      }
    };
    // which line (if any) is right under the cursor — null if not close to one
    const lineAt = (y: number, t: number): string | null => {
      let best: string | null = null;
      let bestDy = Infinity;
      for (const s of visibleSeries()) {
        const v = valueAt(s, t);
        if (v == null) continue;
        let py: number;
        try {
          py = chart.convertToPixel({ yAxisIndex: s.axis === "secondary" ? 1 : 0 }, v) as number;
        } catch {
          continue;
        }
        const dy = Math.abs(py - y);
        if (dy < bestDy) {
          bestDy = dy;
          best = s.key;
        }
      }
      return bestDy <= 30 ? best : null;
    };
    // Refresh the panel: a dragged sub-period (band shown) if one exists,
    // otherwise the active series over the whole visible window (no band).
    const recompute = () => {
      if (selRangeRef.current) {
        redrawFromTime();
        commitSelection(selRangeRef.current.t0, selRangeRef.current.t1, true);
      } else {
        clearBand();
        const [a, b] = currentWindow();
        commitSelection(a, b, false);
      }
    };
    recomputeRef.current = recompute;

    const edgePixels = (): [number, number] | null => {
      const r = selRangeRef.current;
      if (!r) return null;
      try {
        return [
          chart.convertToPixel({ xAxisIndex: 0 }, r.t0) as number,
          chart.convertToPixel({ xAxisIndex: 0 }, r.t1) as number,
        ];
      } catch {
        return null;
      }
    };

    const detectSeries = (y: number, t: number) => {
      let best: string | null = null;
      let bestDy = Infinity;
      for (const s of visibleSeries()) {
        const v = valueAt(s, t);
        if (v == null) continue;
        let py: number;
        try {
          py = chart.convertToPixel({ yAxisIndex: s.axis === "secondary" ? 1 : 0 }, v) as number;
        } catch {
          continue;
        }
        const dy = Math.abs(py - y);
        if (dy < bestDy) {
          bestDy = dy;
          best = s.key;
        }
      }
      return best && bestDy < 40 ? best : (visibleSeries()[0]?.key ?? null);
    };

    // hit-test a click against event lines (points) and bands (periods)
    const eventHitTest = (x: number, t: number) => {
      if (!annotationsOnRef.current) return -1;
      for (let i = 0; i < EVENTS.length; i++) {
        const e = EVENTS[i];
        const s = Date.parse(e.date);
        if (e.end) {
          if (t >= s && t <= Date.parse(e.end)) return i;
        } else {
          try {
            if (Math.abs((chart.convertToPixel({ xAxisIndex: 0 }, s) as number) - x) < EDGE_PX) return i;
          } catch {
            /* skip */
          }
        }
      }
      return -1;
    };

    zr.on("mousedown", (e) => {
      const x = e.offsetX;
      const y = e.offsetY;
      const ep = edgePixels();
      // grab an edge to resize the existing period
      if (selRangeRef.current && ep && inGridY(y)) {
        if (Math.abs(x - ep[0]) <= EDGE_PX) {
          dragRef.current = { mode: "resize", startX: x, fixedT: selRangeRef.current.t1 };
          return;
        }
        if (Math.abs(x - ep[1]) <= EDGE_PX) {
          dragRef.current = { mode: "resize", startX: x, fixedT: selRangeRef.current.t0 };
          return;
        }
      }
      if (!inGrid(x, y)) {
        dragRef.current = null;
        return;
      }
      let t: number;
      try {
        t = chart.convertFromPixel({ xAxisIndex: 0 }, x) as number;
      } catch {
        return;
      }
      dragRef.current = { mode: "create", startX: x, startT: t, pending: detectSeries(y, t) };
    });

    zr.on("mousemove", (e) => {
      const d = dragRef.current;
      if (d) {
        let ct: number;
        try {
          ct = chart.convertFromPixel({ xAxisIndex: 0 }, e.offsetX) as number;
        } catch {
          return;
        }
        if (d.mode === "create") activeSeriesRef.current = d.pending;
        const anchor = d.mode === "create" ? d.startT : d.fixedT;
        const t0 = Math.min(anchor, ct);
        const t1 = Math.max(anchor, ct);
        selRangeRef.current = { t0, t1 };
        redrawFromTime();
        commitSelection(t0, t1, true); // real-time
        return;
      }
      // hover: edge cursor
      const ep = edgePixels();
      const near =
        !!selRangeRef.current &&
        ep &&
        inGridY(e.offsetY) &&
        (Math.abs(e.offsetX - ep[0]) <= EDGE_PX || Math.abs(e.offsetX - ep[1]) <= EDGE_PX);
      if (elRef.current) elRef.current.style.cursor = near ? "ew-resize" : "";
    });

    zr.on("mouseup", (e) => {
      const d = dragRef.current;
      dragRef.current = null;
      if (!d) return;
      if (d.mode === "create" && Math.abs(e.offsetX - d.startX) < 5) {
        // a plain click: on an event → narrative; on a line → select that
        // series for the whole visible window; on empty → clear any drag.
        let t: number | null = null;
        try {
          t = chart.convertFromPixel({ xAxisIndex: 0 }, e.offsetX) as number;
        } catch {
          /* ignore */
        }
        if (t != null) {
          const hit = eventHitTest(e.offsetX, t);
          if (hit >= 0) {
            onSelectEventRef.current(hit);
            return;
          }
          const key = lineAt(e.offsetY, t);
          if (key) activeSeriesRef.current = key;
        }
        selRangeRef.current = null;
        clearBand();
        recompute();
      }
      // a real drag is already finalized via the last mousemove
    });

    zr.on("globalout", () => {
      dragRef.current = null;
      if (elRef.current) elRef.current.style.cursor = "";
    });

    chart.on("datazoom", () => {
      redrawFromTime();
      bump(); // reposition axis boxes
      if (!selRangeRef.current) recompute(); // default view follows the window
    });
    chart.on("click", (p: any) => {
      if (p.componentType === "series" && p.seriesId === "events") {
        onSelectEventRef.current(p.dataIndex);
      }
    });

    const ro = new ResizeObserver(() => {
      chart.resize();
      redrawFromTime();
      bump();
    });
    ro.observe(elRef.current);
    return () => {
      ro.disconnect();
      chart.dispose();
      chartRef.current = null;
      bandRef.current = null;
    };
  }, []);

  // patch series + scale + annotations WITHOUT resetting dataZoom/selection
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    timesRef.current = data.map((r) => Date.parse(r.date));
    const secondaryVisible = SERIES.some((s) => s.axis === "secondary" && visible[s.key]);
    rightMarginRef.current = secondaryVisible ? RIGHT_WIDE : RIGHT_NARROW;

    const series: any[] = SERIES.filter((s) => visible[s.key]).map((s) => ({
      id: s.key,
      name: s.label,
      type: "line" as const,
      yAxisIndex: s.axis === "secondary" ? 1 : 0,
      showSymbol: false,
      lineStyle: { width: 1.5 },
      color: s.color,
      data: data
        .map((r) => [r.date, r[s.field] as number | null])
        .filter((p) => p[1] != null),
    }));

    if (data.length) {
      const firstYear = new Date(data[0].date).getFullYear();
      const lastYear = new Date(data[data.length - 1].date).getFullYear();

      // Dense yearly anchors so the carrier's markLine/markArea keep rendering
      // even under filterMode 'filter' (which clips series data to the window).
      const carrierData: [string, number][] = [];
      for (let y = firstYear; y <= lastYear; y++) carrierData.push([`${y}-01-01`, 0]);
      // (The timeline year numbers are the native x-axis labels, configured above.)

      // Events carrier — point lines + period bands (labels live on the scatter).
      const lineData: any[] = [];
      const areaData: any[] = [];
      if (annotationsOn) {
        EVENTS.forEach((e, i) => {
          const active = i === activeEventIndex;
          const c = POINT_COLOR[e.type];
          if (e.end) {
            const fill = active
              ? AREA_FILL_STRONG[e.type] ?? "rgba(0,0,0,0.12)"
              : AREA_FILL[e.type] ?? "rgba(0,0,0,0.04)";
            areaData.push([
              {
                xAxis: e.date,
                itemStyle: { color: fill },
                emphasis: { itemStyle: { color: AREA_FILL_STRONG[e.type] ?? "rgba(0,0,0,0.12)" } },
              },
              { xAxis: e.end },
            ]);
          } else {
            lineData.push({
              xAxis: e.date,
              lineStyle: { color: c, width: active ? 2 : 1.4, type: "dashed", opacity: active ? 1 : 0.22 },
              emphasis: { lineStyle: { opacity: 1, width: 2 } },
            });
          }
        });
      }
      series.push({
        id: "annotations",
        type: "line",
        xAxisIndex: 0,
        yAxisIndex: 2,
        z: 2,
        silent: true,
        symbol: "none",
        tooltip: { show: false },
        lineStyle: { opacity: 0 },
        data: carrierData,
        markLine: { silent: false, symbol: "none", label: { show: false }, data: lineData },
        markArea: { silent: false, label: { show: false }, data: areaData },
      });

      // event labels: angled "name  date", clickable, deterministically
      // staggered into lanes so neighbours never share a height (scatter on the
      // hidden top axis).
      if (annotationsOn) {
        const LANES = 4;
        const LANE_PX = 18;
        const laneLast = new Array<number>(LANES).fill(-Infinity);
        const laneOf = EVENTS.map((e) => {
          const t = Date.parse(e.date);
          let li = 0;
          for (let k = 1; k < LANES; k++) if (laneLast[k] < laneLast[li]) li = k;
          laneLast[li] = t;
          return li;
        });
        const labelText = (e: (typeof EVENTS)[number]) =>
          `${e.tag}  ${e.end ? `${e.date.slice(0, 4)}–${e.end.slice(0, 4)}` : monthLabel(e.date)}`;

        series.push({
          id: "events",
          type: "scatter",
          xAxisIndex: 0,
          yAxisIndex: 2,
          z: 20,
          symbolSize: 7,
          tooltip: { show: false },
          labelLayout: { hideOverlap: false },
          label: { show: true, position: "top", rotate: 40, align: "left", fontSize: 10 },
          emphasis: {
            itemStyle: { opacity: 1 },
            label: {
              opacity: 1,
              fontWeight: "bold",
              backgroundColor: "#fff",
              borderColor: "rgba(0,0,0,0.2)",
              borderWidth: 1,
              borderRadius: 4,
              padding: [2, 5],
            },
          },
          data: EVENTS.map((e, i) => {
            const active = i === activeEventIndex;
            const c = POINT_COLOR[e.type];
            return {
              value: [e.date, 1],
              itemStyle: { color: c, opacity: active ? 1 : 0.45 },
              label: {
                formatter: labelText(e),
                color: c,
                opacity: active ? 1 : 0.6,
                fontWeight: active ? "bold" : "normal",
                offset: [0, -laneOf[i] * LANE_PX],
                // white "speech-bubble" behind the active label for readability
                ...(active
                  ? { backgroundColor: "#fff", borderColor: c, borderWidth: 1, borderRadius: 4, padding: [2, 5] }
                  : {}),
              },
            };
          }),
        });
      }
    }

    // y-axis (price/left): "fit" auto-scales to the visible window with a little
    // head/foot room; "manual" uses the user's explicit min/max override.
    const manual = yAxisMode === "manual" && manualRange != null;
    const isLog = scale === "log";
    type Ext = { min: number; max: number };
    const ok = (...vs: number[]) => vs.every(Number.isFinite);
    const padLo = (frac: number) => ({ min, max }: Ext) =>
      !ok(min, max) ? undefined : isLog ? min / (1 + frac) : min - (max - min) * frac;
    const padHi = (frac: number) => ({ min, max }: Ext) =>
      !ok(min, max) ? undefined : isLog ? max * (1 + frac) : max + (max - min) * frac;
    // manual min on a log axis must stay > 0
    const mLo = manual ? (isLog ? Math.max(manualRange![0], 1e-6) : manualRange![0]) : null;
    const priceMin = manual ? mLo : padLo(0.06);
    const priceMax = manual ? manualRange![1] : padHi(0.06);
    // the right (indicator) axis always auto-fits the visible window
    const secMin = ({ min, max }: Ext) => (ok(min, max) ? min - (max - min) * 0.08 : undefined);
    const secMax = ({ min, max }: Ext) => (ok(min, max) ? max + (max - min) * 0.08 : undefined);
    const filterMode = "filter";

    // Animate only the Fit↔Full switch; everything else stays instant (so the
    // narrative slide and zoom stay crisp). Reset back to 0 afterwards.
    const yModeChanged = prevYModeRef.current !== yAxisMode;
    prevYModeRef.current = yAxisMode;

    chart.setOption(
      {
        yAxis: [
          { type: isLog ? "log" : "value", min: priceMin, max: priceMax },
          { show: secondaryVisible, min: secMin, max: secMax },
          {},
        ],
        grid: { right: secondaryVisible ? RIGHT_WIDE : RIGHT_NARROW },
        dataZoom: [{ filterMode }, { filterMode }],
        animationDurationUpdate: yModeChanged ? 500 : 0,
        series,
      },
      { replaceMerge: ["series"] },
    );
    if (yModeChanged) {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
      animTimerRef.current = window.setTimeout(
        () => chartRef.current?.setOption({ animationDurationUpdate: 0 }),
        550,
      );
    }
    recomputeRef.current();
    bump();
  }, [data, scale, visible, annotationsOn, activeEventIndex, yAxisMode, manualRange]);

  // narrative focus: smoothly slide/zoom the window to the event (suppressed by
  // parent if a period is selected — focus arrives as null then)
  const focusRafRef = useRef<number | null>(null);
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !focus) return;
    const toStart = Date.parse(focus[0]);
    const toEnd = Date.parse(focus[1]);

    // current window (pixels at the grid edges → time values)
    const left = GRID.left;
    const right = chart.getWidth() - rightMarginRef.current;
    let fromStart: number;
    let fromEnd: number;
    try {
      fromStart = chart.convertFromPixel({ xAxisIndex: 0 }, left) as number;
      fromEnd = chart.convertFromPixel({ xAxisIndex: 0 }, right) as number;
    } catch {
      chart.dispatchAction({ type: "dataZoom", startValue: toStart, endValue: toEnd });
      return;
    }

    if (focusRafRef.current != null) cancelAnimationFrame(focusRafRef.current);
    const dur = 600;
    const t0 = performance.now();
    const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = ease(p);
      chart.dispatchAction({
        type: "dataZoom",
        startValue: fromStart + (toStart - fromStart) * e,
        endValue: fromEnd + (toEnd - fromEnd) * e,
      });
      if (p < 1) focusRafRef.current = requestAnimationFrame(step);
    };
    focusRafRef.current = requestAnimationFrame(step);
    return () => {
      if (focusRafRef.current != null) cancelAnimationFrame(focusRafRef.current);
    };
  }, [focus]);

  // tell the parent whether a *dragged* measurement period is active (the
  // default whole-window view should not suppress narrative focus)
  const prevActive = useRef(false);
  useEffect(() => {
    const a = !!selection?.isDrag;
    if (a !== prevActive.current) {
      prevActive.current = a;
      onSelectionActiveChange(a);
    }
  }, [selection, onSelectionActiveChange]);

  const resetZoom = () => chartRef.current?.dispatchAction({ type: "dataZoom", start: 0, end: 100 });
  const clearSelection = () => {
    clearBandRef.current();
    recomputeRef.current(); // back to the default whole-window view
  };

  // On-chart axis boxes: a small rounded square per visible series, placed in
  // the margin beside its axis — at the line's start (left axis) or end (right
  // axis). Doubles as a colour key and a toggle. (Recomputed via viewTick.)
  const axisBoxes = (() => {
    const chart = chartRef.current;
    if (!chart || !data.length) return [];
    let wStart: number;
    let wEnd: number;
    try {
      wStart = chart.convertFromPixel({ xAxisIndex: 0 }, GRID.left) as number;
      wEnd = chart.convertFromPixel({ xAxisIndex: 0 }, chart.getWidth() - rightMarginRef.current) as number;
    } catch {
      return [];
    }
    const top = GRID.top;
    const bottom = chart.getHeight() - GRID.bottom;
    const out: { key: string; color: string; left: number; top: number }[] = [];
    for (const s of SERIES) {
      if (!visible[s.key]) continue;
      let rec: MarketRecord | undefined;
      if (s.axis === "price") {
        rec = data.find((r) => Date.parse(r.date) >= wStart && r[s.field] != null);
      } else {
        for (let i = data.length - 1; i >= 0; i--) {
          if (Date.parse(data[i].date) <= wEnd && data[i][s.field] != null) {
            rec = data[i];
            break;
          }
        }
      }
      if (!rec) continue;
      let y: number;
      try {
        y = chart.convertToPixel({ yAxisIndex: s.axis === "secondary" ? 1 : 0 }, rec[s.field] as number) as number;
      } catch {
        continue;
      }
      if (!Number.isFinite(y)) continue;
      out.push({
        key: s.key,
        color: s.color,
        left: s.axis === "price" ? GRID.left - 16 : chart.getWidth() - rightMarginRef.current + 7,
        top: Math.max(top, Math.min(bottom, y)),
      });
    }
    return out;
  })();

  const overlapping = selection
    ? EVENTS.map((e, i) => ({ e, i })).filter(
        ({ e }) =>
          Date.parse(e.date) <= selection.t1 && Date.parse(e.end ?? e.date) >= selection.t0,
      )
    : [];

  return (
    <div className="chart-area">
      <div className="chart-toolbar">
        <div className="toolbar-left">
          <label className="toolbar-toggle">
            <input type="checkbox" checked={annotationsOn} onChange={onToggleAnnotations} />
            Show events
          </label>
          <span className="toolbar-y">
            Scale <InfoButton concept="log-scale" />
            <span className="segmented small">
              <button type="button" className={scale === "log" ? "active" : ""} onClick={() => onScale("log")}>
                Log
              </button>
              <button type="button" className={scale === "linear" ? "active" : ""} onClick={() => onScale("linear")}>
                Linear
              </button>
            </span>
          </span>
          <span className="toolbar-y">
            Y-axis:
            <span className="segmented small">
              <button
                type="button"
                className={yAxisMode === "fit" ? "active" : ""}
                onClick={() => onSetYAxisMode("fit")}
                title="Auto-scale to the data currently in view"
              >
                Auto
              </button>
              <button
                type="button"
                className={yAxisMode === "manual" ? "active" : ""}
                onClick={() => onSetYAxisMode("manual")}
                title="Set the left axis range by hand"
              >
                Manual
              </button>
            </span>
            {yAxisMode === "manual" && manualRange && (
              <span className="y-manual">
                <input
                  type="number"
                  value={manualRange[0]}
                  onChange={(e) => onSetManualRange([Number(e.target.value), manualRange[1]])}
                  aria-label="Y-axis minimum"
                />
                <span>–</span>
                <input
                  type="number"
                  value={manualRange[1]}
                  onChange={(e) => onSetManualRange([manualRange[0], Number(e.target.value)])}
                  aria-label="Y-axis maximum"
                />
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="chart-row">
        <div className="chart-wrap">
          <div className="chart" ref={elRef} />
          <div className="axis-boxes">
            {axisBoxes.map((b) => (
              <button
                key={b.key}
                type="button"
                className="axis-box"
                title="Toggle this series"
                style={{ left: b.left, top: b.top, background: b.color, borderColor: b.color }}
                onClick={() => onToggleSeries(b.key)}
              />
            ))}
          </div>
          <div className="chart-underbar">
            <button type="button" className="btn" onClick={resetZoom}>
              Reset zoom
            </button>
            <span className="chart-hint">
              Drag a line to measure · drag a band's edge to adjust · click an event label
            </span>
          </div>
        </div>

        <aside className="selection-panel">
          {selection ? (
            <>
              <div className="sp-head">
                <span className="swatch" style={{ background: selection.color }} />
                <strong>{selection.seriesLabel}</strong>
                {selection.isDrag && (
                  <button type="button" className="sel-close" onClick={clearSelection} aria-label="Clear selection">
                    ✕
                  </button>
                )}
              </div>
              <div className="sp-sub">{selection.isDrag ? "Selected period" : "Whole view"}</div>
              <ul className="sp-list">
                <li>
                  <span className="sp-k">Period</span>
                  <span className="sp-v">{selection.startDate} → {selection.endDate}</span>
                </li>
                <li>
                  <span className="sp-k">Duration</span>
                  <span className="sp-v">{fmt(selection.years, 1)} yr</span>
                </li>
                <li>
                  <span className="sp-k">From → To</span>
                  <span className="sp-v">{fmt(selection.startVal)} → {fmt(selection.endVal)}</span>
                </li>
                <li>
                  <span className="sp-k">Change</span>
                  <span className={"sp-v " + (selection.diff >= 0 ? "up" : "down")}>
                    {signed(selection.diff)} ({signed(selection.pct, 1)}%)
                  </span>
                </li>
                {selection.cagr != null && (
                  <li>
                    <span className="sp-k">Annualized</span>
                    <span className={"sp-v " + (selection.cagr >= 0 ? "up" : "down")}>
                      {signed(selection.cagr, 1)}% / yr
                    </span>
                  </li>
                )}
              </ul>

              <div className="sp-events">
                <span className="sp-k">{selection.isDrag ? "Events in this period" : "Events in view"}</span>
                {overlapping.length ? (
                  <ul>
                    {overlapping.map(({ e, i }) => (
                      <li key={e.id}>
                        <button
                          type="button"
                          className={"sp-ev" + (i === activeEventIndex ? " active" : "")}
                          onClick={() => onSelectEvent(i)}
                        >
                          <span className="sp-ev-dot" style={{ background: POINT_COLOR[e.type] }} />
                          <span className="sp-ev-when">
                            {e.end ? `${e.date.slice(0, 4)}–${e.end.slice(0, 4)}` : monthLabel(e.date)}
                          </span>
                          <span className="sp-ev-title">{e.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="sp-empty">No major events in this window.</p>
                )}
              </div>
            </>
          ) : (
            <p className="sp-empty">Toggle on a series to see its stats.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
