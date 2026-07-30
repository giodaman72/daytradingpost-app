import { getInstrument } from "@/constants/instruments";
import type { AssistantContextMode } from "@/types/ai-context";

export function buildAssistantContextQuestion(
  mode: AssistantContextMode,
  instrumentSlug: string,
) {
  if (mode !== "market_analysis" || !instrumentSlug) return "";

  const instrument = getInstrument(instrumentSlug);
  if (!instrument) return "";

  return `Provide a source-grounded market analysis for ${instrument.name} (${instrument.symbol}). Cover the latest published outlook, key market drivers, risk factors, and plausible scenarios.`;
}
