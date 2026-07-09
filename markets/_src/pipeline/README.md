# Data pipeline

One-time / occasional scripts that fetch historical market data and write clean
JSON into `../data/` for the frontend to consume. The data is historical and
static, so this runs offline on demand — there is no runtime backend.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r pipeline/requirements.txt
```

## Scripts

### `fetch_sp500.py` — S&P 500 / Composite, monthly, 1871–present

```bash
python pipeline/fetch_sp500.py   # writes ../data/sp500.json
```

- **Primary source:** Robert J. Shiller's *Irrational Exuberance* dataset
  (`ie_data.xls`). The current workbook is published on
  [shillerdata.com](https://shillerdata.com/); the script scrapes the homepage
  for the live download link (the file is served from a wsimg blob whose id can
  change). Canonical; includes pre-computed CAPE. Free for academic /
  non-commercial use.
- **Fallbacks (in order):** last-known wsimg blob URL → the older Yale-hosted
  snapshot (`econ.yale.edu`, ends ~2023-09) → the datahub.io `s-and-p-500` CSV
  mirror.
- **Output fields:** see `meta.fields` inside the generated JSON (price,
  realPrice, earnings, realEarnings, dividend, cpi, longRate, cape).

The dataset runs from **1871-01 to the latest published month**. The most recent
2–3 months have `null` earnings/CAPE until Shiller fills them in. Sanity checks
against known history pass (1929 CAPE ≈ 32.6, 2000 dot-com peak ≈ 42.9).

## Planned next sources

- FRED (unemployment, Fed Funds rate, money supply) — `fetch_fred.py`
- Event annotations (`events.json`) — hand-authored, not fetched.
