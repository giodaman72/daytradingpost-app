export type SitePage = {
  kicker: string;
  title: string;
  description: string;
  status: string;
  highlights: readonly string[];
  actionHref: string;
  actionLabel: string;
};

export const sitePages = {
  academy: {
    kicker: "Trading academy",
    title: "Build a stronger trading process.",
    description:
      "Structured lessons are being developed to help traders understand market structure, technical analysis and disciplined risk management.",
    status: "First learning paths coming soon",
    highlights: [
      "Market foundations without the jargon",
      "Practical technical-analysis frameworks",
      "Position sizing and capital protection",
    ],
    actionHref: "/#academy",
    actionLabel: "Preview the curriculum",
  },
  premium: {
    kicker: "DayTradingPost Premium",
    title: "A deeper daily market briefing.",
    description:
      "Premium membership will bring together detailed trade scenarios, technical levels, webinars and member-only learning resources.",
    status: "Founding enrollment opening soon",
    highlights: [
      "Daily multi-asset technical outlooks",
      "Detailed scenarios and invalidation levels",
      "Live educational sessions and replays",
    ],
    actionHref: "/#newsletter",
    actionLabel: "Get launch updates",
  },
  login: {
    kicker: "Member access",
    title: "The member area is not open yet.",
    description:
      "Sign-in will become available when founding memberships launch. Join the market brief to hear when access opens.",
    status: "Authentication coming with Premium",
    highlights: [
      "One account for briefings and academy content",
      "Saved resources and webinar access",
      "Secure membership management",
    ],
    actionHref: "/#newsletter",
    actionLabel: "Get launch updates",
  },
  webinars: {
    kicker: "Live education",
    title: "Market webinars built around the real session.",
    description:
      "Upcoming sessions will turn current price action into practical lessons on planning, execution and risk.",
    status: "Webinar calendar coming soon",
    highlights: [
      "Pre-market planning sessions",
      "Technical-analysis workshops",
      "Member Q&A and session replays",
    ],
    actionHref: "/#newsletter",
    actionLabel: "Hear about new sessions",
  },
  about: {
    kicker: "About DayTradingPost",
    title: "Independent intelligence for active traders.",
    description:
      "DayTradingPost is being built to make professional market context and practical trading education easier to use every day.",
    status: "Independent and education-first",
    highlights: [
      "Multi-asset market coverage",
      "Clear reasoning instead of signal chasing",
      "Risk awareness in every piece of content",
    ],
    actionHref: "/#analysis",
    actionLabel: "Explore the homepage",
  },
  contact: {
    kicker: "Contact",
    title: "Start a conversation with the team.",
    description:
      "Direct support channels are being prepared ahead of launch. Subscribe to the daily brief for product and contact updates.",
    status: "Support desk opening soon",
    highlights: [
      "Editorial questions and corrections",
      "Membership and account support",
      "Partnership and media enquiries",
    ],
    actionHref: "/#newsletter",
    actionLabel: "Stay informed",
  },
  privacy: {
    kicker: "Privacy",
    title: "Privacy terms are being finalized.",
    description:
      "The full policy will explain what information DayTradingPost collects, why it is used and how subscribers can control it.",
    status: "Policy publication pending",
    highlights: [
      "Plain-language data practices",
      "Clear consent and unsubscribe controls",
      "Limited collection tied to product needs",
    ],
    actionHref: "/",
    actionLabel: "Return home",
  },
  terms: {
    kicker: "Terms of use",
    title: "Clear terms before services open.",
    description:
      "The final terms will cover educational-content use, membership conditions and the risks associated with financial markets.",
    status: "Terms publication pending",
    highlights: [
      "Educational content, not personalized advice",
      "Transparent membership conditions",
      "Prominent market-risk disclosures",
    ],
    actionHref: "/",
    actionLabel: "Return home",
  },
  "markets/gold": {
    kicker: "Gold market",
    title: "Technical context for XAU/USD traders.",
    description:
      "Gold coverage will track trend structure, major price levels, momentum and the macro events that can reshape volatility.",
    status: "Dedicated coverage coming soon",
    highlights: [
      "Daily support and resistance mapping",
      "Trend and momentum scenarios",
      "Risk events affecting precious metals",
    ],
    actionHref: "/#markets",
    actionLabel: "View the market snapshot",
  },
  "markets/indices": {
    kicker: "Equity indices",
    title: "Read the structure behind index moves.",
    description:
      "Coverage will focus on major US indices, session structure and the levels active traders use to frame risk.",
    status: "Dedicated coverage coming soon",
    highlights: [
      "Nasdaq 100 and Dow Jones outlooks",
      "Opening-range and session context",
      "Catalysts shaping index volatility",
    ],
    actionHref: "/#markets",
    actionLabel: "View the market snapshot",
  },
  "markets/forex": {
    kicker: "Foreign exchange",
    title: "Practical context for major currency pairs.",
    description:
      "Forex coverage will combine technical structure with the economic calendar and cross-market drivers that matter most.",
    status: "Dedicated coverage coming soon",
    highlights: [
      "Major-pair technical outlooks",
      "Economic-event risk planning",
      "Dollar strength and cross-market context",
    ],
    actionHref: "/#markets",
    actionLabel: "View the market snapshot",
  },
  "markets/crypto": {
    kicker: "Digital assets",
    title: "Structured analysis for volatile crypto markets.",
    description:
      "Crypto coverage will map trend, liquidity and volatility scenarios without losing sight of disciplined risk management.",
    status: "Dedicated coverage coming soon",
    highlights: [
      "Bitcoin structure and key levels",
      "Volatility and liquidity scenarios",
      "Catalyst-aware risk planning",
    ],
    actionHref: "/#markets",
    actionLabel: "View the market snapshot",
  },
} as const satisfies Record<string, SitePage>;

export type SitePagePath = keyof typeof sitePages;

export const sitePagePaths = Object.keys(sitePages) as SitePagePath[];

export function isSitePagePath(path: string): path is SitePagePath {
  return Object.hasOwn(sitePages, path);
}
