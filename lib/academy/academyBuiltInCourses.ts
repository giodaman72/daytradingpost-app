import type {
  AcademyCourse,
  AcademyCourseDetail,
  AcademyCurriculumLesson,
  AcademyCurriculumModule,
  AcademyLesson,
} from "@/types/academy";

const now = "2026-09-13T00:00:00.000Z";

const category = {
  id: "cat-technical-analysis",
  slug: "technical-analysis",
  title: "Technical Analysis",
};

const instructor = {
  id: "instructor-daytradingpost",
  name: "DayTradingPost Academy",
  professionalTitle: "Market analysis desk",
  slug: "daytradingpost-academy",
};

type BuiltInLessonSeed = {
  minutes: number;
  slug: string;
  summary: string;
  title: string;
  type?: "text" | "downloadable" | "chart-practice";
  body?: string;
};

type BuiltInModuleSeed = {
  description: string;
  lessons: BuiltInLessonSeed[];
  minutes: number;
  objectives: string[];
  slug: string;
  title: string;
};

type BuiltInCourseSeed = {
  accessLevel: "free" | "premium";
  difficulty: "beginner" | "intermediate" | "advanced";
  excerpt: string;
  featured: boolean;
  id: string;
  legacySlug?: string;
  objectives: string[];
  slug: string;
  tags: string[];
  targetAudience: string[];
  title: string;
  modules: BuiltInModuleSeed[];
};

function block(text: string) {
  return [
    {
      _key: text
        .slice(0, 12)
        .replace(/[^a-z0-9]/gi, "")
        .toLowerCase(),
      _type: "block",
      children: [
        {
          _key: "span",
          _type: "span",
          marks: [],
          text,
        },
      ],
      markDefs: [],
      style: "normal",
    },
  ];
}

const levelOneModules: BuiltInModuleSeed[] = [
  {
    description: "Start with the logic of technical analysis, the role of trend, and the debate between market efficiency and market behavior.",
    lessons: [
      {
        minutes: 18,
        slug: "the-basic-principle-of-technical-analysis-the-trend",
        summary: "Trend is the first decision. Price action should be read by direction, timeframe, and market condition before any setup is considered.",
        title: "The Basic Principle of Technical Analysis: The Trend",
        body: "Core idea: Trend is the first decision. Price action should be read by direction, timeframe, and market condition before any setup is considered.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Define the primary, secondary, short-term, and intraday trend on one current chart.",
      },
      {
        minutes: 18,
        slug: "academic-approaches-to-technical-analysis",
        summary: "Technical analysis has been studied through market efficiency, behavioral finance, and empirical testing. The lesson is to respect evidence and avoid blind belief.",
        title: "Academic Approaches to Technical Analysis",
        body: "Core idea: Technical analysis has been studied through market efficiency, behavioral finance, and empirical testing. The lesson is to respect evidence and avoid blind belief.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Write one chart-based claim and the evidence that would prove or disprove it.",
      },
      {
        minutes: 18,
        slug: "noise-traders-as-technical-traders",
        summary: "Markets include participants who act on perception, emotion, and patterns. Their behavior can create support, resistance, momentum, and crowd-driven moves.",
        title: "Noise Traders as Technical Traders",
        body: "Core idea: Markets include participants who act on perception, emotion, and patterns. Their behavior can create support, resistance, momentum, and crowd-driven moves.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Find one recent move where crowd behavior appears to have accelerated price.",
      },
      {
        minutes: 18,
        slug: "noise-traders-and-the-law-of-one-price",
        summary: "Similar assets can temporarily trade at different prices because perception, naming, liquidity, and behavior affect demand. Technical traders watch those gaps and adjustments.",
        title: "Noise Traders and the Law of One Price",
        body: "Core idea: Similar assets can temporarily trade at different prices because perception, naming, liquidity, and behavior affect demand. Technical traders watch those gaps and adjustments.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Compare two related markets or assets and note whether their movement confirms or diverges.",
      },
      {
        minutes: 18,
        slug: "being-right-or-making-money",
        summary: "Trading is not about proving an opinion right. The objective is to follow a process that survives mistakes, losses, and changing market conditions.",
        title: "Being Right or Making Money",
        body: "Core idea: Trading is not about proving an opinion right. The objective is to follow a process that survives mistakes, losses, and changing market conditions.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Write the rule that would get you out of a trade even if your original opinion still feels correct.",
      },
    ],
    minutes: 90,
    objectives: [
      "Understand trend as the foundation of technical analysis",
      "Recognize the behavioral and academic debate behind chart reading",
      "Separate opinions from process, confirmation, and risk control",
    ],
    slug: "theory-and-history-of-technical-analysis",
    title: "Theory and History of Technical Analysis",
  },
  {
    description: "Learn the markets and instruments Level 1 traders must recognize before reading charts or managing risk.",
    lessons: [
      {
        minutes: 16,
        slug: "markets-instruments-data-and-the-technical-analyst",
        summary: "Technical analysis can be applied across liquid markets, but each instrument has its own structure, data, trading hours, and risk behavior.",
        title: "Markets, Instruments, Data, and the Technical Analyst",
        body: "Core idea: Technical analysis can be applied across liquid markets, but each instrument has its own structure, data, trading hours, and risk behavior.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Choose one market and list what data, session, and contract details matter before analysis.",
      },
      {
        minutes: 16,
        slug: "indexes",
        summary: "Indexes summarize groups of securities and help traders read broad market direction, sector rotation, and relative leadership without analyzing every component.",
        title: "Indexes",
        body: "Core idea: Indexes summarize groups of securities and help traders read broad market direction, sector rotation, and relative leadership without analyzing every component.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Compare a major index with one sector or related market and identify which is leading.",
      },
      {
        minutes: 16,
        slug: "foreign-exchange-currencies",
        summary: "FX is traded in pairs. A currency chart always expresses relative strength between two economies, rates, flows, and risk preferences.",
        title: "Foreign Exchange: Currencies",
        body: "Core idea: FX is traded in pairs. A currency chart always expresses relative strength between two economies, rates, flows, and risk preferences.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Mark whether the base currency or quote currency is stronger on a current FX chart.",
      },
      {
        minutes: 16,
        slug: "fixed-income-and-bonds",
        summary: "Bond prices and yields move inversely. Rate expectations, inflation, credit risk, and policy shifts can influence equities, currencies, commodities, and risk appetite.",
        title: "Fixed Income and Bonds",
        body: "Core idea: Bond prices and yields move inversely. Rate expectations, inflation, credit risk, and policy shifts can influence equities, currencies, commodities, and risk appetite.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Look at a bond yield chart and note whether it supports or pressures risk assets.",
      },
      {
        minutes: 16,
        slug: "options",
        summary: "Options are derivative contracts affected by underlying price, time, strike, volatility, and demand. They help traders read hedging, leverage, and risk expectations.",
        title: "Options",
        body: "Core idea: Options are derivative contracts affected by underlying price, time, strike, volatility, and demand. They help traders read hedging, leverage, and risk expectations.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Identify whether options activity or volatility is warning of larger expected movement.",
      },
      {
        minutes: 16,
        slug: "understanding-implied-volatility",
        summary: "Implied volatility reflects the market price of expected movement. It can rise when traders demand protection or expect uncertainty ahead.",
        title: "Understanding Implied Volatility",
        body: "Core idea: Implied volatility reflects the market price of expected movement. It can rise when traders demand protection or expect uncertainty ahead.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Compare price direction with volatility direction and describe whether risk is expanding or contracting.",
      },
    ],
    minutes: 96,
    objectives: [
      "Identify the market before reading the chart",
      "Understand how indexes, FX, bonds, options, and volatility differ",
      "Use instrument context to improve risk decisions",
    ],
    slug: "markets-instruments-data-and-volatility",
    title: "Markets, Instruments, Data and Volatility",
  },
  {
    description: "Follow the charting section order: trend tools, moving averages, bar patterns, short-term structures, and volume.",
    lessons: [
      {
        minutes: 18,
        slug: "moving-averages",
        summary: "Moving averages smooth price to reveal trend direction, dynamic support or resistance, and possible regime shifts. They work best as context, not as isolated signals.",
        title: "Moving Averages",
        body: "Core idea: Moving averages smooth price to reveal trend direction, dynamic support or resistance, and possible regime shifts. They work best as context, not as isolated signals.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Add two moving averages to a chart and decide whether they confirm trend, range, or transition.",
      },
      {
        minutes: 18,
        slug: "chart-patterns",
        summary: "Patterns are bounded price structures. They matter only when they clarify context, breakout level, invalidation, and risk-to-reward.",
        title: "Chart Patterns",
        body: "Core idea: Patterns are bounded price structures. They matter only when they clarify context, breakout level, invalidation, and risk-to-reward.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Draw the boundary of one pattern and write the exact level that confirms or invalidates it.",
      },
      {
        minutes: 18,
        slug: "bar-chart-patterns",
        summary: "Classic bar patterns organize price compression, continuation, reversal, and breakout behavior. The pattern is useful only when the entry and exit are clear.",
        title: "Bar Chart Patterns",
        body: "Core idea: Classic bar patterns organize price compression, continuation, reversal, and breakout behavior. The pattern is useful only when the entry and exit are clear.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Find one triangle, double top/bottom, or range and mark the breakout and failure level.",
      },
      {
        minutes: 18,
        slug: "short-term-patterns",
        summary: "Short-term bars, gaps, wide-range bars, narrow-range bars, and candle behavior can help with timing, but they must be read inside the larger trend.",
        title: "Short-Term Patterns",
        body: "Core idea: Short-term bars, gaps, wide-range bars, narrow-range bars, and candle behavior can help with timing, but they must be read inside the larger trend.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Mark one short-term trigger and explain whether it agrees with the higher-timeframe direction.",
      },
      {
        minutes: 18,
        slug: "introduction-to-volume-analysis",
        summary: "Volume measures participation. Price shows direction, but volume helps judge conviction, confirmation, exhaustion, and potential failure.",
        title: "Introduction to Volume Analysis",
        body: "Core idea: Volume measures participation. Price shows direction, but volume helps judge conviction, confirmation, exhaustion, and potential failure.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Check whether volume expands with the trend or diverges from the latest price move.",
      },
    ],
    minutes: 90,
    objectives: [
      "Use moving averages and trend structure",
      "Turn patterns into rules",
      "Confirm price action with volume",
    ],
    slug: "charts-trends-and-patterns",
    title: "Charts, Trends and Patterns",
  },
  {
    description: "Use wave, cycle, relative strength, internal strength, and sentiment tools to confirm or reject a trade idea.",
    lessons: [
      {
        minutes: 16,
        slug: "introduction-to-the-wave-principle",
        summary: "Wave analysis studies rhythm and structure in price movement. It can support scenario planning, but it should be confirmed with other evidence.",
        title: "Introduction to the Wave Principle",
        body: "Core idea: Wave analysis studies rhythm and structure in price movement. It can support scenario planning, but it should be confirmed with other evidence.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Label a simple impulse or corrective move and write the alternate count that would invalidate it.",
      },
      {
        minutes: 16,
        slug: "foundations-of-cycle-theory",
        summary: "Cycles focus on timing. They can help identify when turns may develop, but should not be used without price and momentum confirmation.",
        title: "Foundations of Cycle Theory",
        body: "Core idea: Cycles focus on timing. They can help identify when turns may develop, but should not be used without price and momentum confirmation.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Mark a possible cycle low or high and list what price action must confirm it.",
      },
      {
        minutes: 16,
        slug: "measuring-market-strength",
        summary: "Market strength tools look beneath price to judge internal participation, momentum, confirmation, and divergence.",
        title: "Measuring Market Strength",
        body: "Core idea: Market strength tools look beneath price to judge internal participation, momentum, confirmation, and divergence.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Compare price with one strength indicator and decide whether it confirms or diverges.",
      },
      {
        minutes: 16,
        slug: "relative-strength-as-a-criterion-for-investment-selection",
        summary: "Relative strength helps select where capital is flowing. Stronger markets deserve more attention than laggards when building a watchlist.",
        title: "Relative Strength as a Criterion for Investment Selection",
        body: "Core idea: Relative strength helps select where capital is flowing. Stronger markets deserve more attention than laggards when building a watchlist.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Rank two instruments and select the stronger one based on relative performance.",
      },
      {
        minutes: 16,
        slug: "market-sentiment-and-technical-analysis",
        summary: "Sentiment influences how far price can move above or below perceived value. Technical analysis watches behavior, not just valuation models.",
        title: "Market Sentiment and Technical Analysis",
        body: "Core idea: Sentiment influences how far price can move above or below perceived value. Technical analysis watches behavior, not just valuation models.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Describe whether current price action looks driven by fear, confidence, or uncertainty.",
      },
      {
        minutes: 16,
        slug: "sentiment-measures-from-market-data",
        summary: "Market-based sentiment uses positioning, open interest, put/call behavior, volatility, and other traded data to infer crowd behavior.",
        title: "Sentiment Measures from Market Data",
        body: "Core idea: Market-based sentiment uses positioning, open interest, put/call behavior, volatility, and other traded data to infer crowd behavior.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Choose one market-based sentiment input and state whether it supports or warns against the trade.",
      },
      {
        minutes: 16,
        slug: "sentiment-measures-from-external-data",
        summary: "Survey and external sentiment data can show crowd expectations. Extremes can be useful, especially when combined with price confirmation.",
        title: "Sentiment Measures from External Data",
        body: "Core idea: Survey and external sentiment data can show crowd expectations. Extremes can be useful, especially when combined with price confirmation.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Compare a sentiment reading with price trend and decide whether the crowd is crowded or balanced.",
      },
    ],
    minutes: 112,
    objectives: [
      "Use confirmation tools without treating them as certainty",
      "Read strength, leadership, and divergence",
      "Combine price with sentiment evidence",
    ],
    slug: "advanced-confirmation-and-market-strength",
    title: "Advanced Confirmation and Market Strength",
  },
  {
    description: "Finish Level 1 with the probability and statistics needed to think in evidence, sample size, and risk.",
    lessons: [
      {
        minutes: 18,
        slug: "introduction-to-descriptive-statistics",
        summary: "Statistics helps traders summarize data, compare outcomes, and avoid being fooled by random noise or isolated examples.",
        title: "Introduction to Descriptive Statistics",
        body: "Core idea: Statistics helps traders summarize data, compare outcomes, and avoid being fooled by random noise or isolated examples.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Calculate or estimate average outcome, range, and variability for one repeated setup.",
      },
      {
        minutes: 18,
        slug: "introduction-to-probability",
        summary: "Markets are uncertain. Probability thinking keeps traders focused on sample size, expectancy, risk, and repeatable decisions instead of certainty.",
        title: "Introduction to Probability",
        body: "Core idea: Markets are uncertain. Probability thinking keeps traders focused on sample size, expectancy, risk, and repeatable decisions instead of certainty.\n\nPractical use: Apply the concept to one live or recent DayTradingPost market chart. Define the market condition, the evidence, the invalidation level, and the risk control before taking action.\n\nChart exercise: Write the probability-based reason for taking or skipping the next trade setup.",
      },
    ],
    minutes: 36,
    objectives: [
      "Understand why statistics matter to chart-based trading",
      "Think in probabilities instead of certainties",
      "Avoid overconfidence from small samples",
    ],
    slug: "basic-statistics-for-the-technical-analyst",
    title: "Basic Statistics for the Technical Analyst",
  },
];

const levelTwoModules: BuiltInModuleSeed[] = [
  {
    description:
      "Choose chart types and trend tools based on the market question you are trying to answer.",
    lessons: [
      {
        minutes: 20,
        slug: "time-tick-volume-and-market-profile",
        summary:
          "How time, tick, volume and market profile views change what the trader sees.",
        title: "Time, Tick, Volume and Market Profile Charts",
      },
      {
        minutes: 24,
        slug: "trend-systems-and-filters",
        summary:
          "Build trend-following logic with moving averages, ADX-style filters and market state.",
        title: "Trend Systems and Filters",
      },
    ],
    minutes: 44,
    objectives: [
      "Select a chart type for the decision being made",
      "Build cleaner trend rules with filters",
    ],
    slug: "chart-construction-and-trend",
    title: "Chart Construction and Trend Systems",
  },
  {
    description:
      "Turn momentum, volume, breadth and candles into repeatable trading conditions.",
    lessons: [
      {
        minutes: 22,
        slug: "momentum-oscillators-and-divergence",
        summary:
          "Use momentum to identify speed, exhaustion, divergence and timing zones.",
        title: "Momentum, Oscillators and Divergence",
      },
      {
        minutes: 24,
        slug: "volume-breadth-and-confirmation",
        summary:
          "Confirm breakouts and trends with participation and internal market strength.",
        title: "Volume, Breadth and Confirmation",
      },
      {
        minutes: 25,
        slug: "candles-and-short-term-patterns",
        summary:
          "Use single candles, multi-candle setups and short-term patterns as triggers.",
        title: "Candles and Short-Term Patterns",
      },
    ],
    minutes: 71,
    objectives: [
      "Use momentum without overtrading",
      "Add confirmation before committing risk",
      "Turn candles into rules, not guesses",
    ],
    slug: "confirmation-tools",
    title: "Momentum, Volume and Pattern Confirmation",
  },
  {
    description:
      "Use volatility, sentiment, statistics and intermarket context to decide which trades deserve attention.",
    lessons: [
      {
        minutes: 22,
        slug: "options-volatility-and-vix-context",
        summary:
          "Understand implied volatility and VIX context as risk and sentiment information.",
        title: "Options, Volatility and VIX Context",
      },
      {
        minutes: 22,
        slug: "sentiment-and-behavioral-biases",
        summary:
          "Read crowd behavior, perception biases and positioning as market inputs.",
        title: "Sentiment and Behavioral Biases",
      },
      {
        minutes: 25,
        slug: "correlation-regression-and-market-selection",
        summary:
          "Use correlation, regression, relative strength and intermarket analysis to select better markets.",
        title: "Correlation, Regression and Market Selection",
      },
    ],
    minutes: 69,
    objectives: [
      "Use volatility as context for risk and opportunity",
      "Recognize when sentiment supports or fights the setup",
      "Select markets instead of forcing trades",
    ],
    slug: "volatility-statistics-selection",
    title: "Volatility, Statistics and Market Selection",
  },
  {
    description:
      "Convert analysis into a testable trading system with rules, filters and evaluation discipline.",
    lessons: [
      {
        minutes: 28,
        slug: "backtesting-without-fooling-yourself",
        summary:
          "Avoid curve fitting, weak samples and attractive but fragile results.",
        title: "Backtesting Without Fooling Yourself",
      },
      {
        minutes: 30,
        slug: "system-design-checklist",
        summary:
          "Build entry, exit, stop, filter, market selection and review rules.",
        title: "System Design Checklist",
      },
      {
        minutes: 35,
        slug: "level-2-capstone-build-a-strategy",
        summary:
          "Document a rules-based trading strategy for a DayTradingPost market.",
        title: "Level 2 Capstone: Build a Strategy",
        type: "chart-practice",
      },
    ],
    minutes: 93,
    objectives: [
      "Design a testable system",
      "Evaluate a strategy with discipline",
      "Produce a practical strategy document",
    ],
    slug: "backtesting-and-system-design",
    title: "Backtesting and System Design",
  },
];

const levelThreeModules: BuiltInModuleSeed[] = [
  {
    description:
      "Professional trading starts with survival: risk rules, position sizing and validation.",
    lessons: [
      {
        minutes: 26,
        slug: "what-makes-a-system-tradable",
        summary:
          "Separate a good-looking setup from a system that can actually be traded.",
        title: "What Makes a System Tradable",
      },
      {
        minutes: 30,
        slug: "position-sizing-drawdown-and-ruin",
        summary:
          "Create position sizing, drawdown and risk-of-ruin guardrails.",
        title: "Position Sizing, Drawdown and Ruin",
      },
      {
        minutes: 28,
        slug: "statistical-validation-and-overfitting",
        summary:
          "Use hypothesis testing and confidence thinking without overfitting the past.",
        title: "Statistical Validation and Overfitting",
      },
    ],
    minutes: 84,
    objectives: [
      "Define tradability beyond signal quality",
      "Control risk at the portfolio and trade level",
      "Validate evidence without curve fitting",
    ],
    slug: "risk-and-validation",
    title: "Risk, Position Sizing and Validation",
  },
  {
    description:
      "Integrate relationships across markets, macro pressure and portfolio exposure.",
    lessons: [
      {
        minutes: 24,
        slug: "intermarket-relationships",
        summary:
          "Read how rates, dollar, gold, commodities, indexes and risk sentiment connect.",
        title: "Intermarket Relationships",
      },
      {
        minutes: 24,
        slug: "relative-rotation-and-market-selection",
        summary:
          "Use relative strength and rotation to decide where opportunity is strongest.",
        title: "Relative Rotation and Market Selection",
      },
      {
        minutes: 26,
        slug: "portfolio-performance-and-attribution",
        summary:
          "Review performance by decision type, market, setup and risk contribution.",
        title: "Portfolio Performance and Attribution",
      },
    ],
    minutes: 74,
    objectives: [
      "Read cross-market pressure",
      "Select markets through relative leadership",
      "Review performance like a trading desk",
    ],
    slug: "asset-relationships-and-portfolio",
    title: "Asset Relationships and Portfolio Management",
  },
  {
    description:
      "Control the trader, not just the chart: bias, bubbles, emotion and group behavior.",
    lessons: [
      {
        minutes: 23,
        slug: "bias-control-and-investor-psychology",
        summary:
          "Build routines to manage confirmation bias, loss aversion and emotional decisions.",
        title: "Bias Control and Investor Psychology",
      },
      {
        minutes: 24,
        slug: "bubble-recognition-and-de-bubbling",
        summary:
          "Recognize bubble anatomy and reduce exposure when narratives overpower evidence.",
        title: "Bubble Recognition and De-Bubbling",
      },
    ],
    minutes: 47,
    objectives: [
      "Identify behavioral errors before they affect execution",
      "Use bubble signals as risk information",
    ],
    slug: "behavioral-mastery",
    title: "Behavioral Mastery",
  },
  {
    description:
      "Bring volatility, multiple timeframes, patterns and execution rules into one complete plan.",
    lessons: [
      {
        minutes: 26,
        slug: "vix-hedging-and-volatility-signals",
        summary:
          "Use VIX and volatility tools for timing, hedging and risk awareness.",
        title: "VIX, Hedging and Volatility Signals",
      },
      {
        minutes: 30,
        slug: "multiple-timeframe-trade-planning",
        summary:
          "Align higher-timeframe context with lower-timeframe entries and exits.",
        title: "Multiple-Timeframe Trade Planning",
      },
      {
        minutes: 45,
        slug: "level-3-capstone-professional-trading-plan",
        summary:
          "Build a complete trading plan with market selection, rules, risk and review process.",
        title: "Level 3 Capstone: Professional Trading Plan",
        type: "chart-practice",
      },
    ],
    minutes: 101,
    objectives: [
      "Use volatility as an execution input",
      "Align multiple timeframes",
      "Complete a professional trading plan",
    ],
    slug: "execution-integration",
    title: "Execution Integration",
  },
];

const seeds: BuiltInCourseSeed[] = [
  {
    accessLevel: "free",
    difficulty: "beginner",
    excerpt:
      "A condensed foundation course that teaches the language of technical analysis: markets, trend, probability, chart reading, confirmation and trader mindset.",
    featured: true,
    id: "course-dtp-level-1-foundations",
    legacySlug: "technical-analysis-foundations",
    modules: levelOneModules,
    objectives: [
      "Read a chart through trend, structure and confirmation",
      "Understand why trading is probability-based",
      "Build a practical foundation before moving into strategy design",
    ],
    slug: "level-1-technical-analysis-foundations",
    tags: [
      "level-1",
      "foundations",
      "trend",
      "volume",
      "sentiment",
      "chart-patterns",
    ],
    targetAudience: [
      "New traders who need a guided path",
      "Premium prospects who need the DayTradingPost framework",
      "Self-directed traders who want a cleaner chart-reading process",
    ],
    title: "Level 1: Technical Analysis Foundations",
  },
  {
    accessLevel: "premium",
    difficulty: "intermediate",
    excerpt:
      "A premium strategy course that turns indicators, patterns, volatility, sentiment, statistics and market selection into rules-based trading methods.",
    featured: true,
    id: "course-dtp-level-2-applied-strategy",
    legacySlug: "applied-technical-analysis-strategy-design",
    modules: levelTwoModules,
    objectives: [
      "Convert technical tools into repeatable setups",
      "Confirm trades with momentum, volume, breadth and volatility",
      "Build and document a testable trading strategy",
    ],
    slug: "level-2-applied-technical-analysis-strategy-design",
    tags: [
      "level-2",
      "premium",
      "strategy",
      "backtesting",
      "momentum",
      "volatility",
    ],
    targetAudience: [
      "Premium members ready to build trading strategies",
      "Traders who know the basics but need execution rules",
      "Users who want practical templates for DayTradingPost markets",
    ],
    title: "Level 2: Applied Technical Analysis and Strategy Design",
  },
  {
    accessLevel: "premium",
    difficulty: "advanced",
    excerpt:
      "An advanced premium course for integrating risk, position sizing, intermarket context, portfolio review, behavioral control and multi-timeframe execution.",
    featured: true,
    id: "course-dtp-level-3-professional-execution",
    legacySlug: "professional-execution-risk-portfolio-integration",
    modules: levelThreeModules,
    objectives: [
      "Build a professional risk and execution framework",
      "Integrate intermarket and portfolio context",
      "Complete a full trading plan with review rules",
    ],
    slug: "level-3-professional-execution-risk-portfolio-integration",
    tags: [
      "level-3",
      "premium",
      "risk-management",
      "portfolio",
      "intermarket",
      "execution",
    ],
    targetAudience: [
      "Premium members ready for professional workflow",
      "Traders building a complete trading plan",
      "Advanced users focused on risk, review and execution quality",
    ],
    title: "Level 3: Professional Execution, Risk and Portfolio Integration",
  },
];

const builtInLessonBodyById = new Map<string, string>();
for (const seed of seeds)
  for (const module of seed.modules)
    for (const lesson of module.lessons)
      builtInLessonBodyById.set(
        `${seed.id}-${module.slug}-${lesson.slug}`,
        lesson.body ?? lesson.summary,
      );

function makeLessons(
  course: BuiltInCourseSeed,
  module: BuiltInModuleSeed,
): AcademyCurriculumLesson[] {
  return module.lessons.map((lesson, lessonIndex) => ({
    accessLevel: course.accessLevel,
    aiTutorEnabled: true,
    assessmentId: null,
    completionMode: "content-viewed",
    courseId: course.id,
    durationMinutes: lesson.minutes,
    id: `${course.id}-${module.slug}-${lesson.slug}`,
    learningObjectives: [
      lesson.summary,
      "Apply the idea to NAS100, S&P 500, gold, crude oil, FX or crypto charts.",
    ],
    lessonType: lesson.type ?? "text",
    moduleId: `${course.id}-${module.slug}`,
    order: lessonIndex + 1,
    prerequisiteLessonIds:
      lessonIndex === 0
        ? []
        : [
            `${course.id}-${module.slug}-${module.lessons[lessonIndex - 1].slug}`,
          ],
    requiredForCompletion: true,
    slug: lesson.slug,
    status: "published",
    summary: lesson.summary,
    title: lesson.title,
    version: 1,
  }));
}

function makeModules(course: BuiltInCourseSeed): AcademyCurriculumModule[] {
  return course.modules.map((module, moduleIndex) => ({
    accessLevel: course.accessLevel,
    courseId: course.id,
    description: module.description,
    durationMinutes: module.minutes,
    id: `${course.id}-${module.slug}`,
    learningObjectives: module.objectives,
    lessonIds: module.lessons.map(
      (lesson) => `${course.id}-${module.slug}-${lesson.slug}`,
    ),
    lessons: makeLessons(course, module),
    order: moduleIndex + 1,
    prerequisiteModuleIds:
      moduleIndex === 0
        ? []
        : [`${course.id}-${course.modules[moduleIndex - 1].slug}`],
    requiredForCompletion: true,
    slug: module.slug,
    status: "published",
    title: module.title,
    version: 1,
  }));
}

function baseCourse(seed: BuiltInCourseSeed): AcademyCourse {
  const durationMinutes = seed.modules.reduce(
    (total, module) => total + module.minutes,
    0,
  );
  return {
    accessLevel: seed.accessLevel,
    certificateEnabled: true,
    category,
    coverImage: null,
    description: block(
      `${seed.excerpt} This DayTradingPost course turns core technical-analysis concepts into a direct, guided path focused on practical chart reading, strategy design and risk-aware execution.`,
    ),
    difficulty: seed.difficulty,
    durationMinutes,
    excerpt: seed.excerpt,
    featured: seed.featured,
    id: seed.id,
    instructor,
    learningObjectives: seed.objectives,
    legacySlug: seed.legacySlug ?? null,
    moduleIds: seed.modules.map((module) => `${seed.id}-${module.slug}`),
    passingRequirements: {
      finalAssessmentId: null,
      minimumAssessmentPercent: null,
      requireAllRequiredLessons: true,
      requireAllRequiredModules: true,
    },
    prerequisiteCourseIds: seed.slug.includes("level-2")
      ? ["course-dtp-level-1-foundations"]
      : seed.slug.includes("level-3")
        ? ["course-dtp-level-2-applied-strategy"]
        : [],
    publishedAt: now,
    slug: seed.slug,
    status: "published",
    tags: seed.tags,
    targetAudience: seed.targetAudience,
    title: seed.title,
    updatedAt: now,
    version: 1,
  };
}

function detailCourse(seed: BuiltInCourseSeed): AcademyCourseDetail {
  return {
    ...baseCourse(seed),
    modules: makeModules(seed),
    seoDescription: seed.excerpt,
    seoImage: null,
    seoTitle: seed.title,
  };
}

export const builtInAcademyCourses = seeds.map(baseCourse);
export const builtInAcademyCourseDetails = seeds.map(detailCourse);

export function listBuiltInAcademyCourses(limit = 20, offset = 0) {
  return builtInAcademyCourses.slice(offset, offset + limit);
}

export function findBuiltInAcademyCourseBySlug(slug: string) {
  return (
    builtInAcademyCourseDetails.find((course) => course.slug === slug) ?? null
  );
}

export function findBuiltInAcademyCourseByLegacySlug(slug: string) {
  return (
    builtInAcademyCourseDetails.find((course) => course.legacySlug === slug) ??
    null
  );
}

export function findBuiltInAcademyLessonByCourseAndSlug(
  courseId: string,
  lessonSlug: string,
): AcademyLesson | null {
  const course = builtInAcademyCourseDetails.find(
    (item) => item.id === courseId,
  );
  const lesson = course?.modules
    .flatMap((module) => module.lessons)
    .find((item) => item.slug === lessonSlug);
  if (!course || !lesson) return null;
  const academyLesson: AcademyLesson = {
    accessLevel: lesson.accessLevel,
    aiTutorEnabled: lesson.aiTutorEnabled,
    body: block(
      builtInLessonBodyById.get(lesson.id) ??
        `${lesson.summary} Work through this lesson with one live or recent DayTradingPost market chart. Define the market condition, write the rule you would use, identify the common mistake, and record the risk control that must be in place before taking action.`,
    ),
    completionMode: lesson.completionMode,
    courseId: lesson.courseId,
    durationMinutes: lesson.durationMinutes,
    id: lesson.id,
    learningObjectives: lesson.learningObjectives,
    lessonType: lesson.lessonType as "text" | "downloadable" | "chart-practice",
    moduleId: lesson.moduleId,
    order: lesson.order,
    prerequisiteLessonIds: lesson.prerequisiteLessonIds,
    requiredForCompletion: lesson.requiredForCompletion,
    resources: [
      {
        accessLevel: lesson.accessLevel,
        copyrightNotice:
          "Original DayTradingPost educational worksheet. Not investment advice.",
        description: `Checklist for ${lesson.title}`,
        downloadable: false,
        fileSize: null,
        id: `${lesson.id}-checklist`,
        mimeType: "text/html",
        resourceType: "checklist",
        title: `${lesson.title} checklist`,
        url: `/academy/courses/${course.slug}/lessons/${lesson.slug}`,
        version: 1,
      },
    ],
    slug: lesson.slug,
    status: lesson.status,
    summary: lesson.summary,
    title: lesson.title,
    version: lesson.version,
    video: null,
  };
  return {
    ...academyLesson,
  };
}

export function mergeBuiltInAcademyCourses(courses: AcademyCourse[]) {
  const bySlug = new Map<string, AcademyCourse>();
  for (const course of builtInAcademyCourses) bySlug.set(course.slug, course);
  for (const course of courses) bySlug.set(course.slug, course);
  return Array.from(bySlug.values());
}
