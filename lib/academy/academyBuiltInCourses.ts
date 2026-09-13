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
    description:
      "Understand what technical analysis studies and why price, volume and behavior matter.",
    lessons: [
      {
        minutes: 14,
        slug: "what-technical-analysis-studies",
        summary:
          "A practical introduction to charts, market data and the technical analyst's job.",
        title: "What Technical Analysis Studies",
      },
      {
        minutes: 16,
        slug: "market-instruments-and-timeframes",
        summary:
          "How indexes, FX, commodities, crypto and bonds behave across different timeframes.",
        title: "Markets, Instruments and Timeframes",
      },
    ],
    minutes: 30,
    objectives: [
      "Separate technical analysis from prediction",
      "Identify the market and timeframe before reading a chart",
    ],
    slug: "market-basics",
    title: "Market Basics",
  },
  {
    description:
      "Use trend, support, resistance and moving averages to define market direction.",
    lessons: [
      {
        minutes: 18,
        slug: "the-trend-is-the-first-decision",
        summary:
          "A simple process for classifying bullish, bearish and range conditions.",
        title: "The Trend Is the First Decision",
      },
      {
        minutes: 18,
        slug: "moving-averages-as-structure",
        summary:
          "How to use moving averages as structure, filters and trade context.",
        title: "Moving Averages as Structure",
      },
    ],
    minutes: 36,
    objectives: [
      "Classify trend direction before looking for entries",
      "Use moving averages as context rather than standalone signals",
    ],
    slug: "trend-and-structure",
    title: "Trend and Structure",
  },
  {
    description:
      "Build the beginner's mental model: trading is probability, confirmation and risk.",
    lessons: [
      {
        minutes: 15,
        slug: "probability-not-certainty",
        summary:
          "Why one trade means little and a repeatable process matters more.",
        title: "Probability, Not Certainty",
      },
      {
        minutes: 20,
        slug: "volume-strength-and-sentiment",
        summary:
          "Use participation, relative strength and sentiment to confirm or reject a chart idea.",
        title: "Volume, Strength and Sentiment",
      },
      {
        minutes: 16,
        slug: "being-right-or-making-money",
        summary:
          "The difference between having an opinion and managing a profitable process.",
        title: "Being Right or Making Money",
      },
    ],
    minutes: 51,
    objectives: [
      "Think in sample size and expectancy",
      "Confirm price with participation and behavior",
      "Avoid opinion-based trading",
    ],
    slug: "confirmation-and-mindset",
    title: "Confirmation and Mindset",
  },
  {
    description:
      "Recognize common price structures without turning every chart into a forced pattern.",
    lessons: [
      {
        minutes: 22,
        slug: "chart-patterns-that-matter",
        summary:
          "Continuation, reversal and compression patterns translated into rules.",
        title: "Chart Patterns That Matter",
      },
      {
        minutes: 20,
        slug: "cycles-waves-and-market-rhythm",
        summary:
          "A short introduction to cycles and wave thinking as timing support.",
        title: "Cycles, Waves and Market Rhythm",
      },
      {
        minutes: 25,
        slug: "level-1-capstone-chart-read",
        summary:
          "Bring trend, structure, confirmation and risk awareness into one chart read.",
        title: "Level 1 Capstone: Read a Market",
        type: "chart-practice",
      },
    ],
    minutes: 67,
    objectives: [
      "Convert pattern recognition into trade context",
      "Use cycles and waves as support rather than certainty",
      "Complete a full beginner chart read",
    ],
    slug: "patterns-and-capstone",
    title: "Patterns and Capstone",
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
        downloadable: true,
        fileSize: null,
        id: `${lesson.id}-checklist`,
        mimeType: "application/msword",
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
