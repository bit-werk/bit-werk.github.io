#!/usr/bin/env python3
"""
Phase 1 data pipeline: S&P 500 long-history dataset.

Downloads Robert Shiller's "Irrational Exuberance" stock-market dataset
(monthly, back to 1871) and emits a clean, frontend-friendly JSON file.

Primary source : Yale / Robert Shiller  -> ie_data.xls (canonical, current)
Fallback source: datahub.io mirror      -> data.csv   (cleaner, may be stale)

Output: data/sp500.json  (one record per month)
    date        ISO date, first of month (e.g. "1929-09-01")
    price       S&P Composite nominal price
    realPrice   inflation-adjusted price (today's dollars per source CPI base)
    earnings    nominal trailing earnings
    realEarnings inflation-adjusted earnings
    dividend    nominal trailing dividend
    cpi         Consumer Price Index
    longRate    long-term (10y) interest rate, %
    cape        cyclically-adjusted P/E (Shiller CAPE / P/E10); null before ~1881

Run:
    python -m venv .venv && source .venv/bin/activate
    pip install -r pipeline/requirements.txt
    python pipeline/fetch_sp500.py
"""
from __future__ import annotations

import datetime as dt
import io
import json
import math
import re
import sys
from pathlib import Path

import pandas as pd
import requests

# Shiller now publishes the current workbook on shillerdata.com (served from a
# wsimg blob whose id can change). We scrape the homepage for the live link and
# fall back to the last-known blob, then the older Yale-hosted snapshot.
SHILLER_HOME = "https://shillerdata.com/"
SHILLER_BLOB = (
    "https://img1.wsimg.com/blobby/go/e5e77e0b-59d1-44d9-ab25-4763ac982e53/"
    "downloads/c9b8cf0f-f01a-49f5-9ea5-d19443390ab2/ie_data.xls"
)
SHILLER_YALE = "http://www.econ.yale.edu/~shiller/data/ie_data.xls"  # stale (~2023-09)
DATAHUB_CSV = "https://raw.githubusercontent.com/datasets/s-and-p-500/main/data/data.csv"
HEADERS = {"User-Agent": "Mozilla/5.0 (market-cycles data pipeline)"}

OUT_PATH = Path(__file__).resolve().parent.parent / "data" / "sp500.json"


def _num(value, ndigits=2):
    """Coerce to a rounded float, or None for missing/zero-placeholder values."""
    try:
        f = float(value)
    except (TypeError, ValueError):
        return None
    if math.isnan(f) or math.isinf(f):
        return None
    return round(f, ndigits)


def _frac_year_to_date(frac) -> str | None:
    """Convert Shiller's fractional date (1871.01 = Jan, 1871.10 = Oct) to ISO."""
    try:
        f = float(frac)
    except (TypeError, ValueError):
        return None
    if math.isnan(f):
        return None
    year = int(f)
    month = int(round((f - year) * 100))
    if not (1 <= month <= 12) or year < 1800:
        return None
    return f"{year:04d}-{month:02d}-01"


def _shiller_urls() -> list[str]:
    """Live shillerdata.com link (scraped), then known fallbacks, in order."""
    urls = []
    try:
        html = requests.get(SHILLER_HOME, headers=HEADERS, timeout=30).text
        m = re.search(r'href="([^"]*ie_data\.xls[^"]*)"', html, re.I)
        if m:
            u = m.group(1)
            if u.startswith("//"):
                u = "https:" + u
            urls.append(u)
    except Exception as exc:  # noqa: BLE001
        print(f"  ! could not scrape {SHILLER_HOME}: {exc}", file=sys.stderr)
    for u in (SHILLER_BLOB, SHILLER_YALE):
        if u not in urls:
            urls.append(u)
    return urls


def fetch_from_shiller() -> list[dict]:
    """Download and parse the Shiller ie_data.xls 'Data' sheet (current source)."""
    last_exc: Exception | None = None
    raw = None
    for url in _shiller_urls():
        try:
            print(f"Fetching Shiller dataset: {url}")
            raw = requests.get(url, headers=HEADERS, timeout=60).content
            break
        except Exception as exc:  # noqa: BLE001 - try the next URL
            last_exc = exc
            print(f"  ! failed: {exc}", file=sys.stderr)
    if raw is None:
        raise RuntimeError(f"all Shiller URLs failed: {last_exc}")
    # Real column header lives on sheet row index 7; data follows.
    df = pd.read_excel(io.BytesIO(raw), sheet_name="Data", header=None, skiprows=8)

    # Columns are positional in the Shiller sheet:
    # 0 Date 1 P 2 D 3 E 4 CPI 5 DateFraction 6 LongRate 7 RealP 8 RealD
    # 9 RealTRPrice 10 RealE 11 RealTRScaledE 12 CAPE
    records = []
    for row in df.itertuples(index=False):
        date = _frac_year_to_date(row[0])
        price = _num(row[1])
        if date is None or price is None:
            # Stop at footer/notes rows once the price series ends.
            if records:
                break
            continue
        records.append(
            {
                "date": date,
                "price": price,
                "realPrice": _num(row[7]),
                "earnings": _num(row[3]),
                "realEarnings": _num(row[10]),
                "dividend": _num(row[2]),
                "cpi": _num(row[4]),
                "longRate": _num(row[6]),
                "cape": _num(row[12]),
            }
        )
    return records


def fetch_from_datahub() -> list[dict]:
    """Fallback: parse the datahub CSV mirror (Date,SP500,Dividend,Earnings,CPI,LongRate,RealPrice,RealDividend,RealEarnings,PE10)."""
    print(f"Falling back to datahub mirror: {DATAHUB_CSV}")
    text = requests.get(DATAHUB_CSV, headers=HEADERS, timeout=60).text
    df = pd.read_csv(io.StringIO(text))
    records = []
    for r in df.itertuples(index=False):
        price = _num(r.SP500)
        if price is None or price == 0:
            continue
        records.append(
            {
                "date": str(r.Date),
                "price": price,
                "realPrice": _num(r._6),  # "Real Price"
                "earnings": _num(r.Earnings),
                "realEarnings": _num(r._8),  # "Real Earnings"
                "dividend": _num(r.Dividend),
                "cpi": _num(getattr(r, "Consumer_Price_Index", None)),
                "longRate": _num(getattr(r, "Long_Interest_Rate", None)),
                "cape": _num(r.PE10),
            }
        )
    return records


def build() -> dict:
    try:
        records = fetch_from_shiller()
        source, url = "Robert J. Shiller (ie_data.xls)", SHILLER_HOME
        if len(records) < 1000:
            raise ValueError(f"suspiciously few rows ({len(records)})")
    except Exception as exc:  # noqa: BLE001 - any failure -> try the mirror
        print(f"  ! Shiller source failed: {exc}", file=sys.stderr)
        records = fetch_from_datahub()
        source, url = "datahub.io s-and-p-500 (Shiller mirror)", DATAHUB_CSV

    records.sort(key=lambda r: r["date"])
    return {
        "meta": {
            "title": "S&P 500 / Composite — monthly, 1871–present",
            "source": source,
            "sourceUrl": url,
            "license": "Free for academic / non-commercial use (Shiller).",
            "generated": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
            "count": len(records),
            "range": [records[0]["date"], records[-1]["date"]] if records else None,
            "fields": {
                "date": "ISO date, first of month",
                "price": "S&P Composite nominal price",
                "realPrice": "inflation-adjusted price (source CPI base)",
                "earnings": "nominal trailing earnings",
                "realEarnings": "inflation-adjusted trailing earnings",
                "dividend": "nominal trailing dividend",
                "cpi": "Consumer Price Index",
                "longRate": "10-year interest rate, %",
                "cape": "Shiller CAPE / cyclically-adjusted P/E (null pre-1881)",
            },
        },
        "data": records,
    }


def main() -> None:
    payload = build()
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUT_PATH.open("w") as fh:
        json.dump(payload, fh, separators=(",", ":"))
    meta = payload["meta"]
    print(
        f"\nWrote {OUT_PATH}\n"
        f"  source : {meta['source']}\n"
        f"  records: {meta['count']}\n"
        f"  range  : {meta['range'][0]} -> {meta['range'][1]}\n"
        f"  size   : {OUT_PATH.stat().st_size / 1024:.0f} KB"
    )


if __name__ == "__main__":
    main()
