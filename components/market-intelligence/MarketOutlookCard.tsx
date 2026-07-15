import Link from "next/link";
import { MarketBiasBadge } from "./MarketBiasBadge";
import { LastUpdated } from "./LastUpdated";
import { MarketLevels } from "./MarketLevels";
import type { MarketIntelligenceSummary } from "@/types/market-intelligence";

export function MarketOutlookCard({
  outlook,
}: {
  outlook: MarketIntelligenceSummary;
}) {
  const href = outlook.relatedArticleSlug
    ? `/analysis/${outlook.relatedArticleSlug}`
    : `/market-brief#${outlook.instrumentSlug}`;

  return (
    <article className="mi-card" id={outlook.instrumentSlug}>
      <header>
        <div>
          <span>{outlook.symbol}</span>
          <h3>{outlook.instrumentName}</h3>
        </div>
        <MarketBiasBadge bias={outlook.bias} />
      </header>
      <p>{outlook.shortSummary}</p>
      <div className="mi-card-levels">
        <MarketLevels label="Support" levels={outlook.supportLevels} />
        <MarketLevels label="Resistance" levels={outlook.resistanceLevels} />
      </div>
      <dl>
        <div>
          <dt>Momentum</dt>
          <dd>{outlook.momentum}</dd>
        </div>
        <div>
          <dt>Volatility</dt>
          <dd>{outlook.volatility}</dd>
        </div>
      </dl>
      <LastUpdated
        value={outlook.updatedAt}
        validForDate={outlook.validForDate}
      />
      <Link
        href={href}
        aria-label={`Read the ${outlook.instrumentName} outlook`}
      >
        View outlook <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
