// Declarative definition of the plottable series. Each one maps a record field
// to a chart line, ties to an explanation concept, says which y-axis it uses,
// and belongs to a subject GROUP (for the grouped, colour-coded controls).
//
// The price axis (left) can switch log/linear; the "secondary" axis (right) is
// a shared linear axis for indicators (rates, ratios, %, index levels), which
// live on a very different scale from price.
import type { MarketRecord } from "./types";
import type { ConceptKey } from "./concepts";

export type AxisId = "price" | "secondary";

// Subject groups: the *kind* of a series (used for its colour-coded tag and to
// decide which y-axis it lives on). Independent of which region it belongs to.
export type GroupId =
  | "indices"
  | "economy"
  | "valuation"
  | "bonds"
  | "rates"
  | "commodities"
  | "crypto"
  | "risk";

// `short` is the compact tag shown next to a series inside a region box.
export const GROUPS: Record<GroupId, { label: string; short: string; color: string }> = {
  indices: { label: "Stock indices", short: "index", color: "#2563eb" },
  economy: { label: "Economy", short: "economy", color: "#0f766e" },
  valuation: { label: "Valuation", short: "valuation", color: "#d97706" },
  bonds: { label: "Bonds & yields", short: "bond", color: "#1d4ed8" },
  rates: { label: "Policy & inflation", short: "policy", color: "#dc2626" },
  commodities: { label: "Commodities", short: "commodity", color: "#ca8a04" },
  crypto: { label: "Crypto", short: "crypto", color: "#f7931a" },
  risk: { label: "Risk", short: "risk", color: "#7c3aed" },
};
export const GROUP_ORDER: GroupId[] = [
  "indices",
  "economy",
  "valuation",
  "bonds",
  "rates",
  "commodities",
  "crypto",
  "risk",
];

// Regions: the outer boxes. Each series belongs to one region — a country /
// region, or "global" for assets that aren't tied to any single country.
export type RegionId =
  | "us"
  | "europe"
  | "uk"
  | "japan"
  | "switzerland"
  | "world"
  | "global";

export const REGIONS: Record<RegionId, { label: string; color: string }> = {
  us: { label: "United States", color: "#2563eb" },
  europe: { label: "Europe (euro area)", color: "#0f766e" },
  uk: { label: "United Kingdom", color: "#7c3aed" },
  japan: { label: "Japan", color: "#dc2626" },
  switzerland: { label: "Switzerland", color: "#db2777" },
  world: { label: "World", color: "#0891b2" },
  global: { label: "Global & other", color: "#ca8a04" },
};
export const REGION_ORDER: RegionId[] = [
  "us",
  "europe",
  "uk",
  "japan",
  "switzerland",
  "world",
  "global",
];

export interface SeriesDef {
  key: string;
  label: string;
  concept: ConceptKey;
  /** Outer box: which country / region (or "global") this series belongs to. */
  region: RegionId;
  /** Subject kind: drives the colour-coded tag and the y-axis choice. */
  group: GroupId;
  axis: AxisId;
  color: string;
  field: keyof MarketRecord;
  /** Visible on first load. */
  default: boolean;
}

export const SERIES: SeriesDef[] = [
  // ===================== United States =====================
  { key: "nominal", label: "S&P 500 — nominal", concept: "nominal-vs-real", region: "us", group: "indices", axis: "price", color: "#2563eb", field: "price", default: true },
  { key: "real", label: "S&P 500 — real", concept: "nominal-vs-real", region: "us", group: "indices", axis: "price", color: "#16a34a", field: "realPrice", default: true },
  { key: "nasdaq", label: "Nasdaq Composite", concept: "nasdaq", region: "us", group: "indices", axis: "price", color: "#9333ea", field: "nasdaq", default: false },
  { key: "dow", label: "Dow Jones", concept: "dow-jones", region: "us", group: "indices", axis: "price", color: "#ea580c", field: "dow", default: false },
  { key: "russell", label: "Russell 2000", concept: "russell", region: "us", group: "indices", axis: "price", color: "#0d9488", field: "russell", default: false },
  { key: "cape", label: "CAPE (valuation)", concept: "cape", region: "us", group: "valuation", axis: "secondary", color: "#d97706", field: "cape", default: false },
  { key: "gdp", label: "US real GDP ($B)", concept: "gdp", region: "us", group: "economy", axis: "price", color: "#0f766e", field: "gdp", default: false },
  { key: "gdpPerCapita", label: "US real GDP per capita ($)", concept: "gdp-per-capita", region: "us", group: "economy", axis: "price", color: "#15803d", field: "gdpPerCapita", default: false },
  { key: "population", label: "US population", concept: "population", region: "us", group: "economy", axis: "price", color: "#6366f1", field: "population", default: false },
  { key: "unemployment", label: "Unemployment (%)", concept: "unemployment", region: "us", group: "economy", axis: "secondary", color: "#7c3aed", field: "unemployment", default: false },
  { key: "longRate", label: "US 10-year yield (%)", concept: "long-rate", region: "us", group: "bonds", axis: "secondary", color: "#1d4ed8", field: "longRate", default: false },
  { key: "us2y", label: "US 2-year yield (%)", concept: "us-2y", region: "us", group: "bonds", axis: "secondary", color: "#38bdf8", field: "us2y", default: false },
  { key: "fedFunds", label: "Fed funds rate (%)", concept: "fed-funds", region: "us", group: "rates", axis: "secondary", color: "#dc2626", field: "fedFunds", default: false },
  { key: "inflation", label: "Inflation, CPI YoY (%)", concept: "inflation", region: "us", group: "rates", axis: "secondary", color: "#be185d", field: "inflation", default: false },

  // ===================== Europe (euro area) =====================
  { key: "europeIndex", label: "EURO STOXX 50", concept: "euro-stoxx", region: "europe", group: "indices", axis: "price", color: "#0f766e", field: "europeIndex", default: false },
  { key: "euroGdp", label: "Euro area real GDP ($B)", concept: "gdp-region", region: "europe", group: "economy", axis: "price", color: "#0d9488", field: "euroGdp", default: false },
  { key: "euroGdpPerCapita", label: "Euro area GDP per capita ($)", concept: "gdp-per-capita-region", region: "europe", group: "economy", axis: "price", color: "#14b8a6", field: "euroGdpPerCapita", default: false },
  { key: "eu10y", label: "Euro area 10-year yield (%)", concept: "euro-10y", region: "europe", group: "bonds", axis: "secondary", color: "#22d3ee", field: "eu10y", default: false },

  // ===================== United Kingdom =====================
  { key: "ukIndex", label: "FTSE 100", concept: "ftse100", region: "uk", group: "indices", axis: "price", color: "#7c3aed", field: "ukIndex", default: false },
  { key: "ukGdp", label: "UK real GDP ($B)", concept: "gdp-region", region: "uk", group: "economy", axis: "price", color: "#6d28d9", field: "ukGdp", default: false },
  { key: "ukGdpPerCapita", label: "UK GDP per capita ($)", concept: "gdp-per-capita-region", region: "uk", group: "economy", axis: "price", color: "#a78bfa", field: "ukGdpPerCapita", default: false },
  { key: "gb10y", label: "UK 10-year gilt (%)", concept: "gb-10y", region: "uk", group: "bonds", axis: "secondary", color: "#8b5cf6", field: "gb10y", default: false },

  // ===================== Japan =====================
  { key: "japanIndex", label: "Nikkei 225", concept: "nikkei", region: "japan", group: "indices", axis: "price", color: "#dc2626", field: "japanIndex", default: false },
  { key: "jpGdp", label: "Japan real GDP ($B)", concept: "gdp-region", region: "japan", group: "economy", axis: "price", color: "#b91c1c", field: "jpGdp", default: false },
  { key: "jpGdpPerCapita", label: "Japan GDP per capita ($)", concept: "gdp-per-capita-region", region: "japan", group: "economy", axis: "price", color: "#f87171", field: "jpGdpPerCapita", default: false },
  { key: "jp10y", label: "Japan 10-year yield (%)", concept: "jp-10y", region: "japan", group: "bonds", axis: "secondary", color: "#ef4444", field: "jp10y", default: false },

  // ===================== Switzerland =====================
  { key: "swissIndex", label: "Swiss Market Index (SMI)", concept: "smi", region: "switzerland", group: "indices", axis: "price", color: "#db2777", field: "swissIndex", default: false },
  { key: "chGdp", label: "Switzerland real GDP ($B)", concept: "gdp-region", region: "switzerland", group: "economy", axis: "price", color: "#9f1239", field: "chGdp", default: false },
  { key: "chGdpPerCapita", label: "Switzerland GDP per capita ($)", concept: "gdp-per-capita-region", region: "switzerland", group: "economy", axis: "price", color: "#fb7185", field: "chGdpPerCapita", default: false },
  { key: "ch10y", label: "Swiss 10-year yield (%)", concept: "ch-10y", region: "switzerland", group: "bonds", axis: "secondary", color: "#e11d48", field: "ch10y", default: false },

  // ===================== World =====================
  { key: "worldIndex", label: "MSCI ACWI (world)", concept: "msci-world", region: "world", group: "indices", axis: "price", color: "#0284c7", field: "worldIndex", default: false },
  { key: "worldGdp", label: "World real GDP ($B)", concept: "gdp-region", region: "world", group: "economy", axis: "price", color: "#0e7490", field: "worldGdp", default: false },
  { key: "worldGdpPerCapita", label: "World GDP per capita ($)", concept: "gdp-per-capita-region", region: "world", group: "economy", axis: "price", color: "#06b6d4", field: "worldGdpPerCapita", default: false },

  // ===================== Global & other (no single country) =====================
  { key: "gold", label: "Gold (USD/oz)", concept: "gold-price", region: "global", group: "commodities", axis: "price", color: "#ca8a04", field: "gold", default: false },
  { key: "oil", label: "Crude oil, WTI (USD/bbl)", concept: "oil", region: "global", group: "commodities", axis: "price", color: "#525252", field: "oil", default: false },
  { key: "copper", label: "Copper (USD/tonne)", concept: "copper", region: "global", group: "commodities", axis: "price", color: "#b45309", field: "copper", default: false },
  { key: "bitcoin", label: "Bitcoin (USD)", concept: "bitcoin", region: "global", group: "crypto", axis: "price", color: "#f7931a", field: "bitcoin", default: false },
  { key: "vix", label: "VIX (volatility)", concept: "vix", region: "global", group: "risk", axis: "secondary", color: "#0891b2", field: "vix", default: false },
];
