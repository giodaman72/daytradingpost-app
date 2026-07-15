import { MARKET_BIAS_LABELS } from "@/constants/market-bias";
import type { MarketBias } from "@/types/market-intelligence";

export function MarketBiasBadge({ bias }: { bias: MarketBias }) {
  return (
    <span className={`mi-bias mi-bias-${bias}`}>
      {MARKET_BIAS_LABELS[bias]}
    </span>
  );
}
