import type { MarketBias } from "@/types/market-intelligence";

export const MARKET_BIAS_LABELS: Record<MarketBias, string> = {
  bullish: "Bullish editorial bias",
  bearish: "Bearish editorial bias",
  neutral: "Neutral editorial bias",
  mixed: "Mixed editorial bias",
};
