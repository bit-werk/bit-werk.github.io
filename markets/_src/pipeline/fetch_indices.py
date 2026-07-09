#!/usr/bin/env python3
"""
Additional index / asset pipeline: other US indices, world & regional indices,
and Bitcoin.

Emits data/indices.json — monthly levels on the shared timeline, to sit
alongside the S&P 500. Source is Yahoo Finance's public chart API (monthly
closes). Each series is fetched independently and skipped gracefully on failure;
on a failed fetch any previously-saved values are kept, so a partial/offline run
never wipes good data.

Fields:
    nasdaq       Nasdaq Composite (^IXIC)          ~1985 -> present
    dow          Dow Jones Industrial Avg (^DJI)    ~1992 -> present (Yahoo depth)
    russell      Russell 2000 (^RUT)                ~1987 -> present
    japanIndex   Nikkei 225 (^N225)                 Japan
    ukIndex      FTSE 100 (^FTSE)                   United Kingdom
    europeIndex  EURO STOXX 50 (^STOXX50E)          euro area
    swissIndex   Swiss Market Index / SMI (^SSMI)   Switzerland
    worldIndex   MSCI ACWI (ACWI ETF)               world (all-country) proxy
    bitcoin      Bitcoin, USD (BTC-USD)             ~2014 -> present

Coverage is modern-era only — Yahoo doesn't carry the full history of these
series. The S&P 500 (data/sp500.json) remains the deep historical spine.

Run:
    python pipeline/fetch_indices.py
"""
from __future__ import annotations

import datetime as dt
import json
import sys
from pathlib import Path

import requests

YAHOO = "https://query1.finance.yahoo.com/v8/finance/chart/{}?period1=0&period2=9999999999&interval=1mo"
HEADERS = {"User-Agent": "Mozilla/5.0 (market-cycles data pipeline)"}

OUT_PATH = Path(__file__).resolve().parent.parent / "data" / "indices.json"

# field name -> (yahoo symbol, human description)
SERIES = {
    "nasdaq": ("^IXIC", "Nasdaq Composite index"),
    "dow": ("^DJI", "Dow Jones Industrial Average"),
    "russell": ("^RUT", "Russell 2000 index"),
    "japanIndex": ("^N225", "Nikkei 225 (Japan)"),
    "ukIndex": ("^FTSE", "FTSE 100 (United Kingdom)"),
    "europeIndex": ("^STOXX50E", "EURO STOXX 50 (euro area)"),
    "swissIndex": ("^SSMI", "Swiss Market Index / SMI (Switzerland)"),
    "worldIndex": ("ACWI", "MSCI ACWI — world all-country index (ETF proxy)"),
    "bitcoin": ("BTC-USD", "Bitcoin price, USD"),
}


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


def fetch_yahoo(symbol: str) -> dict[str, float]:
    """Monthly close levels, keyed by first-of-month ISO date."""
    url = YAHOO.format(requests.utils.quote(symbol))
    r = requests.get(url, headers=HEADERS, timeout=30)
    res = r.json()["chart"]["result"][0]
    ts = res["timestamp"]
    close = res["indicators"]["quote"][0]["close"]
    out: dict[str, float] = {}
    for t, c in zip(ts, close):
        if c is None:
            continue
        d = dt.datetime.fromtimestamp(t, dt.timezone.utc)
        out[f"{d.year:04d}-{d.month:02d}-01"] = round(float(c), 2)
    return out


def build() -> dict:
    prev = load_existing()
    columns: dict[str, dict[str, float]] = {k: dict(prev.get(k, {})) for k in SERIES}
    provenance: list[dict] = []

    for field, (symbol, _desc) in SERIES.items():
        try:
            print(f"Fetching {field} <- Yahoo {symbol}")
            series = fetch_yahoo(symbol)
            if not series:
                raise ValueError("no observations")
            columns[field] = series
            keys = sorted(series)
            provenance.append(
                {"field": field, "source": f"Yahoo Finance {symbol}",
                 "url": YAHOO.format(symbol), "n": len(series), "range": [keys[0], keys[-1]]}
            )
            print(f"  ok: {len(series)} rows, {keys[0]} -> {keys[-1]}")
        except Exception as exc:  # noqa: BLE001
            if columns[field]:
                # Fetch failed but cached values were kept — record their
                # provenance so meta.sources (and the printed summary) reflect
                # what the output actually contains.
                keys = sorted(columns[field])
                provenance.append(
                    {"field": field, "source": f"Yahoo Finance {symbol} (cached from previous run)",
                     "url": YAHOO.format(symbol), "n": len(keys), "range": [keys[0], keys[-1]]}
                )
                print(f"  ! {field} fetch failed ({exc}); kept {len(keys)} cached rows",
                      file=sys.stderr)
            else:
                print(f"  ! skipped {field}: {exc}", file=sys.stderr)

    all_dates = sorted({d for col in columns.values() for d in col})
    records = [{"date": d, **{f: columns[f].get(d) for f in SERIES}} for d in all_dates]
    return {
        "meta": {
            "title": "Stock indices (Nasdaq, Dow, Russell 2000) — monthly",
            "generated": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
            "count": len(records),
            "range": [records[0]["date"], records[-1]["date"]] if records else None,
            "fields": {k: v[1] for k, v in SERIES.items()},
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
    print(
        f"\nWrote {OUT_PATH}\n"
        f"  fields : {', '.join(got) or '(none)'}\n"
        f"  records: {payload['meta']['count']}\n"
        f"  size   : {OUT_PATH.stat().st_size / 1024:.0f} KB"
    )


if __name__ == "__main__":
    main()
