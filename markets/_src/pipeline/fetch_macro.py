#!/usr/bin/env python3
"""
Macro indicator pipeline: volatility, the Fed, and the labour market.

Emits data/macro.json — monthly indicators that sit alongside the S&P 500
(data/sp500.json) on a shared timeline. Each field is fetched independently and
skipped gracefully if its source is unreachable, so a partial run still works.

Fields (see FIELDS below for the full list): US macro (vix, fedFunds,
unemployment, population), prices (gold, oil, copper), US & international bond
yields (us2y, ch10y, jp10y, gb10y, eu10y), and real GDP / GDP-per-capita for the
US plus Switzerland, Japan, the UK, the euro area and the world.

Sources:
    GitHub datasets   vix, gold                    (free mirror; reachable anywhere)
    FRED              fedFunds, unemployment, rates (St. Louis Fed / OECD)
    World Bank API    population, international GDP  (api.worldbank.org)

Note: FRED (fred.stlouisfed.org) may be blocked in some sandboxed networks. It
is fully accessible from a normal machine — just re-run this script there and the
FRED-sourced fields will populate. On a failed fetch this script keeps any
previously-saved values (it merges with the existing data/macro.json), so a
partial/offline run never wipes good data. VIX/gold (GitHub) and World Bank are
reachable almost anywhere.

Other interest-rate / inflation curves the app shows (10-year Treasury yield,
CPI year-over-year inflation) come for free from the Shiller dataset already in
data/sp500.json and need no fetch here.

Run:
    python pipeline/fetch_macro.py
"""
from __future__ import annotations

import datetime as dt
import io
import json
import sys
import time
from pathlib import Path

import pandas as pd
import requests

GITHUB_VIX = "https://raw.githubusercontent.com/datasets/finance-vix/main/data/vix-daily.csv"
GOLD_CSV = "https://raw.githubusercontent.com/datasets/gold-prices/main/data/monthly.csv"
GDP_CSV = "https://raw.githubusercontent.com/datasets/gdp-us/main/data/year.csv"
OIL_WTI_DAILY = "https://raw.githubusercontent.com/datasets/oil-prices/main/data/wti-daily.csv"
FRED_CSV = "https://fred.stlouisfed.org/graph/fredgraph.csv?id={}"
WB_CSV = "https://api.worldbank.org/v2/country/{code}/indicator/{ind}?format=json&per_page=20000"
HEADERS = {"User-Agent": "Mozilla/5.0 (market-cycles data pipeline)"}

OUT_PATH = Path(__file__).resolve().parent.parent / "data" / "macro.json"

# field name -> human description (for meta.fields)
FIELDS = {
    "vix": "CBOE Volatility Index (monthly mean of daily close)",
    "fedFunds": "Effective Federal Funds Rate, %",
    "unemployment": "U.S. unemployment rate, %",
    "population": "U.S. population, total (World Bank, annual)",
    "gold": "Gold price, USD per troy ounce",
    "us2y": "U.S. 2-year Treasury yield, %",
    "ch10y": "Switzerland 10-year government bond yield, %",
    "jp10y": "Japan 10-year government bond yield, %",
    "gb10y": "U.K. 10-year gilt yield, %",
    "eu10y": "Euro area 10-year government bond yield, %",
    "gdp": "U.S. real GDP, USD billions (annual)",
    "gdpPerCapita": "U.S. real GDP per capita, USD (chained)",
    "chGdp": "Switzerland real GDP, USD billions (constant, annual)",
    "chGdpPerCapita": "Switzerland real GDP per capita, USD (constant)",
    "jpGdp": "Japan real GDP, USD billions (constant, annual)",
    "jpGdpPerCapita": "Japan real GDP per capita, USD (constant)",
    "ukGdp": "U.K. real GDP, USD billions (constant, annual)",
    "ukGdpPerCapita": "U.K. real GDP per capita, USD (constant)",
    "euroGdp": "Euro area real GDP, USD billions (constant, annual)",
    "euroGdpPerCapita": "Euro area real GDP per capita, USD (constant)",
    "worldGdp": "World real GDP, USD billions (constant, annual)",
    "worldGdpPerCapita": "World real GDP per capita, USD (constant)",
    "oil": "Crude oil price (WTI), USD per barrel",
    "copper": "Copper price, USD per metric ton",
}


def _month_key(ts: pd.Timestamp) -> str:
    return f"{ts.year:04d}-{ts.month:02d}-01"


def fetch_vix() -> dict[str, float]:
    """Daily VIX close -> monthly mean, keyed by first-of-month ISO date."""
    raw = requests.get(GITHUB_VIX, headers=HEADERS, timeout=40).content
    df = pd.read_csv(io.BytesIO(raw), parse_dates=["DATE"]).set_index("DATE")
    monthly = df["CLOSE"].resample("MS").mean().dropna()
    return {_month_key(idx): round(float(v), 2) for idx, v in monthly.items()}


def fetch_gold() -> dict[str, float]:
    """Monthly gold price (CSV columns Date='YYYY-MM', Price) -> {iso_date: usd}."""
    raw = requests.get(GOLD_CSV, headers=HEADERS, timeout=40).content
    df = pd.read_csv(io.BytesIO(raw))
    out: dict[str, float] = {}
    for _, row in df.iterrows():
        try:
            y, m = str(row["Date"]).strip().split("-")[:2]
            out[f"{int(y):04d}-{int(m):02d}-01"] = round(float(row["Price"]), 2)
        except (ValueError, KeyError):
            continue
    return out


def _get(url: str, timeout: int = 30, attempts: int = 3):
    """GET with retries — FRED can be slow/flaky from some networks."""
    last: Exception | None = None
    for _ in range(attempts):
        try:
            return requests.get(url, headers=HEADERS, timeout=timeout)
        except Exception as exc:  # noqa: BLE001
            last = exc
            time.sleep(2)
    raise last  # type: ignore[misc]


def fetch_gdp() -> dict[str, float]:
    """U.S. real GDP, annual (datahub gdp-us): year -> real (chained) USD billions."""
    df = pd.read_csv(io.BytesIO(_get(GDP_CSV).content))
    out: dict[str, float] = {}
    for _, row in df.iterrows():
        try:
            out[f"{int(row['date']):04d}-01-01"] = round(float(row["level-chained"]), 1)
        except (ValueError, KeyError):
            continue
    return out


def fetch_oil() -> dict[str, float]:
    """Crude oil (WTI). FRED WTISPLC (monthly, since 1946) — falls back to the
    datahub daily series (since 1986) resampled to monthly."""
    try:
        return fetch_fred("WTISPLC")
    except Exception:  # noqa: BLE001
        df = pd.read_csv(io.BytesIO(_get(OIL_WTI_DAILY).content), parse_dates=["Date"]).set_index("Date")
        m = df["Price"].resample("MS").mean().dropna()
        return {_month_key(i): round(float(v), 2) for i, v in m.items()}


def fetch_fred(series_id: str) -> dict[str, float]:
    """Monthly FRED series (already first-of-month) -> {iso_date: value}."""
    raw = _get(FRED_CSV.format(series_id)).content
    df = pd.read_csv(io.BytesIO(raw))
    date_col, val_col = df.columns[0], df.columns[1]
    out: dict[str, float] = {}
    for _, row in df.iterrows():
        v = str(row[val_col]).strip()
        if v in (".", "", "nan"):
            continue
        try:
            out[str(row[date_col])[:10]] = round(float(v), 2)
        except ValueError:
            continue
    return out


def fetch_worldbank(code: str, indicator: str, scale: float = 1.0, ndigits: int = 2) -> dict[str, float]:
    """Annual World Bank indicator -> {YYYY-01-01: value * scale}.

    The API returns [meta, [observations]]; each observation has a 'date' (year)
    and a 'value' (possibly null). `scale` converts units (e.g. 1e-9 to express
    GDP in USD billions to match the US GDP series)."""
    payload = json.loads(_get(WB_CSV.format(code=code, ind=indicator)).content)
    rows = payload[1] if isinstance(payload, list) and len(payload) > 1 else []
    out: dict[str, float] = {}
    for r in rows or []:
        v = r.get("value")
        if v is None:
            continue
        try:
            out[f"{int(r['date']):04d}-01-01"] = round(float(v) * scale, ndigits)
        except (ValueError, TypeError, KeyError):
            continue
    return out


def load_existing() -> dict[str, dict[str, float]]:
    """Prior output as {field: {iso_date: value}}, so a failed fetch can fall
    back to cached values instead of dropping the field."""
    if not OUT_PATH.exists():
        return {}
    try:
        prev = json.load(OUT_PATH.open())
    except Exception:  # noqa: BLE001
        return {}
    cols: dict[str, dict[str, float]] = {}
    for row in prev.get("data", []):
        for k, v in row.items():
            if k == "date" or v is None:
                continue
            cols.setdefault(k, {})[row["date"]] = v
    return cols


def build() -> dict:
    prev = load_existing()
    columns: dict[str, dict[str, float]] = {k: dict(prev.get(k, {})) for k in FIELDS}
    provenance: list[dict] = []

    # World Bank GDP is scaled to USD billions (1e-9) to match the US gdp series.
    def wb(code: str, ind: str, scale: float = 1.0):
        return lambda: fetch_worldbank(code, ind, scale)

    GDP_KD, PCAP_KD, POP = "NY.GDP.MKTP.KD", "NY.GDP.PCAP.KD", "SP.POP.TOTL"

    jobs = [
        ("vix", "GitHub datasets/finance-vix", GITHUB_VIX, fetch_vix),
        ("fedFunds", "FRED FEDFUNDS", FRED_CSV.format("FEDFUNDS"), lambda: fetch_fred("FEDFUNDS")),
        ("unemployment", "FRED UNRATE", FRED_CSV.format("UNRATE"), lambda: fetch_fred("UNRATE")),
        ("population", "World Bank SP.POP.TOTL (USA)", WB_CSV.format(code="USA", ind=POP), wb("USA", POP)),
        ("gold", "GitHub datasets/gold-prices", GOLD_CSV, fetch_gold),
        ("us2y", "FRED GS2", FRED_CSV.format("GS2"), lambda: fetch_fred("GS2")),
        ("ch10y", "FRED IRLTLT01CHM156N (OECD)", FRED_CSV.format("IRLTLT01CHM156N"), lambda: fetch_fred("IRLTLT01CHM156N")),
        ("jp10y", "FRED IRLTLT01JPM156N (OECD)", FRED_CSV.format("IRLTLT01JPM156N"), lambda: fetch_fred("IRLTLT01JPM156N")),
        ("gb10y", "FRED IRLTLT01GBM156N (OECD)", FRED_CSV.format("IRLTLT01GBM156N"), lambda: fetch_fred("IRLTLT01GBM156N")),
        ("eu10y", "FRED IRLTLT01EZM156N (OECD)", FRED_CSV.format("IRLTLT01EZM156N"), lambda: fetch_fred("IRLTLT01EZM156N")),
        ("gdp", "GitHub datasets/gdp-us", GDP_CSV, fetch_gdp),
        ("gdpPerCapita", "FRED A939RX0Q048SBEA", FRED_CSV.format("A939RX0Q048SBEA"), lambda: fetch_fred("A939RX0Q048SBEA")),
        ("chGdp", "World Bank NY.GDP.MKTP.KD (CHE)", WB_CSV.format(code="CHE", ind=GDP_KD), wb("CHE", GDP_KD, 1e-9)),
        ("chGdpPerCapita", "World Bank NY.GDP.PCAP.KD (CHE)", WB_CSV.format(code="CHE", ind=PCAP_KD), wb("CHE", PCAP_KD)),
        ("jpGdp", "World Bank NY.GDP.MKTP.KD (JPN)", WB_CSV.format(code="JPN", ind=GDP_KD), wb("JPN", GDP_KD, 1e-9)),
        ("jpGdpPerCapita", "World Bank NY.GDP.PCAP.KD (JPN)", WB_CSV.format(code="JPN", ind=PCAP_KD), wb("JPN", PCAP_KD)),
        ("ukGdp", "World Bank NY.GDP.MKTP.KD (GBR)", WB_CSV.format(code="GBR", ind=GDP_KD), wb("GBR", GDP_KD, 1e-9)),
        ("ukGdpPerCapita", "World Bank NY.GDP.PCAP.KD (GBR)", WB_CSV.format(code="GBR", ind=PCAP_KD), wb("GBR", PCAP_KD)),
        ("euroGdp", "World Bank NY.GDP.MKTP.KD (EMU)", WB_CSV.format(code="EMU", ind=GDP_KD), wb("EMU", GDP_KD, 1e-9)),
        ("euroGdpPerCapita", "World Bank NY.GDP.PCAP.KD (EMU)", WB_CSV.format(code="EMU", ind=PCAP_KD), wb("EMU", PCAP_KD)),
        ("worldGdp", "World Bank NY.GDP.MKTP.KD (WLD)", WB_CSV.format(code="WLD", ind=GDP_KD), wb("WLD", GDP_KD, 1e-9)),
        ("worldGdpPerCapita", "World Bank NY.GDP.PCAP.KD (WLD)", WB_CSV.format(code="WLD", ind=PCAP_KD), wb("WLD", PCAP_KD)),
        ("oil", "FRED WTISPLC / datahub oil-prices", FRED_CSV.format("WTISPLC"), fetch_oil),
        ("copper", "FRED PCOPPUSDM", FRED_CSV.format("PCOPPUSDM"), lambda: fetch_fred("PCOPPUSDM")),
    ]
    for field, source, url, fn in jobs:
        try:
            print(f"Fetching {field} <- {source}")
            series = fn()
            if not series:
                raise ValueError("no observations")
            columns[field] = series
            keys = sorted(series)
            provenance.append(
                {"field": field, "source": source, "url": url, "n": len(series),
                 "range": [keys[0], keys[-1]]}
            )
            print(f"  ok: {len(series)} rows, {keys[0]} -> {keys[-1]}")
        except Exception as exc:  # noqa: BLE001 - one bad source shouldn't sink the rest
            if columns[field]:
                # Fetch failed but cached values were kept — record their
                # provenance so meta.sources (and the missing-fields report)
                # reflect what the output actually contains.
                keys = sorted(columns[field])
                provenance.append(
                    {"field": field, "source": f"{source} (cached from previous run)",
                     "url": url, "n": len(keys), "range": [keys[0], keys[-1]]}
                )
                print(f"  ! {field} fetch failed ({exc}); kept {len(keys)} cached rows",
                      file=sys.stderr)
            else:
                print(f"  ! skipped {field}: {exc}", file=sys.stderr)

    all_dates = sorted({d for col in columns.values() for d in col})
    records = [
        {"date": d, **{f: columns[f].get(d) for f in FIELDS}} for d in all_dates
    ]
    return {
        "meta": {
            "title": "Macro indicators — monthly",
            "generated": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
            "count": len(records),
            "range": [records[0]["date"], records[-1]["date"]] if records else None,
            "fields": FIELDS,
            "sources": provenance,
        },
        "data": records,
    }


def main() -> None:
    payload = build()
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUT_PATH.open("w") as fh:
        json.dump(payload, fh, separators=(",", ":"))
    got = [p["field"] for p in payload["meta"]["sources"]]
    missing = [f for f in FIELDS if f not in got]
    print(
        f"\nWrote {OUT_PATH}\n"
        f"  fields : {', '.join(got) or '(none)'}"
        + (f"   [missing: {', '.join(missing)}]" if missing else "")
        + f"\n  records: {payload['meta']['count']}\n"
        f"  size   : {OUT_PATH.stat().st_size / 1024:.0f} KB"
    )


if __name__ == "__main__":
    main()
