import type { AssistantCitationSourceType } from "./ai-citation";

export const ASSISTANT_CONTEXT_MODES = [
  "general_education",
  "market_analysis",
  "economic_event",
  "article_explanation",
  "academy_tutor",
  "watchlist_summary",
  "risk_management",
] as const;

export type AssistantContextMode = (typeof ASSISTANT_CONTEXT_MODES)[number];

export type AssistantContextSource = {
  sourceType: AssistantCitationSourceType;
  sourceId: string;
  title: string;
  content: string;
  url: string;
  timestamp: string | null;
  premium: boolean;
  delayed: boolean;
  fixture: boolean;
  relevance: number;
};

export type RetrievalDocument = AssistantContextSource;

export type RetrievalResult = {
  documents: RetrievalDocument[];
  warnings: string[];
  generatedAt: string;
};
