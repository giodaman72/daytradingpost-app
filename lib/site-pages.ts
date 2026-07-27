export type SitePage = {
  kicker: string;
  title: string;
  description: string;
  status: string;
  highlights: readonly string[];
  actionHref: string;
  actionLabel: string;
  sections?: readonly {
    heading: string;
    paragraphs: readonly string[];
    items?: readonly string[];
  }[];
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
  webinars: {
    kicker: "Live education",
    title: "Market webinars built around the real session.",
    description:
      "Educational sessions connect market context with practical lessons on planning, execution and risk.",
    status: "No live session is currently scheduled",
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
      "Contact DayTradingPost about accounts, memberships, editorial corrections, privacy requests, or security concerns.",
    status: "Support and editorial contact",
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
    title: "How DayTradingPost handles personal information.",
    description:
      "This policy explains the information used to operate accounts, memberships, market tools, the Academy, and AI-assisted learning features.",
    status: "Effective July 26, 2026",
    highlights: [
      "Plain-language data practices",
      "Clear consent and unsubscribe controls",
      "Limited collection tied to product needs",
    ],
    actionHref: "/",
    actionLabel: "Return home",
    sections: [
      {
        heading: "Information we process",
        paragraphs: [
          "We process account identifiers, profile details you provide, authentication records, newsletter consent, membership status, and service activity needed to operate DayTradingPost.",
          "Learning features may store enrollments, progress, assessment submissions and results, bookmarks, private notes, reviews, notification preferences, and certificate snapshots. Private notes and individual assessment responses are not included in public analytics.",
          "AI features may store visible conversation messages, citations, feedback, model labels, token counts, and privacy-minimized operational telemetry. Passwords, authentication tokens, payment-card details, hidden prompts, and chain-of-thought are not stored in AI conversations.",
        ],
      },
      {
        heading: "How information is used",
        paragraphs: [
          "Information is used to provide and secure the service, enforce access entitlements, process membership state, personalize learning navigation, answer support requests, prevent abuse, measure aggregate product performance, and meet legal obligations.",
          "DayTradingPost does not sell private learner notes, assessment responses, or AI conversation content. Educational recommendations are based on verified learning activity and selected interests, not financial suitability profiling.",
        ],
      },
      {
        heading: "Service providers and payments",
        paragraphs: [
          "Supabase provides authentication and operational storage, Sanity provides editorial content storage, Vercel provides application hosting, and configured AI and market-data providers process bounded requests needed for their features.",
          "Revolut processes payment details. DayTradingPost stores payment references, subscription identifiers, plan and membership state, but does not store payment-card numbers.",
        ],
      },
      {
        heading: "Retention, security, and your choices",
        paragraphs: [
          "Records are retained only for documented product, security, audit, and legal purposes. Some audit and certificate records may be retained to preserve verification history. Account-erasure requests require review of records that must remain for legal or fraud-prevention reasons.",
          "You may update your profile, control supported notification preferences, unsubscribe from marketing messages, delete eligible AI conversations, and request access, correction, or deletion through the contact channel.",
          "No internet service is completely secure. DayTradingPost uses server-side authorization, row-level database security, least-privileged service credentials, input validation, and audit records to reduce risk.",
        ],
      },
    ],
  },
  terms: {
    kicker: "Terms of use",
    title: "Terms for using DayTradingPost.",
    description:
      "These terms govern access to DayTradingPost market information, educational content, memberships, community features, and AI tools.",
    status: "Effective July 26, 2026",
    highlights: [
      "Educational content, not personalized advice",
      "Transparent membership conditions",
      "Prominent market-risk disclosures",
    ],
    actionHref: "/",
    actionLabel: "Return home",
    sections: [
      {
        heading: "Educational use and market risk",
        paragraphs: [
          "DayTradingPost provides general educational and informational content. It does not provide personalized investment, legal, tax, or financial advice and does not recommend that any person enter a particular trade.",
          "Trading and leveraged products can result in substantial losses. You remain responsible for independent research, suitability decisions, risk controls, and compliance with laws that apply to you.",
        ],
      },
      {
        heading: "Accounts and acceptable use",
        paragraphs: [
          "You must provide accurate account information, protect your credentials, and notify DayTradingPost if you suspect unauthorized access. You are responsible for activity performed through your account.",
          "You may not bypass access controls, scrape protected content, probe the service for vulnerabilities without authorization, interfere with other users, upload malicious content, impersonate another person, or use the service unlawfully.",
        ],
      },
      {
        heading: "Memberships and third-party services",
        paragraphs: [
          "Premium access begins only after the configured payment workflow confirms or an authorized administrator verifies membership. Prices, currency, billing terms, and payment-provider conditions are shown during checkout.",
          "Cancellation, overdue status, refunds, and renewal rights are handled according to the checkout terms, applicable law, and the confirmed subscription state. Links to third-party services are subject to those providers' terms and availability.",
        ],
      },
      {
        heading: "Content, AI, and certificates",
        paragraphs: [
          "DayTradingPost content and branding may not be republished, resold, or used to build a competing dataset unless permission or applicable law allows it. You retain rights in content you submit, while granting the limited permission needed to operate the feature.",
          "AI responses can be incomplete or incorrect and must be checked against cited source material. Academy certificates confirm completion of educational material only; they are not accreditation, licensure, or evidence of trading competence or performance.",
        ],
      },
      {
        heading: "Availability and responsibility",
        paragraphs: [
          "Market data may be delayed, unavailable, or subject to provider corrections. The service may change, suspend, or remove features for security, legal, provider, or operational reasons.",
          "To the extent permitted by applicable law, DayTradingPost is provided without guarantees of uninterrupted availability, trading outcomes, or fitness for a particular purpose. Nothing in these terms excludes rights or liabilities that cannot legally be excluded.",
          "Material changes to these terms will be posted with an updated effective date. Continued use after changes take effect constitutes acceptance where permitted by law.",
        ],
      },
    ],
  },
  "markets/gold": {
    kicker: "Gold market",
    title: "Technical context for XAU/USD traders.",
    description:
      "Gold coverage will track trend structure, major price levels, momentum and the macro events that can reshape volatility.",
    status: "Verified coverage appears when available",
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
    status: "Verified coverage appears when available",
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
    status: "Verified coverage appears when available",
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
    status: "Verified coverage appears when available",
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
