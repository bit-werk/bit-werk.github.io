// The narrative course: "Market Cycles & Macroeconomics".
//
// A hand-authored, click-through history that threads the timeline's events into
// one story. Each chapter drives the chart — it zooms to a date range (`focus`),
// shows a chosen set of `series`, sets the `scale`, and (via `eventId`) lights up
// the matching entry in the Events panel. Body/observe text uses [[slug|label]]
// markup resolved against the glossary (see components/RichText.tsx).
//
// Editorial content — add, reorder or rewrite freely. `series` keys must match
// series.ts; `eventId` must match events.ts.

export interface CourseChapter {
  id: string;
  title: string;
  era: string; // short era label shown as a chip
  observe: string; // "what to look for" — one line, markup allowed
  body: string; // narrative; blank lines separate paragraphs; markup allowed
  series: string[]; // series keys to display for this chapter
  scale?: "log" | "linear";
  focus?: [string, string]; // ISO date range to zoom the chart to
  eventId?: string; // events.ts id to highlight, if this chapter covers one
}

export const CHAPTERS: CourseChapter[] = [
  {
    id: "intro",
    title: "How to read a market cycle",
    era: "Overview",
    observe:
      "The two lines are the same index — [[inflation|nominal]] vs. inflation-adjusted. On a [[secular-market|log]] scale, equal slopes mean equal percentage moves.",
    body:
      "Welcome. Over the next chapters we'll walk 150 years of stock-market history and the macroeconomics behind it — the booms, [[panic|panics]], wars and policy turns — and meet the thinkers who tried to explain them.\n\nEvery [[business-cycle|cycle]] has the same skeleton: a slow **expansion**, a **peak** where optimism turns to euphoria, a **contraction** or [[bear-market|bear market]], and a **trough** where despair bottoms out. What changes is the backdrop. [[edgar-peters|Edgar Peters]] draws a useful line between short [[business-cycle|cycles]] (the weather) and long [[regime|regimes]] (the climate) — an inflation era, a monetary system — that give each cycle its character.\n\nTwo habits before we start. First, watch the market in [[inflation|real]] terms, not just nominal — rising prices can flatter returns. Second, keep the chart on a log scale, so a crash in 1929 and one in 2020 are visually comparable. Ready? Step forward.",
    series: ["nominal", "real"],
    scale: "log",
    focus: ["1871-01-01", "2026-06-01"],
  },
  {
    id: "age-of-panics",
    title: "The age of panics & the birth of the Fed",
    era: "1871–1913",
    observe:
      "Repeated cliffs before 1913 — each a [[panic|banking panic]] with no [[central-bank|central bank]] to stop it.",
    body:
      "The late 1800s were an age of railroads, rapid growth — and violent [[panic|panics]]. With the economy on a [[gold-standard|gold standard]] and no [[central-bank|central bank]], a loss of confidence had nothing to arrest it: money was scarce, [[deflation|deflation]] common, and a run on one bank could topple many.\n\nBut did a dollar even exist yet? Yes — since 1792 — just not as one single thing issued by one authority. Money was a patchwork: gold and silver coin, paper [[greenback|greenbacks]] the Treasury had printed to fund the Civil War, and [[national-bank-note|national bank notes]] issued by hundreds of individual banks, each note backed by U.S. government bonds the bank had to deposit. (A generation earlier, under [[free-banking|'free banking']], private banks had printed their own dollars redeemable in gold.) What was missing was anyone whose job was to manage the *quantity* of money.\n\nBecause the supply was tied to [[gold-standard|gold]], the currency was **inelastic** — it couldn't grow when everyone suddenly wanted cash at once. Every autumn, as farmers drew money to move the harvest, the system tightened; add a scare and interest rates would spike, forcing a scramble for cash that could snowball into a full-blown panic. Furnishing the nation an [[elastic-currency|'elastic currency']] would become the Federal Reserve's very reason for being.\n\nThe [[recession|Long Depression]] began with the panic of 1873; another struck in 1893. Then came the **Panic of 1907**, when a failed speculation triggered runs on the trust companies. There was no [[lender-of-last-resort|lender of last resort]] — so the financier J.P. Morgan became one himself, locking bankers in his library until they funded a rescue.\n\nThe lesson stuck. In 1913 the United States created the **Federal Reserve** to be the lender of last resort the 1907 panic had lacked. Nearly every policy episode later in this course flows from that institution.",
    series: ["nominal"],
    scale: "log",
    focus: ["1871-01-01", "1916-01-01"],
    eventId: "panic-1907",
  },
  {
    id: "roaring-twenties",
    title: "War, boom, and the first great bubble",
    era: "1914–1929",
    observe:
      "[[cape|CAPE]] climbing toward the low-30s into 1929 — the market getting historically expensive.",
    body:
      "The First World War shut the New York Stock Exchange for over four months in 1914 and left the US the world's creditor. What followed was the **Roaring Twenties**: cars, radio and electricity powered a boom, and stocks rose roughly six-fold.\n\nMuch of it was borrowed. Ordinary investors were [[margin|buying on margin]] — a few dollars down, the rest on credit — which is rocket fuel on the way up and dynamite on the way down. Turn on [[cape|CAPE]]: this smoothed [[valuation|valuation]] gauge, later popularised by [[robert-shiller|Robert Shiller]], stretched toward the low-30s, territory that has always signalled danger.\n\nAt the peak the economist [[irving-fisher|Irving Fisher]] famously declared stocks had reached “a permanently high plateau.” He was days from being spectacularly wrong.",
    series: ["nominal", "cape"],
    scale: "log",
    focus: ["1912-01-01", "1931-01-01"],
    eventId: "roaring-20s",
  },
  {
    id: "great-depression",
    title: "The Great Crash & the Depression",
    era: "1929–1939",
    observe:
      "The [[inflation|real]] line falling ~85% into 1932 — and how long it stays down.",
    body:
      "In October 1929 the market broke. But the crash was the beginning, not the end: over the next three years stocks lost about **85%** of their value and a third of the banks failed. This was the [[depression|Great Depression]].\n\nWhy so deep? [[irving-fisher|Fisher]], ruined himself, explained it as [[debt-deflation|debt-deflation]]: as prices fell, the real weight of debt grew, forcing more selling and still lower prices. [[friedman|Milton Friedman]] later blamed the Federal Reserve for letting the [[monetarism|money supply]] collapse. And [[keynes|John Maynard Keynes]] argued that when private demand vanishes, only government spending can fill the hole — the birth of [[keynesian|Keynesian economics]] and the New Deal.\n\nWatch the real (inflation-adjusted) line: it would not durably reclaim its 1929 high for a quarter of a century. A premature policy tightening even caused a second slump in 1937. Cheap markets can stay cheap for a very long time.",
    series: ["nominal", "real", "cape"],
    scale: "log",
    focus: ["1926-01-01", "1945-01-01"],
    eventId: "crash-1929",
  },
  {
    id: "postwar-boom",
    title: "Bretton Woods & the post-war boom",
    era: "1945–1968",
    observe:
      "The long, steady climb of the real market alongside rising [[gdp|GDP]] — a rare calm [[regime|regime]].",
    body:
      "Out of the Second World War came a new order. At **Bretton Woods** in 1944 the major economies fixed their currencies to a gold-convertible US dollar — the [[bretton-woods|Bretton Woods system]] — giving the world two decades of monetary stability.\n\nWhat followed was one of history's great [[secular-market|secular bull markets]]: from 1949 to the late 1960s stocks rose steadily on strong growth, low [[inflation|inflation]] and rebuilding. Turn on [[gdp|GDP]] and see the economy and the market climb together — the calm 'climate' in which ordinary [[business-cycle|business cycles]] played out mildly.\n\nEnjoy the quiet. The next [[regime|regime]] would be anything but.",
    series: ["real", "gdp"],
    scale: "log",
    focus: ["1942-01-01", "1971-01-01"],
    eventId: "wwii",
  },
  {
    id: "stagflation",
    title: "Stagflation: the inflation regime",
    era: "1966–1982",
    observe:
      "[[inflation|Inflation]] and [[oil-shock|oil]] surging together while the real market goes nowhere for years.",
    body:
      "The stable regime broke in the late 1960s. Heavy spending on the Vietnam War and social programs overheated the economy, and in 1971 President Nixon ended the dollar's link to gold — the [[bretton-woods|Bretton Woods]] system collapsed and money became pure fiat. Turn on gold: fixed for decades, it was suddenly free to soar.\n\nThen came the [[oil-shock|oil shocks]] — an [[opec|OPEC]] embargo in 1973 and the Iranian Revolution in 1979 — which sent crude and [[inflation|inflation]] spiralling. The result was [[stagflation|stagflation]]: stagnant growth *and* high inflation at once, a combination the prevailing [[phillips-curve|Phillips curve]] said shouldn't exist. The real market lost roughly half its value across a brutal 1973–74 [[bear-market|bear market]] and drifted for a decade.\n\nThis is [[edgar-peters|Peters']] point in action: the *cycles* still came, but the high-inflation *regime* changed their whole character.",
    series: ["real", "gold", "inflation"],
    scale: "log",
    focus: ["1964-01-01", "1984-01-01"],
    eventId: "nixon-shock",
  },
  {
    id: "volcker-bull",
    title: "Volcker breaks inflation, a great bull begins",
    era: "1979–1990",
    observe:
      "The [[interest-rate|fed funds rate]] spiking near 20%, then [[inflation|inflation]] and long [[yield|yields]] falling for a generation.",
    body:
      "To kill inflation, Fed chair [[volcker|Paul Volcker]] did the previously unthinkable: he raised the [[interest-rate|fed funds rate]] toward **20%**, deliberately causing back-to-back recessions in 1980–82. Watch the red rate line spike, then inflation break.\n\nIt worked, and it opened a new [[regime|regime]]. From 1982, falling inflation and falling rates lit one of the largest [[secular-market|secular bull markets]] ever. Bonds began a decades-long rally too — long [[yield|yields]] would grind from ~15% toward zero. Even the 1987 **Black Monday** crash, the worst single day in history, barely dented the economy and was recovered within two years.\n\nCheap money and disinflation would define investing for the next 40 years.",
    series: ["nominal", "fedFunds", "longRate", "inflation"],
    scale: "log",
    focus: ["1977-01-01", "1992-01-01"],
    eventId: "volcker",
  },
  {
    id: "japan-bubble",
    title: "Japan's bubble: a cautionary tale",
    era: "1985–2010",
    observe:
      "The [[nikkei|Nikkei]] peaking near 39,000 in 1989 — and still below it decades later.",
    body:
      "While America boomed, Japan inflated the biggest [[bubble|asset bubble]] of the era. Cheap credit sent the [[nikkei|Nikkei 225]] toward **39,000** by the end of 1989 and Tokyo land prices to absurd heights; at the peak Japanese equities briefly led the world.\n\nThen it burst — and kept bursting. Japan fell into a [[balance-sheet-recession|balance-sheet recession]]: companies and households spent years paying down debt instead of investing, and mild [[deflation|deflation]] set in. The central bank cut rates to zero and beyond — an early preview of the [[negative-interest-rate|negative rates]] and [[quantitative-easing|QE]] the West would later adopt. Turn on the Japanese 10-year yield to see it pinned near zero for decades.\n\nThe punchline: the Nikkei did not durably surpass its 1989 high until **2024** — a 35-year round trip, and the ultimate lesson that a bubble's price can take a lifetime to recover.",
    series: ["japanIndex", "jp10y"],
    scale: "log",
    focus: ["1984-01-01", "2012-01-01"],
    eventId: "japan-peak",
  },
  {
    id: "dotcom",
    title: "Globalization & the dot-com mania",
    era: "1991–2002",
    observe:
      "The [[nasdaq|Nasdaq]] going near-vertical while [[cape|CAPE]] hits an all-time high around 44.",
    body:
      "The 1990s brought the end of the Cold War, a wave of globalization — capped by China joining the WTO in 2001 — and a technology revolution. The internet lit a mania: the tech-heavy [[nasdaq|Nasdaq]] rose roughly five-fold, and [[cape|CAPE]] reached an all-time high near **44**, richer even than 1929.\n\n[[robert-shiller|Robert Shiller]] named the mood in a 2000 book, [[irrational-exuberance|Irrational Exuberance]] — published almost exactly at the top. The counter-argument came from [[fama|Eugene Fama]], whose [[efficient-market-hypothesis|efficient-market hypothesis]] held that prices already embed all information and 'bubbles' are hard to call in advance. History sided with Shiller this time.\n\nThe [[bubble|bubble]] burst in 2000; by late 2002 the Nasdaq had fallen about **78%**. As [[charles-kindleberger|Kindleberger]] chronicled, the script — new technology, easy credit, euphoria, [[mean-reversion|reversion]] — is centuries old.",
    series: ["nasdaq", "cape"],
    scale: "log",
    focus: ["1993-01-01", "2004-01-01"],
    eventId: "dotcom-bubble",
  },
  {
    id: "gfc",
    title: "Cheap money & the Global Financial Crisis",
    era: "2003–2009",
    observe:
      "The [[vix|VIX]] 'fear gauge' erupting above 60 as the market halves — then rates cut to zero.",
    body:
      "After the dot-com bust the Fed under [[greenspan|Alan Greenspan]] cut rates hard, and the money flowed into housing. Banks packaged risky mortgages into complex securities and piled on [[leverage|leverage]] — the [[credit-cycle|credit cycle]] at its most extreme.\n\nThis is the world [[hyman-minsky|Hyman Minsky]] predicted: stability breeds risk-taking until debt becomes fragile, and a **Minsky moment** arrives when everyone must sell at once. In September 2008 Lehman Brothers failed, [[systemic-risk|systemic risk]] went global, and the S&P 500 fell about **57%**. Turn on the [[vix|VIX]] — the fear gauge spiked above 60, a level unseen until 2020.\n\nThe response rewrote the [[monetary-policy|monetary policy]] rulebook: rates slashed to zero and, for the first time in the US, [[quantitative-easing|quantitative easing]].",
    series: ["nominal", "vix", "fedFunds"],
    scale: "log",
    focus: ["2003-01-01", "2011-01-01"],
    eventId: "gfc",
  },
  {
    id: "everything-rally",
    title: "The everything rally: QE, ZIRP & the euro crisis",
    era: "2009–2020",
    observe:
      "US and [[yield|euro-area/Swiss yields]] grinding toward — and below — zero as stocks climb for a decade.",
    body:
      "The 2010s were the age of cheap money. With rates near zero ([[zirp|ZIRP]]) and central banks buying bonds ([[quantitative-easing|QE]]), the longest US bull market in history unfolded on a wall of worry.\n\nEurope nearly broke it. From 2010 a [[sovereign-debt|sovereign-debt]] crisis threatened Greece and the euro itself; turn on the euro-area 10-year yield to see the stress. It calmed only when [[draghi|Mario Draghi]] of the [[ecb|ECB]] pledged to do 'whatever it takes' in 2012. Rates fell so far that Swiss, Japanese and euro-area [[yield|yields]] went **negative** — lenders paying to lend, an idea that would have seemed absurd a generation earlier.\n\nIn the background, a new asset was born from the ashes of 2008: Bitcoin. The decade set the stage — abundant liquidity, zero rates — for what came next.",
    series: ["nominal", "longRate", "eu10y", "ch10y"],
    scale: "log",
    focus: ["2009-01-01", "2020-06-01"],
    eventId: "euro-debt-crisis",
  },
  {
    id: "pandemic-inflation",
    title: "Pandemic, inflation's return & a new regime?",
    era: "2020–present",
    observe:
      "[[inflation|Inflation]] and the [[interest-rate|fed funds rate]] leaping together in 2022 — the first since Volcker.",
    body:
      "In early 2020 the pandemic caused the fastest crash of its kind — down ~34% in weeks — met by the largest [[fiscal-policy|fiscal]] and [[monetary-policy|monetary]] stimulus ever. Markets rebounded just as fast, and 2021 became an 'everything bubble': meme stocks, and Bitcoin near $69,000. Turn it on.\n\nThen the bill arrived. In 2022 [[inflation|inflation]] hit 40-year highs and the Fed launched its fastest hiking cycle since [[volcker|Volcker]] — worsened by Russia's invasion of Ukraine, which spiked energy and food. Stocks and bonds fell **together**, punishing the '60/40' portfolio, and Bitcoin lost ~75%. Watch inflation and the fed funds rate leap in tandem.\n\nThe deeper question is whether the 40-year [[disinflation|disinflation]] [[regime|regime]] — falling inflation, ever-cheaper money — has ended, and a new one begun.",
    series: ["nominal", "inflation", "fedFunds", "bitcoin"],
    scale: "log",
    focus: ["2019-01-01", "2026-06-01"],
    eventId: "covid",
  },
  {
    id: "synthesis",
    title: "What every cycle has in common",
    era: "Synthesis",
    observe:
      "[[cape|CAPE]] against 150 years of real prices — see how extremes of [[valuation|valuation]] tend to [[mean-reversion|revert]].",
    body:
      "Step back to the whole sweep. Across 150 years the details differ but the anatomy rhymes: easy [[credit-cycle|credit]] and a genuine story breed optimism, then [[leverage|leverage]] and [[irrational-exuberance|euphoria]], then a [[minsky-moment|Minsky moment]], [[panic|panic]], and finally a [[central-bank|central-bank]] rescue that seeds the next boom. [[reinhart-rogoff|Reinhart and Rogoff]] found the same script across eight centuries — and the four most expensive words remain [[this-time-is-different|“this time is different.”]]\n\nTurn on [[cape|CAPE]] against the real market: extremes of [[valuation|valuation]] — 1929, 2000, 2021 — tend to [[mean-reversion|revert]]. Underneath run [[kondratiev|Kondratiev's]] long technological waves (rail → electricity → IT → AI) and [[schumpeter|Schumpeter's]] 'creative destruction', while [[edgar-peters|Peters']] regimes reshape each cycle's character.\n\nYet the punchline from [[dimson|Elroy Dimson's]] century of data is optimistic: despite every crash on this chart, patient owners of stocks earned a large [[equity-risk-premium|equity risk premium]]. The cycles are the price of admission for the long climb. Now go explore the chart yourself.",
    series: ["real", "cape"],
    scale: "log",
    focus: ["1871-01-01", "2026-06-01"],
  },
];
