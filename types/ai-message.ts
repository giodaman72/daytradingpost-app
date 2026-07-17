import type { AssistantCitation } from "./ai-citation";
import type { AssistantContextMode } from "./ai-context";

export const ASSISTANT_ROLES = ["user", "assistant"] as const;
export type AssistantRole = (typeof ASSISTANT_ROLES)[number];

export type AssistantMessage = {
  id: string;
  conversationId: string;
  userId: string;
  role: AssistantRole;
  content: string;
  citations: AssistantCitation[];
  contextMode: AssistantContextMode;
  model: string | null;
  provider: string | null;
  safetyFlags: string[];
  createdAt: string;
};
