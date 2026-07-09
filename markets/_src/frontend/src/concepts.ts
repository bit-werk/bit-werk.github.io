// The "explain everything" layer.
//
// Every concept the UI exposes (a series, a control, a metric) has an entry
// here with a plain-language explanation and a link to read more. The UI shows
// these via the ⓘ InfoButton, so explanations live in one place and stay
// consistent. Add a concept here, reference it by key in the UI.

export interface Concept {
  term: string;
  /** One or two plain sentences — assume no finance background. */
  short: string;
  /** Where to read more (Wikipedia by default). */
  url: string;
}

export const CONCEPTS = {
  "sp500": {
    term: "S&P 500 / S&P Composite",
    short:
      "A stock index tracking ~500 of the largest U.S. companies. It is the standard gauge of 'the U.S. stock market'. Robert Shiller's reconstruction extends a comparable composite back to 1871.",
    url: "https://en.wikipedia.org/wiki/S%26P_500",
  },
  "nominal-vs-real": {
    term: "Nominal vs. Real (inflation-adjusted)",
    short:
      "Nominal values are the actual prices at the time. Real values are restated in constant purchasing power, stripping out inflation — so a 1929 dollar and a 2020 dollar can be compared fairly. Real prices reveal true gains, not just rising prices.",
    url: "https://en.wikipedia.org/wiki/Real_versus_nominal_value_(economics)",
  },
  "cape": {
    term: "CAPE (Shiller P/E)",
    short:
      "Cyclically-Adjusted Price-to-Earnings: price divided by the average of 10 years of inflation-adjusted earnings. Smoothing earnings over a decade filters out the business cycle, making it a popular gauge of whether the market is cheap or expensive. It peaked near 33 in 1929 and ~44 in 2000.",
    url: "https://en.wikipedia.org/wiki/Cyclically_adjusted_price-to-earnings_ratio",
  },
  "log-scale": {
    term: "Logarithmic scale",
    short:
      "On a log scale, equal vertical distances mean equal percentage changes (a doubling looks the same whether from 10→20 or 1000→2000). For long-run market history this is essential: on a linear scale early decades look flat and only recent moves are visible. Note: this toggle affects only the price axis (prices and gold); the indicators on the right axis — rates, ratios, % — always stay linear, since values like inflation can be zero or negative.",
    url: "https://en.wikipedia.org/wiki/Logarithmic_scale",
  },
  "earnings": {
    term: "Earnings",
    short:
      "The aggregate profits of the companies in the index. Stock prices ultimately track earnings over the long run; gaps between the two are what valuation measures like CAPE try to capture.",
    url: "https://en.wikipedia.org/wiki/Earnings",
  },
  "dividend": {
    term: "Dividend",
    short:
      "Cash paid out to shareholders from company profits. Historically a large share of total stock returns came from reinvested dividends, not just price gains.",
    url: "https://en.wikipedia.org/wiki/Dividend",
  },
  "cpi": {
    term: "Consumer Price Index (CPI)",
    short:
      "A measure of the average price of a basket of consumer goods over time — the standard yardstick for inflation. It's what's used to convert nominal values into real ones.",
    url: "https://en.wikipedia.org/wiki/Consumer_price_index",
  },
  "long-rate": {
    term: "US 10-year Treasury yield",
    short:
      "The yield on the 10-year U.S. government bond — the benchmark long-term interest rate. (Bond prices move inversely to yields, so a falling line means rising bond prices.) Note the great bond bull market: yields fell from ~15% in 1981 to near 0% by 2020, then turned up. A key backdrop to valuations and borrowing costs.",
    url: "https://en.wikipedia.org/wiki/United_States_Treasury_security",
  },
  "us-2y": {
    term: "US 2-year Treasury yield",
    short:
      "The yield on the 2-year U.S. government bond — the short end, driven by expected Fed policy. When the 2-year rises above the 10-year (an 'inverted yield curve'), it has preceded every U.S. recession in recent decades. Compare it with the 10-year to spot inversions.",
    url: "https://en.wikipedia.org/wiki/Yield_curve",
  },
  "ch-10y": {
    term: "Swiss 10-year government bond yield",
    short:
      "The yield on Switzerland's 10-year government bond — a classic safe-haven asset. Swiss yields sit well below U.S. ones and famously turned negative from 2015 to 2021, meaning investors paid to lend to the Swiss government. A useful international contrast to U.S. rates.",
    url: "https://en.wikipedia.org/wiki/Negative_interest_rate",
  },
  "vix": {
    term: "VIX (volatility index)",
    short:
      "The CBOE Volatility Index — the market's expected swing over the next 30 days, implied by S&P 500 option prices. Often called the 'fear gauge': it stays low in calm bull markets and spikes during crashes (e.g. 2008, March 2020). Available from 1990.",
    url: "https://en.wikipedia.org/wiki/VIX",
  },
  "fed-funds": {
    term: "Federal Funds Rate",
    short:
      "The interest rate the U.S. Federal Reserve targets for overnight lending between banks — its main policy lever. Raising it cools the economy and markets; cutting it stimulates them. Watching it against market peaks shows what the Fed was doing at each turning point.",
    url: "https://en.wikipedia.org/wiki/Federal_funds_rate",
  },
  "unemployment": {
    term: "U.S. unemployment rate",
    short:
      "The share of the U.S. labour force without a job but seeking work (source: U.S. Bureau of Labor Statistics). It typically falls during expansions and jumps in recessions — a lagging but vivid marker of the economic cycle behind the market.",
    url: "https://en.wikipedia.org/wiki/Unemployment_in_the_United_States",
  },
  "gdp": {
    term: "U.S. real GDP",
    short:
      "Gross Domestic Product — the total inflation-adjusted output of the U.S. economy (annual, in constant dollars). The broadest measure of the economy itself; comparing it with the stock market shows how prices track — or run ahead of — real activity. Recessions appear as dips or flat spots.",
    url: "https://en.wikipedia.org/wiki/Gross_domestic_product",
  },
  "gdp-per-capita": {
    term: "U.S. real GDP per capita",
    short:
      "Total real GDP divided by the population — output per person, in constant dollars. It's the standard proxy for average living standards and productivity, and it strips out growth that's merely from a bigger population. Note how it keeps climbing across the decades, with dips in recessions.",
    url: "https://en.wikipedia.org/wiki/Gross_domestic_product_per_capita",
  },
  "oil": {
    term: "Crude oil price (WTI)",
    short:
      "The price of a barrel of West Texas Intermediate crude. Energy costs ripple through the whole economy: note the 1973 and 1979 oil shocks (which drove inflation and bear markets), the 2008 spike, and the brief negative prices in 2020.",
    url: "https://en.wikipedia.org/wiki/West_Texas_Intermediate",
  },
  "copper": {
    term: "Copper price",
    short:
      "The price of copper, nicknamed 'Dr. Copper' for its knack of forecasting the economy — it's used everywhere (construction, electronics, wiring), so demand rises and falls with global industrial activity.",
    url: "https://en.wikipedia.org/wiki/Copper#Price",
  },
  "inflation": {
    term: "Inflation (CPI year-over-year)",
    short:
      "How much consumer prices have risen versus 12 months earlier, derived here from the CPI. High inflation erodes real returns and tends to provoke the Fed into raising rates — note the 1970s–80s spikes and their effect on stocks.",
    url: "https://en.wikipedia.org/wiki/Inflation",
  },
  "nasdaq": {
    term: "Nasdaq Composite",
    short:
      "An index of essentially all stocks listed on the Nasdaq exchange — heavily weighted toward technology. Because it's tech-tilted, it's the clearest lens on the dot-com bubble of the late 1990s and the 2000–02 crash, and on the modern tech booms.",
    url: "https://en.wikipedia.org/wiki/Nasdaq_Composite",
  },
  "dow-jones": {
    term: "Dow Jones Industrial Average",
    short:
      "The oldest widely-followed U.S. index (since 1896): a price-weighted average of 30 large 'blue-chip' companies. Narrow and quirky (price-weighted, only 30 names) but historically the headline number people quote for 'the market'.",
    url: "https://en.wikipedia.org/wiki/Dow_Jones_Industrial_Average",
  },
  "russell": {
    term: "Russell 2000",
    short:
      "An index of ~2000 small-company ('small-cap') U.S. stocks. Small caps are more domestic and economically sensitive, so comparing it with the large-cap S&P 500 reveals how broad or narrow a rally really is.",
    url: "https://en.wikipedia.org/wiki/Russell_2000_Index",
  },
  "population": {
    term: "U.S. population",
    short:
      "The total number of people living in the United States (World Bank, annual). It provides the denominator behind GDP per capita and a sense of how much of raw GDP growth is simply more people versus greater output per person.",
    url: "https://en.wikipedia.org/wiki/Demographics_of_the_United_States",
  },
  "gdp-region": {
    term: "Real GDP (by region)",
    short:
      "Gross Domestic Product — the total inflation-adjusted output of an economy, here in constant U.S. dollars (billions) so countries and regions can be compared on the same footing. Source: World Bank. Recessions show up as dips or flat spots.",
    url: "https://en.wikipedia.org/wiki/Gross_domestic_product",
  },
  "gdp-per-capita-region": {
    term: "Real GDP per capita (by region)",
    short:
      "Real GDP divided by population — output per person, in constant U.S. dollars (World Bank). The standard proxy for average living standards, and directly comparable across countries. Note the wide gaps between regions and how they narrow or widen over the decades.",
    url: "https://en.wikipedia.org/wiki/Gross_domestic_product_per_capita",
  },
  "nikkei": {
    term: "Nikkei 225 (Japan)",
    short:
      "Japan's headline stock index — a price-weighted average of 225 large companies on the Tokyo Stock Exchange. Famous for the 1980s bubble: it peaked near 39,000 at the end of 1989 and did not durably reclaim that high until 2024 — a decades-long lesson in how long a bubble can take to recover.",
    url: "https://en.wikipedia.org/wiki/Nikkei_225",
  },
  "ftse100": {
    term: "FTSE 100 (United Kingdom)",
    short:
      "The index of the 100 largest companies listed in London — the standard gauge of the U.K. stock market. Heavy in energy, mining, banks and consumer giants, many earning globally, so it often tracks world commodity and currency swings as much as the U.K. economy.",
    url: "https://en.wikipedia.org/wiki/FTSE_100_Index",
  },
  "euro-stoxx": {
    term: "EURO STOXX 50 (euro area)",
    short:
      "A blue-chip index of 50 of the largest companies across the euro area (Germany, France, the Netherlands, and more) — the benchmark for eurozone equities, the continental-Europe counterpart to the S&P 500.",
    url: "https://en.wikipedia.org/wiki/EURO_STOXX_50",
  },
  "smi": {
    term: "Swiss Market Index (SMI)",
    short:
      "Switzerland's headline index — 20 of the largest, most liquid Swiss companies (dominated by Nestlé, Roche and Novartis). Defensive and quality-tilted, it reflects a small, wealthy, export-heavy market and its strong-franc backdrop.",
    url: "https://en.wikipedia.org/wiki/Swiss_Market_Index",
  },
  "msci-world": {
    term: "MSCI ACWI (world index)",
    short:
      "The MSCI All Country World Index — a single index tracking large- and mid-cap stocks across developed and emerging markets, i.e. 'the whole world's stock market' in one line. Shown here via a widely-traded ETF proxy, so its history starts around 2008.",
    url: "https://en.wikipedia.org/wiki/MSCI_World",
  },
  "jp-10y": {
    term: "Japan 10-year government bond yield",
    short:
      "The yield on Japan's 10-year government bond (JGB). A landmark case of ultra-low rates: after the 1990s bust the Bank of Japan pinned yields near — and at times below — zero for years, a preview of what later spread to Europe. A key international contrast to U.S. rates.",
    url: "https://en.wikipedia.org/wiki/Government_bond",
  },
  "gb-10y": {
    term: "U.K. 10-year gilt yield",
    short:
      "The yield on the 10-year U.K. government bond (a 'gilt') — Britain's benchmark long-term interest rate. Watch the sharp 2022 spike around the 'mini-budget', a vivid example of how fast bond markets can discipline governments.",
    url: "https://en.wikipedia.org/wiki/Gilt-edged_securities",
  },
  "euro-10y": {
    term: "Euro area 10-year government bond yield",
    short:
      "A benchmark 10-year government bond yield for the euro area (OECD aggregate). It tracks European Central Bank policy and, like Japan's, spent years near or below zero in the 2010s. Compare it with U.S. Treasuries to see how the two big blocs diverge.",
    url: "https://en.wikipedia.org/wiki/Government_bond",
  },
  "bitcoin": {
    term: "Bitcoin",
    short:
      "The first and largest cryptocurrency — a decentralised digital asset with a capped supply of 21 million coins, not tied to any country or central bank. Extremely volatile, it has run through several boom-and-bust cycles since 2013; shown here in U.S. dollars on the price axis.",
    url: "https://en.wikipedia.org/wiki/Bitcoin",
  },
  "gold-price": {
    term: "Gold price",
    short:
      "The U.S. dollar price of an ounce of gold. Long seen as a store of value and a hedge against inflation and crises — it was effectively fixed under the gold standard, then soared after the dollar's gold link ended in 1971, peaking in 1980 and again in the 2010s–2020s. Shown on the price axis, so it follows the log/linear toggle.",
    url: "https://en.wikipedia.org/wiki/Gold_as_an_investment",
  },
  "market-cycle": {
    term: "Market cycle",
    short:
      "The recurring swing of markets between optimism-driven expansions and fear-driven contractions — booms, bubbles, crashes, and recoveries. Studying past cycles is how we learn what peaks tend to have in common.",
    url: "https://en.wikipedia.org/wiki/Market_trend",
  },
} as const satisfies Record<string, Concept>;

export type ConceptKey = keyof typeof CONCEPTS;
