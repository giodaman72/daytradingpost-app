export const AI_CITATION_SOURCE_TYPES = [
  "article",
  "market_intelligence",
  "market_data",
  "economic_event",
  "academy",
  "watchlist",
] as const;

export type AssistantCitationSourceType =
  (typeof AI_CITATION_SOURCE_TYPES)[number];

export type AssistantCitation = {
  sourceType: AssistantCitationSourceType;
  sourceId: string;
  title: string;
  url: string;
  timestamp: string | null;
  section: string | null;
  delayed: boolean;
  premium: boolean;
  fixture: boolean;
  excerpt: string | null;
};
