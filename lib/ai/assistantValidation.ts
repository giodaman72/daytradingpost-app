import { getInstrument } from "@/constants/instruments";
import {
  ASSISTANT_CONTEXT_MODES,
  type AssistantContextMode,
} from "@/types/ai-context";
import type {
  AssistantFeedbackReason,
  AssistantFeedbackRating,
} from "@/types/ai-feedback";
import type { AssistantRequest } from "@/types/ai-assistant";
import { AssistantError } from "./assistantErrors";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SOURCE_ID = /^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,199}$/;

const text = (value: unknown) =>
  typeof value === "string" ? value.replace(/\u0000/g, "").trim() : "";
const optionalId = (value: unknown, name: string) => {
  const normalized = text(value);
  if (!normalized) return null;
  if (!SOURCE_ID.test(normalized))
    throw new AssistantError("INVALID_REQUEST", `Invalid ${name}.`, 400);
  return normalized;
};

export function parseAssistantRequest(
  input: unknown,
  maximumInputCharacters = 4_000,
): AssistantRequest {
  if (!input || typeof input !== "object")
    throw new AssistantError("INVALID_REQUEST", "Invalid request body.", 400);
  const raw = input as Record<string, unknown>;
  const message = text(raw.message);
  if (!message)
    throw new AssistantError("INVALID_REQUEST", "Enter a question.", 400);
  if (message.length > maximumInputCharacters)
    throw new AssistantError(
      "INVALID_REQUEST",
      `Questions must be ${maximumInputCharacters.toLocaleString()} characters or fewer.`,
      400,
    );
  const contextMode = text(raw.contextMode) as AssistantContextMode;
  if (!ASSISTANT_CONTEXT_MODES.includes(contextMode))
    throw new AssistantError(
      "INVALID_REQUEST",
      "Unsupported assistant mode.",
      400,
    );

  const conversationId = text(raw.conversationId);
  if (conversationId && !UUID.test(conversationId))
    throw new AssistantError("INVALID_REQUEST", "Invalid conversation.", 400);
  const requestId = text(raw.requestId);
  if (!requestId || requestId.length > 100 || !SOURCE_ID.test(requestId))
    throw new AssistantError(
      "INVALID_REQUEST",
      "Invalid request identifier.",
      400,
    );

  const instrumentSlug = optionalId(raw.instrumentSlug, "instrument");
  if (instrumentSlug && !getInstrument(instrumentSlug))
    throw new AssistantError("INVALID_REQUEST", "Unsupported instrument.", 400);

  return {
    message: message.replace(/\s+/g, " "),
    contextMode,
    conversationId: conversationId || null,
    requestId,
    instrumentSlug,
    articleSlug: optionalId(raw.articleSlug, "article"),
    economicEventId: optionalId(raw.economicEventId, "economic event"),
    watchlistId: optionalId(raw.watchlistId, "watchlist"),
  };
}

const RATINGS: AssistantFeedbackRating[] = ["positive", "negative"];
const REASONS: AssistantFeedbackReason[] = [
  "helpful",
  "not_helpful",
  "incorrect",
  "outdated",
  "missing_citation",
  "unsafe",
  "other",
];

export function parseAssistantFeedback(input: unknown) {
  if (!input || typeof input !== "object")
    throw new AssistantError("INVALID_REQUEST", "Invalid feedback.", 400);
  const raw = input as Record<string, unknown>;
  const messageId = text(raw.messageId);
  const conversationId = text(raw.conversationId);
  const rating = text(raw.rating) as AssistantFeedbackRating;
  const reason = text(raw.reason) as AssistantFeedbackReason;
  const comment = text(raw.comment);
  if (!UUID.test(messageId) || !UUID.test(conversationId))
    throw new AssistantError(
      "INVALID_REQUEST",
      "Invalid feedback target.",
      400,
    );
  if (!RATINGS.includes(rating) || !REASONS.includes(reason))
    throw new AssistantError("INVALID_REQUEST", "Invalid feedback value.", 400);
  if (comment.length > 500)
    throw new AssistantError("INVALID_REQUEST", "Feedback is too long.", 400);
  return {
    messageId,
    conversationId,
    rating,
    reason,
    comment: comment || null,
  };
}

export function safeConversationTitle(message: string) {
  return message.replace(/\s+/g, " ").trim().slice(0, 72) || "New conversation";
}
