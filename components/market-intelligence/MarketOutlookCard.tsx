import Link from "next/link";
import { MarketBiasBadge } from "./MarketBiasBadge";
import { LastUpdated } from "./LastUpdated";
import { MarketLevels } from "./MarketLevels";
import type { MarketIntelligenceSummary } from "@/types/market-intelligence";
import { localizeHref, type Locale } from "@/lib/i18n/config";

export function MarketOutlookCard({
  outlook,
  locale = "en",
}: {
  outlook: MarketIntelligenceSummary;
  locale?: Locale;
}) {
  const spanish = locale === "es";
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
        <MarketBiasBadge bias={outlook.bias} locale={locale} />
      </header>
      <p>{outlook.shortSummary}</p>
      <div className="mi-card-levels">
        <MarketLevels
          label={spanish ? "Soporte" : "Support"}
          levels={outlook.supportLevels}
          locale={locale}
        />
        <MarketLevels
          label={spanish ? "Resistencia" : "Resistance"}
          levels={outlook.resistanceLevels}
          locale={locale}
        />
      </div>
      <dl>
        <div>
          <dt>{spanish ? "Impulso" : "Momentum"}</dt>
          <dd>{outlook.momentum}</dd>
        </div>
        <div>
          <dt>{spanish ? "Volatilidad" : "Volatility"}</dt>
          <dd>{outlook.volatility}</dd>
        </div>
      </dl>
      <LastUpdated
        value={outlook.updatedAt}
        validForDate={outlook.validForDate}
        locale={locale}
      />
      <Link
        href={localizeHref(href, locale)}
        aria-label={
          spanish
            ? `Leer la perspectiva de ${outlook.instrumentName}`
            : `Read the ${outlook.instrumentName} outlook`
        }
      >
        {spanish ? "Ver perspectiva" : "View outlook"}{" "}
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
