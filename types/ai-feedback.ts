export const ASSISTANT_FEEDBACK_REASONS = [
  "helpful",
  "not_helpful",
  "incorrect",
  "outdated",
  "missing_citation",
  "unsafe",
  "other",
] as const;

export type AssistantFeedbackReason =
  (typeof ASSISTANT_FEEDBACK_REASONS)[number];
export type AssistantFeedbackRating = "positive" | "negative";

export type AssistantFeedback = {
  id: string;
  userId: string;
  conversationId: string;
  messageId: string;
  rating: AssistantFeedbackRating;
  reason: AssistantFeedbackReason;
  comment: string | null;
  createdAt: string;
};
