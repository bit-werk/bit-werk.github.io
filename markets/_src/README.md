# Market Cycles

An interactive web app for **learning and studying long-run stock-market cycles**
through real historical data — the big movements, going back to the 1870s.

The goal is a guided, narrative experience: follow the indices across time, see
peaks and crashes annotated with *what actually happened* (the railroad bubble,
1929, the dot-com mania, 2008…), and pull up supporting layers — valuations,
employment, inflation, what the Fed was doing — to understand what cycles have in
common and how they rhyme.

## Vision

- **Graphical & historical** — real data from ~1871 to present.
- **Multiple indices / regions** — US as the deep spine; Europe / Asia / World
  for the modern era. Switchable, never cluttered.
- **Annotated narrative** — peaks and bubbles marked with their stories; a
  guided tour you can follow ("look at this peak, notice…").
- **Cycle-revealing views** — log scale and inflation-adjusted / valuation
  (CAPE) series that factor out money growth and expose the recurring pattern.
- **Macro context** — employment, interest rates, money supply, Fed actions
  aligned to the same timeline.
- **"No hindsight" mode** — crop the chart at a date to experience a bubble
  without knowing how it ends.

## How it works

The data is historical, so it never changes at runtime. That keeps the
architecture simple — there is **no backend**:

```
pipeline/  (Python)  →  data/*.json  →  frontend (static site)
```

- **`pipeline/`** — occasional scripts that fetch & normalize source data into
  clean JSON. See [`pipeline/README.md`](pipeline/README.md).
- **`data/`** — generated JSON consumed directly by the frontend.
- **`frontend/`** — a static charting app (Vite + React + TypeScript +
  ECharts). Every concept has an ⓘ explainer with a Wikipedia link; see the
  `concepts.ts` "explain-everything" layer.

## Roadmap

| Phase | What | Status |
|------:|------|--------|
| 1 | S&P 500 data pipeline (1871–present): price, real price, earnings, CAPE | ✅ done |
| 2 | Core chart: series toggles, log/linear, zoom/pan, ⓘ explainers | ✅ done |
| 3 | Event annotations + narrative layer | |
| 4 | Macro layers via FRED (unemployment, Fed Funds, money supply) | |
| 5 | More indices + CAPE view + "biggest companies per era" | |
| 6 | Regions (Europe / UK / Japan / Switzerland / World, modern era) — indices, GDP, GDP per capita, bonds, grouped into per-region boxes | ✅ done |
| 7 | Guided tour + "no hindsight" mode | |

## Data sources

- **Robert J. Shiller** (Yale), *Irrational Exuberance* dataset — S&P Composite,
  earnings, CAPE, CPI, monthly since 1871. Free for academic / non-commercial use.
- **Yahoo Finance** — stock indices (Nasdaq, Dow, Russell, Nikkei 225, FTSE 100,
  EURO STOXX 50, SMI, MSCI ACWI) and Bitcoin, monthly.
- **FRED** (St. Louis Fed) / **OECD** — Fed funds, unemployment, copper, and 10-year
  bond yields (US, Switzerland, Japan, UK, euro area).
- **World Bank** — population and international real GDP / GDP-per-capita
  (US, Switzerland, Japan, UK, euro area, world).
- **GitHub datahub** — gold, US oil (WTI) and US real GDP.

## Getting started

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r pipeline/requirements.txt
python pipeline/fetch_sp500.py        # regenerates data/sp500.json
```

Then the web app:

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173 (auto-copies ../data in first)
```

## Publishing (bit-werk.github.io/markets/)

This project lives inside the `bit-werk.github.io` GitHub Pages repo under `markets/`.
GitHub Pages serves committed files verbatim (no build step), so the **built** app is
committed alongside the source:

```
markets/
├── index.html      ← built app, served at bit-werk.github.io/markets/
├── assets/         ← built JS/CSS (committed)
├── data/           ← pipeline JSON, served at /markets/data/*.json (committed)
└── _src/           ← ALL source. The leading "_" makes GitHub's Jekyll layer
    ├── frontend/     skip it, so it stays in the repo but is never served.
    ├── pipeline/
    ├── data/
    └── README.md
```

To publish a change:

```bash
cd _src/frontend
npm run build      # clears ../../assets + ../../data, then emits the app into markets/
cd ../../..        # repo root
git add markets && git commit -m "..." && git push
```

`vite.config.ts` sets `base: "./"` (relative asset/data URLs so the subpath works) and
`build.outDir: "../../"` with `emptyOutDir: false`, so the build writes straight into
`markets/`. Assets fetch data via `./data/*.json`, which resolves to `/markets/data/`.
