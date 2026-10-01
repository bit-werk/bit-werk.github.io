import { useEffect } from "react";

interface Props {
  source: string;
  sourceUrl: string;
  license: string;
  onClose: () => void;
}

const L = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer">
    {children}
  </a>
);

// Where every number comes from. Closes on the x, on a click outside, or Esc.
export function Sources({ source, sourceUrl, license, onClose }: Props) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Sources" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-x" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <h2>Sources</h2>
        <dl>
          <dt>S&amp;P 500, CAPE, CPI</dt>
          <dd>
            <L href={sourceUrl}>{source}</L>
          </dd>
          <dt>Stock indices &amp; Bitcoin</dt>
          <dd>
            Nasdaq, Dow, Russell, Nikkei, FTSE, EURO STOXX, SMI, MSCI ACWI and Bitcoin via{" "}
            <L href="https://finance.yahoo.com">Yahoo Finance</L>
          </dd>
          <dt>VIX</dt>
          <dd>
            <L href="https://github.com/datasets/finance-vix">GitHub datasets/finance-vix</L>
          </dd>
          <dt>Gold</dt>
          <dd>
            <L href="https://github.com/datasets/gold-prices">GitHub datasets/gold-prices</L>
          </dd>
          <dt>US oil &amp; real GDP</dt>
          <dd>
            <L href="https://datahub.io">DataHub</L> (GitHub datasets)
          </dd>
          <dt>Rates, unemployment, copper, bond yields</dt>
          <dd>
            Fed funds, unemployment, copper and bond yields (US 2y; Swiss, Japan, UK and euro-area 10y) via{" "}
            <L href="https://fred.stlouisfed.org">FRED</L> / <L href="https://data.oecd.org">OECD</L>
          </dd>
          <dt>Population &amp; international GDP</dt>
          <dd>
            <L href="https://data.worldbank.org">World Bank</L>
          </dd>
        </dl>
        <p className="modal-license">{license}</p>
      </div>
    </div>
  );
}
