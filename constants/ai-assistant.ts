import type { AssistantContextMode } from "@/types/ai-context";

export const ASSISTANT_LIMITS = {
  free: {
    dailyRequests: 5,
    historyDays: 30,
    maxConversations: 10,
    premiumSources: false,
    watchlistContext: false,
  },
  premium: {
    dailyRequests: 50,
    historyDays: 180,
    maxConversations: 100,
    premiumSources: true,
    watchlistContext: true,
  },
} as const;

export const ASSISTANT_CONTEXT_RULES: Record<
  AssistantContextMode,
  {
    citationRequired: boolean;
    premium: boolean;
    sources: readonly string[];
  }
> = {
  general_education: {
    citationRequired: true,
    premium: false,
    sources: ["academy", "article"],
  },
  market_analysis: {
    citationRequired: true,
    premium: false,
    sources: [
      "market_intelligence",
      "market_data",
      "article",
      "economic_event",
    ],
  },
  economic_event: {
    citationRequired: true,
    premium: false,
    sources: ["economic_event", "academy", "article"],
  },
  article_explanation: {
    citationRequired: true,
    premium: false,
    sources: ["article", "market_intelligence", "market_data"],
  },
  academy_tutor: {
    citationRequired: true,
    premium: false,
    sources: ["academy", "article"],
  },
  watchlist_summary: {
    citationRequired: true,
    premium: true,
    sources: [
      "watchlist",
      "market_intelligence",
      "market_data",
      "economic_event",
    ],
  },
  risk_management: {
    citationRequired: true,
    premium: false,
    sources: ["academy", "article", "market_intelligence"],
  },
};

export const ASSISTANT_SUGGESTED_PROMPTS = [
  "Summarize today’s Gold outlook.",
  "What are the key risks for Nasdaq today?",
  "Explain how CPI can affect the US dollar.",
  "Explain support and resistance using the Academy material.",
  "Create an educational checklist for reviewing a trade setup.",
] as const;

export function getAssistantLimits(hasPremiumAccess: boolean) {
  return hasPremiumAccess ? ASSISTANT_LIMITS.premium : ASSISTANT_LIMITS.free;
}
