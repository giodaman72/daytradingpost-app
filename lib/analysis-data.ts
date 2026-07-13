export type MarketBias = "Bullish" | "Neutral" | "Bearish";

export type AnalysisMarket = {
  slug: string;
  name: string;
  symbol: string;
  assetClass: string;
  bias: MarketBias;
  samplePrice: string;
  summary: string;
  technicalOverview: string;
  supportLevels: readonly string[];
  resistanceLevels: readonly string[];
  bullishScenario: string;
  bearishScenario: string;
  riskFactors: readonly string[];
  tradePlanningNotes: readonly string[];
  accent: "gold" | "blue" | "orange" | "purple";
};

export const analysisMarkets = [
  {
    slug: "gold",
    name: "Gold",
    symbol: "XAU/USD",
    assetClass: "Commodities",
    bias: "Bullish",
    samplePrice: "4,112.40",
    summary:
      "Buyers continue to defend the broader advance while price holds above the latest breakout area.",
    technicalOverview:
      "The illustrative structure remains constructive above 4,075, with higher swing lows preserving upward pressure. Momentum is positive but extended near the upper boundary, so confirmation matters more than chasing strength. A sustained hold above the first resistance zone would keep the trend intact, while acceptance below primary support would signal a deeper rotation.",
    supportLevels: ["4,075", "4,042", "4,000"],
    resistanceLevels: ["4,145", "4,178", "4,220"],
    bullishScenario:
      "A controlled pullback that holds 4,075, followed by a reclaim of 4,145, would support continuation toward 4,178 and potentially 4,220. The stronger setup would pair the breakout with expanding momentum rather than a brief price spike.",
    bearishScenario:
      "A decisive close below 4,075 would weaken the near-term structure and expose 4,042. Failure to stabilize there could shift attention to the psychological 4,000 area and invalidate the immediate continuation thesis.",
    riskFactors: [
      "Unexpected moves in real yields or the US dollar",
      "Central-bank communication and inflation data",
      "Geopolitical headlines causing abrupt safe-haven flows",
    ],
    tradePlanningNotes: [
      "Wait for price acceptance at a listed level before defining risk.",
      "Avoid entering directly into resistance after an extended move.",
      "Size positions around the invalidation point, not the profit target.",
    ],
    accent: "gold",
  },
  {
    slug: "nasdaq",
    name: "Nasdaq 100",
    symbol: "NAS100",
    assetClass: "Indices",
    bias: "Bullish",
    samplePrice: "25,436.20",
    summary:
      "Technology strength keeps the index supported, but price is testing a supply zone where momentum may slow.",
    technicalOverview:
      "The illustrative index trend remains positive above 25,180, with buyers responding to shallow pullbacks. Price is now approaching a previous reaction high, making 25,520 the immediate decision area. Holding above rising support favors continuation, while a failed breakout could produce a broader mean-reversion move before the trend resumes.",
    supportLevels: ["25,180", "24,960", "24,700"],
    resistanceLevels: ["25,520", "25,760", "26,000"],
    bullishScenario:
      "Acceptance above 25,520 would confirm that buyers absorbed overhead supply and could open a path toward 25,760. A pullback that retests 25,520 from above would offer cleaner structural confirmation than an impulsive breakout alone.",
    bearishScenario:
      "Repeated rejection from 25,520 followed by a break of 25,180 would indicate fading momentum. That sequence would expose 24,960 first, with 24,700 becoming relevant if selling broadens across large-cap technology.",
    riskFactors: [
      "Large-cap earnings surprises and guidance revisions",
      "Interest-rate repricing and bond-market volatility",
      "Concentrated index leadership reversing quickly",
    ],
    tradePlanningNotes: [
      "Track breadth alongside the index before trusting a breakout.",
      "Respect opening-session volatility around major US data.",
      "Reduce leverage when price is trapped between 25,180 and 25,520.",
    ],
    accent: "blue",
  },
  {
    slug: "crude-oil",
    name: "Crude Oil",
    symbol: "WTI",
    assetClass: "Commodities",
    bias: "Neutral",
    samplePrice: "78.64",
    summary:
      "Crude is balancing supply concerns against uncertain demand, leaving price inside a defined technical range.",
    technicalOverview:
      "The illustrative WTI structure is neutral between 76.80 and 80.20. Short-term momentum improved after buyers defended the lower half of the range, but the market has not yet established acceptance above resistance. Until either boundary breaks with follow-through, responsive trades at the edges remain more coherent than trend assumptions in the middle.",
    supportLevels: ["77.40", "76.80", "75.25"],
    resistanceLevels: ["79.35", "80.20", "81.75"],
    bullishScenario:
      "A break and hold above 80.20 would resolve the range upward and bring 81.75 into focus. A constructive retest of 79.35 after the breakout would strengthen the case that former resistance has become support.",
    bearishScenario:
      "Failure below 79.35 followed by a loss of 77.40 would return pressure to 76.80. Acceptance beneath the range floor would suggest that sellers control the auction and could extend the move toward 75.25.",
    riskFactors: [
      "OPEC+ production headlines and compliance signals",
      "Weekly inventory data and refinery utilization",
      "Geopolitical disruptions or sudden demand revisions",
    ],
    tradePlanningNotes: [
      "Treat the center of the range as lower-quality location.",
      "Account for inventory-report volatility before placing stops.",
      "Require follow-through beyond 76.80 or 80.20 before adopting a trend bias.",
    ],
    accent: "orange",
  },
  {
    slug: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC/USD",
    assetClass: "Digital assets",
    bias: "Neutral",
    samplePrice: "118,420",
    summary:
      "Bitcoin is consolidating beneath resistance as traders wait for a catalyst to resolve the current compression.",
    technicalOverview:
      "The illustrative market is compressing between 115,800 and 121,500 after a strong directional move. Momentum has cooled without producing a clear structural breakdown, leaving the short-term bias neutral. A confirmed escape from the range should matter more than intraday movement within it, where false breaks and rapid reversals remain likely.",
    supportLevels: ["116,800", "115,800", "112,500"],
    resistanceLevels: ["120,000", "121,500", "125,000"],
    bullishScenario:
      "A sustained move above 121,500 would end the consolidation and reopen the path toward 125,000. Ideally, volume would expand and price would hold the breakout level during a retest instead of immediately returning to the range.",
    bearishScenario:
      "A loss of 115,800 would break the range floor and shift focus toward 112,500. If that support also fails, the probability of a larger corrective phase would increase materially.",
    riskFactors: [
      "Weekend liquidity gaps and forced liquidations",
      "Regulatory or exchange-specific headlines",
      "ETF flow changes and broader risk-asset volatility",
    ],
    tradePlanningNotes: [
      "Use smaller position sizes to account for continuous volatility.",
      "Avoid treating an intraday wick as a confirmed range break.",
      "Define risk before entry because slippage can expand during liquidation events.",
    ],
    accent: "purple",
  },
] as const satisfies readonly AnalysisMarket[];

export type AnalysisSlug = (typeof analysisMarkets)[number]["slug"];

export function getAnalysisMarket(slug: string) {
  return analysisMarkets.find((market) => market.slug === slug);
}
