import { EmptyMarketState } from "./EmptyMarketState";
import { MarketOutlookCard } from "./MarketOutlookCard";
import type { MarketIntelligenceSummary } from "@/types/market-intelligence";

export function MarketOutlookGrid({
  outlooks,
  compact = false,
}: {
  outlooks: MarketIntelligenceSummary[];
  compact?: boolean;
}) {
  if (!outlooks.length) return <EmptyMarketState />;
  return (
    <div className={`mi-grid${compact ? " mi-grid-compact" : ""}`}>
      {outlooks.map((outlook) => (
        <MarketOutlookCard key={outlook.id} outlook={outlook} />
      ))}
    </div>
  );
}
