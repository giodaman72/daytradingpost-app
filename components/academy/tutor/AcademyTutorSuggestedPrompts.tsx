"use client";

import type { Locale } from "@/lib/i18n/config";

import { AssistantSuggestedPrompts } from "@/components/assistant/AssistantSuggestedPrompts";

export function AcademyTutorSuggestedPrompts(props: {
  prompts: readonly string[];
  onSelect: (prompt: string) => void;
  disabled: boolean;
  locale?: Locale;
}) {
  return <AssistantSuggestedPrompts {...props} />;
}
