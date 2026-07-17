import type { AssistantIntent } from "@/types/ai-assistant";

const REFUSALS: Partial<Record<AssistantIntent, string>> = {
  prompt_injection:
    "I can’t reveal private instructions, credentials, hidden reasoning, or override the assistant’s safety and source rules. I can explain a published DayTradingPost source instead.",
  guaranteed_return:
    "I can’t promise profits or certainty about future prices. I can outline educational bullish, bearish, and risk scenarios using cited DayTradingPost sources.",
  trade_execution:
    "I can’t execute or pretend to execute trades or access a brokerage account. I can help you review an educational trade-planning checklist.",
  personal_position_sizing:
    "I can’t determine how much of your personal savings to invest. I can explain general position-sizing and risk-management frameworks for education.",
  personalized_recommendation:
    "I can’t provide a personalized buy or sell recommendation. I can summarize published analysis and explain general scenarios and risks.",
  evasion:
    "I can’t help bypass financial, broker, tax, identity, or regulatory controls. I can provide general educational information about compliant market participation.",
};

export function getSafetyRefusal(intent: AssistantIntent) {
  return REFUSALS[intent] ?? null;
}

export const EDUCATIONAL_AI_DISCLAIMER =
  "Educational information only—not personalized investment advice. Markets involve risk, and losses are possible.";
