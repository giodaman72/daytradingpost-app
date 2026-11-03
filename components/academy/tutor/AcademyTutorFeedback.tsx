"use client";

import type { Locale } from "@/lib/i18n/config";

import { AssistantFeedback } from "@/components/assistant/AssistantFeedback";

export function AcademyTutorFeedback(props: {
  conversationId: string;
  messageId: string;
  locale?: Locale;
}) {
  return <AssistantFeedback {...props} />;
}
