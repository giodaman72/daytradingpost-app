import type { AssistantCitation } from "./ai-citation";
import type { AssistantContextMode } from "./ai-context";
import type { AssistantMessage } from "./ai-message";

export const ASSISTANT_INTENTS = [
  "education",
  "market_explanation",
  "article_summary",
  "general_market_analysis",
  "personalized_recommendation",
  "trade_execution",
  "guaranteed_return",
  "personal_position_sizing",
  "evasion",
  "prompt_injection",
  "unrelated",
] as const;

export type AssistantIntent = (typeof ASSISTANT_INTENTS)[number];
export type AssistantAccessLevel = "free" | "premium" | "admin";
export type AssistantSafetyFlag =
  | "financial_advice"
  | "guaranteed_return"
  | "hidden_prompt"
  | "personal_data"
  | "prompt_injection"
  | "trade_execution"
  | "unsafe_link";

export type AssistantConversation = {
  id: string;
  userId: string;
  title: string;
  status: "active" | "archived";
  contextMode: AssistantContextMode;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
};

export type AssistantRequest = {
  conversationId?: string | null;
  message: string;
  contextMode: AssistantContextMode;
  instrumentSlug?: string | null;
  articleSlug?: string | null;
  economicEventId?: string | null;
  watchlistId?: string | null;
  requestId: string;
};

export type AssistantProviderRequest = {
  messages: Pick<AssistantMessage, "role" | "content">[];
  systemInstructions: string;
  retrievedContext: string;
  userContext?: { accessLevel: AssistantAccessLevel };
  outputFormat: "markdown";
  maximumOutputTokens: number;
  temperature: number;
  requestId: string;
};

export type AssistantResponse = {
  conversationId: string;
  messageId: string;
  text: string;
  citations: AssistantCitation[];
  model: string;
  provider: string;
  finishReason: string;
  usage: { inputTokens: number; outputTokens: number };
  requestId: string;
  safetyFlags: AssistantSafetyFlag[];
  createdAt: string;
};

export type AssistantProviderResponse = Omit<
  AssistantResponse,
  "citations" | "conversationId" | "messageId" | "safetyFlags"
>;

export type AssistantStreamEvent =
  | { type: "start"; requestId: string; conversationId: string }
  | { type: "delta"; text: string }
  | { type: "complete"; response: AssistantResponse }
  | { type: "error"; code: string; message: string };
