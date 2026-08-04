import { MARKET_BIAS_LABELS } from "@/constants/market-bias";
import type { MarketBias } from "@/types/market-intelligence";
import type { Locale } from "@/lib/i18n/config";

export function MarketBiasBadge({
  bias,
  locale = "en",
}: {
  bias: MarketBias;
  locale?: Locale;
}) {
  const spanishLabels: Record<MarketBias, string> = {
    bullish: "Alcista",
    neutral: "Neutral",
    bearish: "Bajista",
    mixed: "Mixto",
  };
  return (
    <span className={`mi-bias mi-bias-${bias}`}>
      {locale === "es" ? spanishLabels[bias] : MARKET_BIAS_LABELS[bias]}
    </span>
  );
}
