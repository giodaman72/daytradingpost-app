import type {
  AssistantIntent,
  AssistantSafetyFlag,
} from "@/types/ai-assistant";

type Classification = { intent: AssistantIntent; flags: AssistantSafetyFlag[] };

const has = (value: string, pattern: RegExp) =>
  pattern.test(value.toLowerCase());

export function classifyAssistantIntent(message: string): Classification {
  if (has(message, /(ignore|override).*(instruction|system|safety)|jailbreak/))
    return { intent: "prompt_injection", flags: ["prompt_injection"] };
  if (
    has(
      message,
      /(system prompt|hidden prompt|chain.of.thought|api key|service.role)/,
    )
  )
    return { intent: "prompt_injection", flags: ["hidden_prompt"] };
  if (
    has(message, /(guarantee|risk.free|certain profit|cannot lose|100% return)/)
  )
    return { intent: "guaranteed_return", flags: ["guaranteed_return"] };
  if (has(message, /(execute|place|open|close).*(trade|order)|log in.*broker/))
    return { intent: "trade_execution", flags: ["trade_execution"] };
  if (
    has(
      message,
      /(all my savings|entire savings|exactly how much|my salary|my debt).*(buy|invest|position|trade)/,
    )
  )
    return { intent: "personal_position_sizing", flags: ["financial_advice"] };
  if (
    has(
      message,
      /(what should i buy|tell me to buy|best trade for me|personal recommendation)/,
    )
  )
    return {
      intent: "personalized_recommendation",
      flags: ["financial_advice"],
    };
  if (has(message, /(evade|bypass).*(tax|broker|exchange|regulation|kyc)/))
    return { intent: "evasion", flags: [] };
  if (has(message, /(article|brief).*(summar|explain)|summar.*article/))
    return { intent: "article_summary", flags: [] };
  if (
    has(message, /(market|gold|nasdaq|oil|bitcoin|btc|xau|price|outlook|bias)/)
  )
    return { intent: "general_market_analysis", flags: [] };
  if (
    has(message, /(support|resistance|cpi|inflation|lesson|learn|explain|risk)/)
  )
    return { intent: "education", flags: [] };
  return { intent: "market_explanation", flags: [] };
}
