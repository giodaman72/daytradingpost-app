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
  academy_answer_key:
    "I can’t provide or reconstruct answer keys. I can explain the lesson concept or generate new, ungraded practice questions.",
  academy_active_assessment:
    "I can’t answer an active assessment question. I can explain the surrounding lesson concept without solving the graded item.",
  academy_assessment_completion:
    "I can’t complete graded quizzes or assessments. I can help you study the underlying concept.",
  academy_certification_claim:
    "I can’t issue, bypass, or misrepresent an Academy certificate.",
  academy_premium_extraction:
    "I can’t expose premium, locked, draft, or unpublished Academy content.",
};

export function getSafetyRefusal(intent: AssistantIntent) {
  return REFUSALS[intent] ?? null;
}

export const EDUCATIONAL_AI_DISCLAIMER =
  "Educational information only—not personalized investment advice. Markets involve risk, and losses are possible.";
