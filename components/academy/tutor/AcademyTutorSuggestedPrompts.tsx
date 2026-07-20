"use client";

import { AssistantSuggestedPrompts } from "@/components/assistant/AssistantSuggestedPrompts";

export function AcademyTutorSuggestedPrompts(props: {
  prompts: readonly string[];
  onSelect: (prompt: string) => void;
  disabled: boolean;
}) {
  return <AssistantSuggestedPrompts {...props} />;
}
