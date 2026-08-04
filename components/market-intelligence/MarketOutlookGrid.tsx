import { EmptyMarketState } from "./EmptyMarketState";
import { MarketOutlookCard } from "./MarketOutlookCard";
import type { MarketIntelligenceSummary } from "@/types/market-intelligence";
import type { Locale } from "@/lib/i18n/config";

export function MarketOutlookGrid({
  outlooks,
  compact = false,
  locale = "en",
}: {
  outlooks: MarketIntelligenceSummary[];
  compact?: boolean;
  locale?: Locale;
}) {
  if (!outlooks.length) return <EmptyMarketState locale={locale} />;
  return (
    <div className={`mi-grid${compact ? " mi-grid-compact" : ""}`}>
      {outlooks.map((outlook) => (
        <MarketOutlookCard key={outlook.id} outlook={outlook} locale={locale} />
      ))}
    </div>
  );
}
