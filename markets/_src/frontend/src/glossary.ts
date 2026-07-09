// The course glossary: plain-language definitions for the economics terms,
// people and theories referenced in the narrative. Each entry is looked up by
// slug from inline [[slug|text]] markup (see components/RichText.tsx) and shown
// as a hover/focus tooltip with a "read more" link.

export interface GlossaryEntry {
  term: string;
  short: string;
  url: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  // ---- market & cycle vocabulary ----
  "bull-market": {
    term: "Bull market",
    short: "A sustained rise in prices, usually driven by optimism and rising confidence.",
    url: "https://en.wikipedia.org/wiki/Market_trend#Bull_market",
  },
  "bear-market": {
    term: "Bear market",
    short: "A decline of 20% or more from a peak, marked by pessimism and forced selling.",
    url: "https://en.wikipedia.org/wiki/Market_trend#Bear_market",
  },
  "correction": {
    term: "Correction",
    short: "A shorter, milder drop of roughly 10% from a recent high — less severe than a bear market.",
    url: "https://en.wikipedia.org/wiki/Market_correction",
  },
  "recession": {
    term: "Recession",
    short: "A broad, sustained fall in economic activity — conventionally two straight quarters of shrinking GDP.",
    url: "https://en.wikipedia.org/wiki/Recession",
  },
  "depression": {
    term: "Depression",
    short: "An especially severe and prolonged recession, like the 1930s Great Depression.",
    url: "https://en.wikipedia.org/wiki/Depression_(economics)",
  },
  "panic": {
    term: "Financial panic",
    short: "A sudden collapse of confidence that triggers bank runs and a rush to sell at any price.",
    url: "https://en.wikipedia.org/wiki/Financial_crisis",
  },
  "bubble": {
    term: "Asset bubble",
    short: "Prices driven far above intrinsic value by speculation, credit and euphoria — until they collapse.",
    url: "https://en.wikipedia.org/wiki/Economic_bubble",
  },
  "business-cycle": {
    term: "Business cycle",
    short: "The economy's recurring rhythm of expansion, peak, contraction and trough.",
    url: "https://en.wikipedia.org/wiki/Business_cycle",
  },
  "secular-market": {
    term: "Secular trend",
    short: "A long, multi-decade market direction (a 'secular' bull or bear) that spans many shorter cycles.",
    url: "https://en.wikipedia.org/wiki/Market_trend#Secular_trends",
  },
  "regime": {
    term: "Market regime",
    short: "The long structural backdrop — an inflation era, a monetary system — within which shorter cycles play out. Edgar Peters likens regimes to climate and cycles to weather.",
    url: "https://en.wikipedia.org/wiki/Business_cycle",
  },
  "credit-cycle": {
    term: "Credit cycle",
    short: "The expansion and contraction of borrowing that inflates booms and deepens busts.",
    url: "https://en.wikipedia.org/wiki/Credit_cycle",
  },
  "mean-reversion": {
    term: "Mean reversion",
    short: "The tendency of stretched valuations and returns to drift back toward long-run averages.",
    url: "https://en.wikipedia.org/wiki/Mean_reversion_(finance)",
  },
  "this-time-is-different": {
    term: "“This time is different”",
    short: "The recurring, costly belief that old rules no longer apply — catalogued across eight centuries of crises by Reinhart & Rogoff.",
    url: "https://en.wikipedia.org/wiki/This_Time_Is_Different",
  },

  // ---- money, prices & policy ----
  "inflation": {
    term: "Inflation",
    short: "A general rise in prices that erodes the purchasing power of money.",
    url: "https://en.wikipedia.org/wiki/Inflation",
  },
  "deflation": {
    term: "Deflation",
    short: "A general fall in prices — dangerous when it raises the real burden of debt and feeds a downward spiral.",
    url: "https://en.wikipedia.org/wiki/Deflation",
  },
  "disinflation": {
    term: "Disinflation",
    short: "A slowing in the rate of inflation — prices still rise, but more slowly.",
    url: "https://en.wikipedia.org/wiki/Disinflation",
  },
  "stagflation": {
    term: "Stagflation",
    short: "The rare, painful mix of stagnant growth and high inflation, as in the 1970s.",
    url: "https://en.wikipedia.org/wiki/Stagflation",
  },
  "central-bank": {
    term: "Central bank",
    short: "The institution that manages a nation's money supply and interest rates — e.g. the US Federal Reserve.",
    url: "https://en.wikipedia.org/wiki/Central_bank",
  },
  "lender-of-last-resort": {
    term: "Lender of last resort",
    short: "A central bank's role of lending freely in a panic to stop bank runs from cascading.",
    url: "https://en.wikipedia.org/wiki/Lender_of_last_resort",
  },
  "monetary-policy": {
    term: "Monetary policy",
    short: "How a central bank steers the economy — mainly by setting interest rates and the money supply.",
    url: "https://en.wikipedia.org/wiki/Monetary_policy",
  },
  "fiscal-policy": {
    term: "Fiscal policy",
    short: "Government use of spending and taxation to influence the economy.",
    url: "https://en.wikipedia.org/wiki/Fiscal_policy",
  },
  "interest-rate": {
    term: "Interest rate",
    short: "The price of borrowing money; a central bank's main lever over the economy.",
    url: "https://en.wikipedia.org/wiki/Interest_rate",
  },
  "yield": {
    term: "Bond yield",
    short: "The return a bond pays. Yields move inversely to bond prices, so falling yields mean rising bond prices.",
    url: "https://en.wikipedia.org/wiki/Yield_(finance)",
  },
  "yield-curve": {
    term: "Yield curve",
    short: "Yields plotted across maturities. When short rates rise above long rates (an 'inversion'), recession has often followed.",
    url: "https://en.wikipedia.org/wiki/Yield_curve",
  },
  "gold-standard": {
    term: "Gold standard",
    short: "A monetary system that fixes a currency's value to a set amount of gold.",
    url: "https://en.wikipedia.org/wiki/Gold_standard",
  },
  "free-banking": {
    term: "Free Banking Era",
    short: "The 1837–1863 period when private, state-chartered banks each printed their own dollar banknotes, redeemable in gold or silver — thousands of varieties circulating, often at a discount.",
    url: "https://en.wikipedia.org/wiki/Free_banking",
  },
  "greenback": {
    term: "Greenbacks",
    short: "Paper dollars (United States Notes) the Treasury first printed to fund the Civil War — early federal fiat money not directly backed by gold.",
    url: "https://en.wikipedia.org/wiki/Greenback_(1860s_money)",
  },
  "national-bank-note": {
    term: "National Bank Notes",
    short: "Standardised dollar banknotes issued from 1863 by federally-chartered banks, each note backed by US government bonds the bank had to deposit with the Treasury.",
    url: "https://en.wikipedia.org/wiki/National_Bank_Note",
  },
  "elastic-currency": {
    term: "Elastic currency",
    short: "A money supply that can expand and contract with demand. Its absence under the gold standard caused seasonal cash shortages that turned scares into panics — furnishing an 'elastic currency' was the Federal Reserve's founding mandate.",
    url: "https://en.wikipedia.org/wiki/Federal_Reserve_Act",
  },
  "bretton-woods": {
    term: "Bretton Woods system",
    short: "The 1944–1971 order of fixed exchange rates anchored to a gold-convertible US dollar.",
    url: "https://en.wikipedia.org/wiki/Bretton_Woods_system",
  },
  "quantitative-easing": {
    term: "Quantitative easing (QE)",
    short: "A central bank creating new money to buy bonds, pushing down long-term rates when short rates are already near zero.",
    url: "https://en.wikipedia.org/wiki/Quantitative_easing",
  },
  "quantitative-tightening": {
    term: "Quantitative tightening (QT)",
    short: "The reverse of QE — a central bank shrinking its bond holdings and draining money from the system.",
    url: "https://en.wikipedia.org/wiki/Quantitative_tightening",
  },
  "zirp": {
    term: "Zero interest-rate policy",
    short: "Holding policy rates near 0% to stimulate borrowing and investment.",
    url: "https://en.wikipedia.org/wiki/Zero_interest-rate_policy",
  },
  "negative-interest-rate": {
    term: "Negative interest rates",
    short: "Rates below zero, where lenders effectively pay to lend — seen in Switzerland, Japan and the euro area in the 2010s.",
    url: "https://en.wikipedia.org/wiki/Negative_interest_rate",
  },
  "sovereign-debt": {
    term: "Sovereign debt",
    short: "Debt issued by national governments; doubts about repayment can spark a crisis.",
    url: "https://en.wikipedia.org/wiki/Government_debt",
  },
  "ecb": {
    term: "European Central Bank",
    short: "The central bank that sets monetary policy for the euro area.",
    url: "https://en.wikipedia.org/wiki/European_Central_Bank",
  },
  "opec": {
    term: "OPEC",
    short: "The oil-producing cartel whose 1970s supply cuts triggered global oil shocks.",
    url: "https://en.wikipedia.org/wiki/OPEC",
  },
  "oil-shock": {
    term: "Oil shock",
    short: "A sudden jump in oil prices that ripples through the economy as inflation and, often, recession.",
    url: "https://en.wikipedia.org/wiki/1973_oil_crisis",
  },
  "phillips-curve": {
    term: "Phillips curve",
    short: "The proposed trade-off between unemployment and inflation — which broke down in the stagflationary 1970s.",
    url: "https://en.wikipedia.org/wiki/Phillips_curve",
  },
  "gdp": {
    term: "Gross Domestic Product",
    short: "The total output of an economy — the broadest single measure of economic activity.",
    url: "https://en.wikipedia.org/wiki/Gross_domestic_product",
  },

  // ---- valuation, risk & leverage ----
  "valuation": {
    term: "Valuation",
    short: "How expensive an asset is relative to fundamentals such as earnings or assets.",
    url: "https://en.wikipedia.org/wiki/Valuation_(finance)",
  },
  "cape": {
    term: "CAPE (Shiller P/E)",
    short: "Price divided by the 10-year average of inflation-adjusted earnings — a smoothed gauge of whether the market is cheap or dear.",
    url: "https://en.wikipedia.org/wiki/Cyclically_adjusted_price-to-earnings_ratio",
  },
  "equity-risk-premium": {
    term: "Equity risk premium",
    short: "The extra long-run return stocks pay over safe bonds, compensating investors for risk — the reward for patience Dimson documents across a century.",
    url: "https://en.wikipedia.org/wiki/Equity_premium_puzzle",
  },
  "leverage": {
    term: "Leverage",
    short: "Using borrowed money to magnify returns — and, on the way down, losses.",
    url: "https://en.wikipedia.org/wiki/Leverage_(finance)",
  },
  "margin": {
    term: "Buying on margin",
    short: "Borrowing from a broker to buy securities. Forced 'margin calls' can turn a decline into a crash.",
    url: "https://en.wikipedia.org/wiki/Margin_(finance)",
  },
  "systemic-risk": {
    term: "Systemic risk",
    short: "The danger that one institution's failure cascades through the entire financial system.",
    url: "https://en.wikipedia.org/wiki/Systemic_risk",
  },
  "balance-sheet-recession": {
    term: "Balance-sheet recession",
    short: "A slump where households and firms focus on paying down debt rather than spending — as in post-1990 Japan.",
    url: "https://en.wikipedia.org/wiki/Balance_sheet_recession",
  },

  // ---- theories ----
  "debt-deflation": {
    term: "Debt-deflation",
    short: "Irving Fisher's theory that falling prices raise the real value of debt, forcing distress selling that pushes prices lower still.",
    url: "https://en.wikipedia.org/wiki/Debt_deflation",
  },
  "minsky-moment": {
    term: "Minsky moment",
    short: "The tipping point when over-indebted investors must sell to cover their loans, collapsing the market — after Hyman Minsky.",
    url: "https://en.wikipedia.org/wiki/Minsky_moment",
  },
  "irrational-exuberance": {
    term: "Irrational exuberance",
    short: "Robert Shiller's phrase for the self-reinforcing over-optimism that inflates bubbles.",
    url: "https://en.wikipedia.org/wiki/Irrational_exuberance",
  },
  "efficient-market-hypothesis": {
    term: "Efficient-market hypothesis",
    short: "Eugene Fama's theory that prices already reflect all available information — the intellectual foil to bubble-and-psychology accounts.",
    url: "https://en.wikipedia.org/wiki/Efficient-market_hypothesis",
  },
  "kondratiev-wave": {
    term: "Kondratiev wave",
    short: "Proposed 40–60 year 'long waves' of growth driven by clusters of new technology (rail, electricity, IT).",
    url: "https://en.wikipedia.org/wiki/Kondratiev_wave",
  },
  "creative-destruction": {
    term: "Creative destruction",
    short: "Joseph Schumpeter's idea that innovation continually destroys old industries as it builds new ones.",
    url: "https://en.wikipedia.org/wiki/Creative_destruction",
  },
  "keynesian": {
    term: "Keynesian economics",
    short: "The school, after Keynes, favouring active government spending and policy to prop up demand in downturns.",
    url: "https://en.wikipedia.org/wiki/Keynesian_economics",
  },
  "monetarism": {
    term: "Monetarism",
    short: "Milton Friedman's school holding that the money supply is the dominant driver of inflation and the cycle.",
    url: "https://en.wikipedia.org/wiki/Monetarism",
  },

  // ---- indices & gauges referenced in the story ----
  "nasdaq": {
    term: "Nasdaq Composite",
    short: "A tech-heavy US stock index — the clearest lens on the dot-com bubble and later tech booms.",
    url: "https://en.wikipedia.org/wiki/Nasdaq_Composite",
  },
  "nikkei": {
    term: "Nikkei 225",
    short: "Japan's headline stock index. Its 1989 peak near 39,000 was not durably surpassed until 2024.",
    url: "https://en.wikipedia.org/wiki/Nikkei_225",
  },
  "vix": {
    term: "VIX (‘fear gauge’)",
    short: "The market's expected volatility over the next month, implied by options — it spikes during crashes.",
    url: "https://en.wikipedia.org/wiki/VIX",
  },

  // ---- people ----
  "keynes": {
    term: "John Maynard Keynes",
    short: "British economist (1883–1946), father of macroeconomics, who argued governments should spend to counter slumps.",
    url: "https://en.wikipedia.org/wiki/John_Maynard_Keynes",
  },
  "friedman": {
    term: "Milton Friedman",
    short: "American economist (1912–2006); his monetarism blamed the Depression on the Fed allowing the money supply to collapse.",
    url: "https://en.wikipedia.org/wiki/Milton_Friedman",
  },
  "irving-fisher": {
    term: "Irving Fisher",
    short: "American economist (1867–1947) who called stocks a 'permanently high plateau' just before the 1929 crash, then developed debt-deflation theory.",
    url: "https://en.wikipedia.org/wiki/Irving_Fisher",
  },
  "hyman-minsky": {
    term: "Hyman Minsky",
    short: "American economist (1919–1996) who argued that stability itself breeds instability as investors take on ever more debt.",
    url: "https://en.wikipedia.org/wiki/Hyman_Minsky",
  },
  "robert-shiller": {
    term: "Robert Shiller",
    short: "Nobel-winning economist who popularised the CAPE ratio and warned of 'irrational exuberance'. His dataset powers this app.",
    url: "https://en.wikipedia.org/wiki/Robert_J._Shiller",
  },
  "charles-kindleberger": {
    term: "Charles Kindleberger",
    short: "Economic historian, author of 'Manias, Panics, and Crashes', the classic anatomy of financial bubbles.",
    url: "https://en.wikipedia.org/wiki/Charles_P._Kindleberger",
  },
  "edgar-peters": {
    term: "Edgar Peters",
    short: "Analyst who applied the fractal market hypothesis and drew the cycles-vs-regimes distinction used in this course.",
    url: "https://en.wikipedia.org/wiki/Fractal_market_hypothesis",
  },
  "kondratiev": {
    term: "Nikolai Kondratiev",
    short: "Soviet economist (1892–1938) who proposed long, technology-driven economic waves — and was executed under Stalin.",
    url: "https://en.wikipedia.org/wiki/Nikolai_Kondratiev",
  },
  "schumpeter": {
    term: "Joseph Schumpeter",
    short: "Austrian economist (1883–1950), theorist of entrepreneurship and 'creative destruction'.",
    url: "https://en.wikipedia.org/wiki/Joseph_Schumpeter",
  },
  "fama": {
    term: "Eugene Fama",
    short: "Nobel-winning economist behind the efficient-market hypothesis.",
    url: "https://en.wikipedia.org/wiki/Eugene_Fama",
  },
  "dimson": {
    term: "Elroy Dimson",
    short: "Finance scholar whose 125-year, multi-country studies document the equity risk premium and the gap between growth and returns.",
    url: "https://en.wikipedia.org/wiki/Elroy_Dimson",
  },
  "reinhart-rogoff": {
    term: "Reinhart & Rogoff",
    short: "Economists Carmen Reinhart and Kenneth Rogoff, authors of 'This Time Is Different', a survey of eight centuries of financial crises.",
    url: "https://en.wikipedia.org/wiki/This_Time_Is_Different",
  },
  "volcker": {
    term: "Paul Volcker",
    short: "Fed chair (1979–1987) who crushed double-digit inflation by pushing interest rates near 20%.",
    url: "https://en.wikipedia.org/wiki/Paul_Volcker",
  },
  "greenspan": {
    term: "Alan Greenspan",
    short: "Fed chair 1987–2006, associated with easy money, the 1987 rescue, and the phrase 'irrational exuberance'.",
    url: "https://en.wikipedia.org/wiki/Alan_Greenspan",
  },
  "draghi": {
    term: "Mario Draghi",
    short: "ECB president who vowed in 2012 to do 'whatever it takes' to preserve the euro, ending the debt crisis.",
    url: "https://en.wikipedia.org/wiki/Mario_Draghi",
  },
};

export type GlossaryKey = keyof typeof GLOSSARY;
