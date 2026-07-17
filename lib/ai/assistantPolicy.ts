import {
  ASSISTANT_CONTEXT_RULES,
  getAssistantLimits,
} from "@/constants/ai-assistant";
import type { AssistantContextMode } from "@/types/ai-context";

export function canUseAssistantMode(
  mode: AssistantContextMode,
  hasPremiumAccess: boolean,
) {
  return !ASSISTANT_CONTEXT_RULES[mode].premium || hasPremiumAccess;
}

export function canRetrievePremiumSource(hasPremiumAccess: boolean) {
  return getAssistantLimits(hasPremiumAccess).premiumSources;
}
