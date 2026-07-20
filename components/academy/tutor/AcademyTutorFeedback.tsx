"use client";

import { AssistantFeedback } from "@/components/assistant/AssistantFeedback";

export function AcademyTutorFeedback(props: {
  conversationId: string;
  messageId: string;
}) {
  return <AssistantFeedback {...props} />;
}
