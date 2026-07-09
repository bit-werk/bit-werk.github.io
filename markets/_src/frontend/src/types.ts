// Shape of data/sp500.json produced by the pipeline (pipeline/fetch_sp500.py).

export interface MarketRecord {
  date: string; // ISO, first of month
  price: number | null;
  realPrice: number | null;
  earnings: number | null;
  realEarnings: number | null;
  dividend: number | null;
  cpi: number | null;
  longRate: number | null;
  cape: number | null;
  // macro indicators (data/macro.json) + derived, merged in by date
  vix: number | null;
  fedFunds: number | null;
  unemployment: number | null;
  population: number | null;
  gold: number | null;
  us2y: number | null;
  ch10y: number | null;
  jp10y: number | null;
  gb10y: number | null;
  eu10y: number | null;
  gdp: number | null;
  gdpPerCapita: number | null;
  chGdp: number | null;
  chGdpPerCapita: number | null;
  jpGdp: number | null;
  jpGdpPerCapita: number | null;
  ukGdp: number | null;
  ukGdpPerCapita: number | null;
  euroGdp: number | null;
  euroGdpPerCapita: number | null;
  worldGdp: number | null;
  worldGdpPerCapita: number | null;
  oil: number | null;
  copper: number | null;
  inflation: number | null; // CPI year-over-year %, derived from cpi
  // other stock indices + assets (data/indices.json)
  nasdaq: number | null;
  dow: number | null;
  russell: number | null;
  japanIndex: number | null;
  ukIndex: number | null;
  europeIndex: number | null;
  swissIndex: number | null;
  worldIndex: number | null;
  bitcoin: number | null;
}

// data/macro.json rows: every field except date is a nullable number.
export type MacroRecord = { date: string } & Record<string, number | null>;

// data/indices.json rows: every field except date is a nullable number.
export type IndicesRecord = { date: string } & Record<string, number | null>;

export interface MacroDataset {
  meta: { title: string; range: [string, string] | null; sources: unknown[] };
  data: MacroRecord[];
}

export interface IndicesDataset {
  meta: { title: string; range: [string, string] | null; sources: unknown[] };
  data: IndicesRecord[];
}

export interface DatasetMeta {
  title: string;
  source: string;
  sourceUrl: string;
  license: string;
  generated: string;
  count: number;
  range: [string, string] | null;
  fields: Record<string, string>;
}

export interface Dataset {
  meta: DatasetMeta;
  data: MarketRecord[];
}
