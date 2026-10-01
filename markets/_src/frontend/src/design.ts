import type { EventType } from "./events";
import { POINT_COLOR } from "./events";

// One identity with two registers. The technical zone (index, chart, readout) is a
// terminal on graph paper: Plex type, squared marks. The reading zone (title,
// course, events) speaks in the plum-and-champagne language of light Jost. This
// module holds what CSS cannot reach: the canvas chart's styling, and the tone
// every series/event colour is given so data reads well on the plum ground.

export interface ChartTokens {
  font: string;
  mono: string;
  text: string;
  dim: string;
  axis: string;
  split: string;
  lineWidth: number;
  tipBg: string;
  tipBorder: string;
  tipText: string;
  sliderFill: string;
  sliderBorder: string;
  sliderData: string;
  band: { fill: string; stroke: string };
  labelBg: string;
}

// ---- themes --------------------------------------------------------------
// A theme is a palette plus the type voices. Layout never changes. The palette
// becomes CSS custom properties on <html>; the same colours feed the canvas
// chart tokens and the series tone below.

export interface Theme {
  id: string;
  label: string;
  dark: boolean;
  bg: string; // sheet
  desk: string; // page behind the sheet
  plot: string; // chart ground (a step off the sheet so it reads as a window)
  ink: string;
  dim: string;
  faint: string;
  accent: string; // "this is active"
  pop: string; // popovers / modal
  up: string;
  down: string;
  tech: string; // technical voice
  mono: string;
  read: string; // reading voice
  /** series tone: saturation factor, lightness shift, lightness clamp */
  tone: { sat: number; shift: number; lo: number; hi: number };
}

const PLEX = '"IBM Plex Sans Condensed", "Arial Narrow", sans-serif';
const PLEX_MONO = '"IBM Plex Mono", ui-monospace, monospace';
const JOST = '"Jost Variable", "Helvetica Neue", Arial, sans-serif';

export const THEMES: Theme[] = [
  {
    id: "plum", label: "Plum", dark: true,
    bg: "#14111a", desk: "#0d0b12", plot: "#0a0810", ink: "#e9e3d6", dim: "#9a93a6", faint: "#6b6477",
    accent: "#c9a96a", pop: "#1c1824", up: "#a4cfa9", down: "#dc8f8f",
    tech: PLEX, mono: PLEX_MONO, read: JOST,
    tone: { sat: 0.72, shift: 0.2, lo: 0.62, hi: 0.74 },
  },
  {
    id: "blueprint", label: "Blueprint", dark: true,
    bg: "#0c2c4f", desk: "#071e38", plot: "#081f3a", ink: "#e4f0ff", dim: "#8fb5df", faint: "#5d86b3",
    accent: "#ffe27a", pop: "#0f365f", up: "#8be9b3", down: "#ff9a8a",
    tech: PLEX_MONO, mono: PLEX_MONO, read: PLEX,
    tone: { sat: 0.9, shift: 0.22, lo: 0.66, hi: 0.78 },
  },
  {
    id: "terminal", label: "Terminal", dark: true,
    bg: "#060606", desk: "#000000", plot: "#000000", ink: "#ffb347", dim: "#b57d2b", faint: "#74511d",
    accent: "#3dff7e", pop: "#0d0d0d", up: "#3dff7e", down: "#ff5252",
    tech: PLEX_MONO, mono: PLEX_MONO, read: PLEX_MONO,
    tone: { sat: 1.15, shift: 0.18, lo: 0.58, hi: 0.68 },
  },
  {
    id: "atelier", label: "Atelier", dark: false,
    bg: "#f7f2e8", desk: "#e8e0cf", plot: "#ece5d5", ink: "#2a2520", dim: "#6c645a", faint: "#9d9487",
    accent: "#8c3b2a", pop: "#fffdf7", up: "#2f7a4d", down: "#b3372f",
    tech: PLEX, mono: PLEX_MONO, read: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
    tone: { sat: 0.85, shift: -0.12, lo: 0.3, hi: 0.46 },
  },
];

export const DEFAULT_THEME = "blueprint";
export const themeById = (id: string) => THEMES.find((t) => t.id === id) ?? THEMES[0];

export const tok: ChartTokens = {
  font: PLEX, mono: PLEX_MONO, text: "", dim: "", axis: "", split: "", lineWidth: 1.5, tipBg: "", tipBorder: "", tipText: "",
  sliderFill: "", sliderBorder: "", sliderData: "", band: { fill: "", stroke: "" }, labelBg: "",
};

let toneParams = THEMES[0].tone;
const cache = new Map<string, string>();

/** Install a theme: CSS variables on <html>, chart tokens, series tone. */
export function applyTheme(id: string) {
  const t = themeById(id);
  const root = document.documentElement;
  const v: Record<string, string> = {
    "--bg": t.bg, "--desk": t.desk, "--plot": t.plot, "--ink": t.ink, "--dim": t.dim, "--faint": t.faint,
    "--gold": t.accent, "--focus": t.accent, "--pop-bg": t.pop, "--up": t.up, "--down": t.down,
    "--rule": alpha(t.ink, t.dark ? 0.16 : 0.18), "--rule-gold": alpha(t.accent, t.dark ? 0.55 : 0.6),
    "--paper": alpha(t.ink, t.dark ? 0.045 : 0.06), "--paper-major": alpha(t.accent, t.dark ? 0.1 : 0.12),
    "--overlay": t.dark ? "rgba(0,0,0,0.7)" : "rgba(40,32,24,0.45)",
    "--tech": t.tech, "--mono": t.mono, "--read": t.read,
  };
  for (const k in v) root.style.setProperty(k, v[k]);
  root.style.colorScheme = t.dark ? "dark" : "light";
  root.dataset.theme = t.id;
  Object.assign(tok, {
    font: t.tech, mono: t.mono, text: t.ink, dim: t.dim,
    axis: alpha(t.ink, 0.6), split: alpha(t.ink, t.dark ? 0.11 : 0.14),
    tipBg: t.pop, tipBorder: alpha(t.accent, 0.7), tipText: t.ink,
    sliderFill: alpha(t.accent, 0.16), sliderBorder: alpha(t.ink, 0.22), sliderData: alpha(t.ink, 0.35),
    band: { fill: alpha(t.accent, 0.1), stroke: alpha(t.accent, 0.85) }, labelBg: t.bg,
  });
  toneParams = t.tone;
  cache.clear();
}

// ---- colour toning -------------------------------------------------------

function hexToHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Fit a base colour to the current theme's ground (lighter on dark, deeper on light). */
export function tone(hex: string): string {
  const hit = cache.get(hex);
  if (hit) return hit;
  const [h, s, l] = hexToHsl(hex);
  const { sat, shift, lo, hi } = toneParams;
  const out = hslToHex(h, clamp(s * sat, 0, 1), clamp(l + shift, lo, hi));
  cache.set(hex, out);
  return out;
}

export function alpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export const evColor = (t: EventType) => tone(POINT_COLOR[t]);
export const bandColor = (t: EventType, strong: boolean) => alpha(tone(POINT_COLOR[t]), strong ? 0.3 : 0.11);
