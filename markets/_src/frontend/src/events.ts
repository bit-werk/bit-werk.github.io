// The narrative layer: a hand-authored timeline of major market events.
//
// This is editorial content (not fetched) — add, reorder, or rewrite freely.
// Events with an `end` are periods (rendered as a shaded band); events without
// are moments (rendered as a vertical line). Each has a short on-chart `tag`,
// a full `title`, a `text` story, and a link to read more.

export type EventType =
  | "bubble"
  | "bear"
  | "crash"
  | "peak"
  | "trough"
  | "policy"
  | "war" // periods (shaded band): major wars
  | "milestone"; // moments (line): geopolitical / economic / institutional turning points

export interface MarketEvent {
  id: string;
  date: string; // ISO, first of month — the moment, or the start of a period
  end?: string; // ISO — present for periods
  type: EventType;
  tag: string; // short label drawn on the chart
  title: string; // full title in the story panel
  text: string; // the narrative
  url: string;
}

// Colours by type. Point events use a line colour; periods use a fill.
export const POINT_COLOR: Record<EventType, string> = {
  crash: "#dc2626",
  peak: "#ea580c",
  trough: "#16a34a",
  policy: "#2563eb",
  bubble: "#d97706",
  bear: "#7c3aed",
  war: "#64748b",
  milestone: "#0d9488",
};
// Period fills: paled by default, stronger on hover.
export const AREA_FILL: Partial<Record<EventType, string>> = {
  bubble: "rgba(217,119,6,0.06)",
  bear: "rgba(124,58,237,0.06)",
  war: "rgba(100,116,139,0.07)",
};
export const AREA_FILL_STRONG: Partial<Record<EventType, string>> = {
  bubble: "rgba(217,119,6,0.22)",
  bear: "rgba(124,58,237,0.22)",
  war: "rgba(100,116,139,0.20)",
};

export const EVENTS: MarketEvent[] = [
  {
    id: "panic-1907",
    date: "1907-10-01",
    type: "crash",
    tag: "1907 Panic",
    title: "The Panic of 1907",
    text: "A run on trust companies in New York cascaded into a market collapse of nearly 50%. With no central bank, J.P. Morgan personally organised a rescue. The episode led directly to the creation of the Federal Reserve in 1913.",
    url: "https://en.wikipedia.org/wiki/Panic_of_1907",
  },
  {
    id: "fed-created",
    date: "1913-12-01",
    type: "milestone",
    tag: "Fed created",
    title: "The Federal Reserve is created",
    text: "In the wake of the 1907 Panic, Congress created the Federal Reserve in December 1913 to act as a lender of last resort and steward of the money supply. Nearly every policy moment later on this timeline — Volcker's rate shock, rate cuts, quantitative easing — flows from this one institution.",
    url: "https://en.wikipedia.org/wiki/Federal_Reserve",
  },
  {
    id: "wwi",
    date: "1914-08-01",
    end: "1918-11-01",
    type: "war",
    tag: "WWI",
    title: "World War I",
    text: "When war broke out in mid-1914 the New York Stock Exchange closed for over four months — its longest shutdown ever — to head off a panic. The United States emerged from the war transformed from a debtor into the world's leading creditor nation.",
    url: "https://en.wikipedia.org/wiki/World_War_I",
  },
  {
    id: "roaring-20s",
    date: "1921-08-01",
    end: "1929-09-01",
    type: "bubble",
    tag: "Roaring 20s",
    title: "The Roaring Twenties bull market",
    text: "Through the 1920s stocks rose roughly six-fold amid new technologies (cars, radio, electricity) and rampant margin-buying. Valuations stretched to extremes — note how CAPE climbed toward the low-30s by the peak.",
    url: "https://en.wikipedia.org/wiki/Roaring_Twenties",
  },
  {
    id: "crash-1929",
    date: "1929-10-01",
    type: "crash",
    tag: "1929 Crash",
    title: "The Wall Street Crash of 1929",
    text: "In late October 1929 the market broke, ending the 1920s boom. It was the start — not the bottom — of a slide that would erase ~85% of the market's value over the next three years.",
    url: "https://en.wikipedia.org/wiki/Wall_Street_Crash_of_1929",
  },
  {
    id: "depression-trough",
    date: "1932-06-01",
    type: "trough",
    tag: "1932 Bottom",
    title: "The Great Depression bottom",
    text: "By mid-1932 the market had fallen about 85% from its 1929 peak — the deepest bear market on record. Real prices would not durably reclaim the 1929 high for decades.",
    url: "https://en.wikipedia.org/wiki/Great_Depression",
  },
  {
    id: "wwii",
    date: "1939-09-01",
    end: "1945-09-01",
    type: "war",
    tag: "WWII",
    title: "World War II",
    text: "Equities bottomed in 1942, around the war's turning point, then began the long climb into the post-war boom. The war finally ended the Depression, cemented U.S. economic dominance, and set the stage for the Bretton Woods monetary order.",
    url: "https://en.wikipedia.org/wiki/World_War_II",
  },
  {
    id: "vietnam",
    date: "1965-03-01",
    end: "1973-01-01",
    type: "war",
    tag: "Vietnam",
    title: "The Vietnam War escalation",
    text: "Heavy 'guns and butter' spending through the late 1960s — a major war alongside expanded social programs — overheated the economy and helped ignite the inflation that would dominate the 1970s. Watch inflation begin its climb toward the end of this band.",
    url: "https://en.wikipedia.org/wiki/Vietnam_War",
  },
  {
    id: "nixon-shock",
    date: "1971-08-01",
    type: "policy",
    tag: "Nixon Shock",
    title: "The end of the gold standard",
    text: "In August 1971 the U.S. suspended the dollar's convertibility into gold, ending the Bretton Woods system. Watch the gold price: fixed for decades, it was now free to float — and soon soared.",
    url: "https://en.wikipedia.org/wiki/Nixon_shock",
  },
  {
    id: "bear-1973",
    date: "1973-01-01",
    end: "1974-10-01",
    type: "bear",
    tag: "1973–74 bear",
    title: "The 1973–74 oil-crisis bear market",
    text: "An OPEC oil embargo, surging inflation and the end of the 'Nifty Fifty' craze drove a ~45% decline. It was one of the worst bear markets since the 1930s — see inflation spiking alongside.",
    url: "https://en.wikipedia.org/wiki/1973%E2%80%9374_stock_market_crash",
  },
  {
    id: "oil-shock-1979",
    date: "1979-01-01",
    type: "milestone",
    tag: "Oil shock II",
    title: "The second oil shock (Iranian Revolution)",
    text: "The 1979 Iranian Revolution disrupted oil supply and sent crude prices sharply higher for the second time that decade. The spike fed already-high inflation — the immediate backdrop to Volcker's rate shock a year later. Turn on oil and inflation to see it.",
    url: "https://en.wikipedia.org/wiki/1979_oil_crisis",
  },
  {
    id: "volcker",
    date: "1980-04-01",
    type: "policy",
    tag: "Volcker",
    title: "Volcker breaks inflation",
    text: "To kill double-digit inflation, Fed chair Paul Volcker pushed the fed funds rate above 19%. Note the spike in both inflation and rates — the painful reset that set up the long bull market that followed.",
    url: "https://en.wikipedia.org/wiki/Paul_Volcker",
  },
  {
    id: "black-monday",
    date: "1987-10-01",
    type: "crash",
    tag: "Black Monday",
    title: "Black Monday, 1987",
    text: "On 19 October 1987 the market fell ~22% in a single day — the largest one-day percentage drop in history, amplified by computerised 'portfolio insurance' selling. Yet the economy barely blinked and stocks recovered within two years.",
    url: "https://en.wikipedia.org/wiki/Black_Monday_(1987)",
  },
  {
    id: "japan-peak",
    date: "1989-12-01",
    type: "peak",
    tag: "Japan peak",
    title: "Japan's asset bubble peaks",
    text: "At the end of 1989 the Nikkei 225 reached almost 39,000 amid a colossal stock-and-property bubble. It then collapsed into a decades-long slump — the index did not durably surpass that high again until 2024. Turn on the Nikkei 225 to see one of history's longest recoveries.",
    url: "https://en.wikipedia.org/wiki/Japanese_asset_price_bubble",
  },
  {
    id: "gulf-war",
    date: "1990-08-01",
    end: "1991-02-01",
    type: "war",
    tag: "Gulf War",
    title: "The Gulf War",
    text: "Iraq's invasion of Kuwait in August 1990 doubled oil prices within months and helped tip the U.S. into a brief recession. Prices fell back as quickly once the war was decided in early 1991 — a clean example of a geopolitical oil spike. Turn on oil to see it.",
    url: "https://en.wikipedia.org/wiki/Gulf_War",
  },
  {
    id: "dotcom-bubble",
    date: "1995-01-01",
    end: "2000-03-01",
    type: "bubble",
    tag: "Dot-com",
    title: "The dot-com bubble",
    text: "Internet euphoria sent the tech-heavy Nasdaq up roughly five-fold in five years. CAPE reached an all-time high near 44 — turn on the Nasdaq and CAPE to see the mania.",
    url: "https://en.wikipedia.org/wiki/Dot-com_bubble",
  },
  {
    id: "euro-launch",
    date: "1999-01-01",
    type: "milestone",
    tag: "Euro",
    title: "The euro is launched",
    text: "On 1 January 1999 eleven European countries adopted the euro as a single currency (notes and coins followed in 2002). It underpins the euro-area index and the shared bond market you can plot here — as well as the strains that surfaced in the 2010 debt crisis.",
    url: "https://en.wikipedia.org/wiki/Euro",
  },
  {
    id: "china-wto",
    date: "2001-12-01",
    type: "milestone",
    tag: "China WTO",
    title: "China joins the WTO",
    text: "China's December 2001 entry into the World Trade Organization accelerated globalization, turning it into the world's factory. The resulting industrial demand powered the 2000s commodity 'supercycle' — watch copper and world GDP climb through the decade.",
    url: "https://en.wikipedia.org/wiki/China_and_the_World_Trade_Organization",
  },
  {
    id: "dotcom-bust",
    date: "2002-10-01",
    type: "trough",
    tag: "2002 bottom",
    title: "The dot-com bust",
    text: "The bubble burst in 2000; by late 2002 the Nasdaq had lost about 78% of its value. A reminder that the steepest run-ups often precede the steepest falls.",
    url: "https://en.wikipedia.org/wiki/Dot-com_bubble#Aftermath",
  },
  {
    id: "gfc",
    date: "2007-10-01",
    end: "2009-03-01",
    type: "bear",
    tag: "GFC",
    title: "The Global Financial Crisis",
    text: "A U.S. housing-and-credit bubble collapsed; Lehman Brothers failed in September 2008. The S&P 500 fell ~57% from its 2007 peak, and the VIX 'fear gauge' spiked above 60 — its highest until 2020.",
    url: "https://en.wikipedia.org/wiki/2007%E2%80%932008_financial_crisis",
  },
  {
    id: "euro-debt-crisis",
    date: "2010-05-01",
    end: "2012-07-01",
    type: "bear",
    tag: "Euro debt crisis",
    title: "The European sovereign-debt crisis",
    text: "From 2010, fears that Greece and other euro-area states might default sent their bond yields soaring and threatened the currency itself. It calmed only when the ECB's Mario Draghi pledged to do 'whatever it takes' in July 2012. Watch euro-area 10-year yields spike.",
    url: "https://en.wikipedia.org/wiki/European_debt_crisis",
  },
  {
    id: "brexit",
    date: "2016-06-01",
    type: "milestone",
    tag: "Brexit",
    title: "The Brexit referendum",
    text: "On 23 June 2016 the U.K. voted to leave the European Union. The pound fell to a 30-year low overnight and UK gilt yields swung sharply — though the FTSE 100, whose members earn heavily overseas, was cushioned by the weaker pound.",
    url: "https://en.wikipedia.org/wiki/2016_United_Kingdom_European_Union_membership_referendum",
  },
  {
    id: "covid",
    date: "2020-03-01",
    type: "crash",
    tag: "COVID",
    title: "The COVID-19 crash",
    text: "In weeks during early 2020 the market fell ~34% as the pandemic froze the economy — the fastest crash of its kind. Massive Fed and fiscal stimulus drove an equally rapid recovery. The VIX again spiked near 60.",
    url: "https://en.wikipedia.org/wiki/2020_stock_market_crash",
  },
  {
    id: "inflation-2022",
    date: "2022-01-01",
    end: "2022-10-01",
    type: "bear",
    tag: "2022 bear",
    title: "The 2022 inflation bear market",
    text: "Post-pandemic inflation hit 40-year highs, forcing the fastest Fed rate-hiking cycle in decades. Stocks and bonds fell together and the S&P 500 dropped ~25% — watch inflation and the fed funds rate jump in tandem.",
    url: "https://en.wikipedia.org/wiki/2022_stock_market_decline",
  },
  {
    id: "russia-ukraine",
    date: "2022-02-01",
    end: "2026-06-01",
    type: "war",
    tag: "Ukraine war",
    title: "Russia's invasion of Ukraine",
    text: "Russia's full-scale invasion in February 2022 sent energy, wheat and metals prices surging, amplifying the post-pandemic inflation spike and the rate hikes behind the 2022 bear market. Gold and oil both moved on the shock. (Band extends to the present — the war is ongoing.)",
    url: "https://en.wikipedia.org/wiki/Russian_invasion_of_Ukraine",
  },
];
