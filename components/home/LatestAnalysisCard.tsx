import Image from "next/image";
import Link from "next/link";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { getArticleImageUrl } from "@/lib/sanity/image";
import type { Article, ArticleSummary } from "@/types/article";

export type LatestAnalysis = ArticleSummary &
  Partial<Pick<Article, "resistanceLevels" | "supportLevels">>;

const BIAS_LABELS_ES: Record<string, string> = {
  Bullish: "Alcista",
  Neutral: "Neutral",
  Bearish: "Bajista",
};

function formatDate(value: string, locale: Locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Up to two levels each side: R2, R1 above price and S1, S2 below. */
export type KeyLevelRow = {
  label: string;
  value: string;
  side: "resistance" | "support";
};

export function keyLevelRows(article: LatestAnalysis): KeyLevelRow[] {
  const resistance = (article.resistanceLevels ?? [])
    .filter(Boolean)
    .slice(0, 2);
  const support = (article.supportLevels ?? []).filter(Boolean).slice(0, 2);
  return [
    ...resistance
      .map((value, i): KeyLevelRow => ({
        label: `R${i + 1}`,
        value,
        side: "resistance",
      }))
      .reverse(),
    ...support.map((value, i): KeyLevelRow => ({
      label: `S${i + 1}`,
      value,
      side: "support",
    })),
  ];
}

/**
 * Homepage hero card that leads with the newest published analysis: chart,
 * bias, market and date, key levels and a link to read the full piece.
 */
export function LatestAnalysisCard({
  article,
  locale,
}: {
  article: LatestAnalysis;
  locale: Locale;
}) {
  const spanish = locale === "es";
  const imageUrl = getArticleImageUrl(article, 1200, 640);
  const bias = article.marketBias;
  const biasLabel = spanish ? (BIAS_LABELS_ES[bias] ?? bias) : bias;
  const date = formatDate(article.publishedAt, locale);
  const levels = keyLevelRows(article);
  const href = localizeHref(`/analysis/${article.slug}`, locale);

  return (
    <article className="latest-analysis-card">
      <header className="latest-analysis-head">
        <span className="latest-analysis-kicker">
          {spanish ? "Último análisis" : "Latest analysis"}
        </span>
        <span className={`latest-analysis-bias is-${bias.toLowerCase()}`}>
          {spanish ? "Sesgo" : "Bias"}: {biasLabel}
        </span>
      </header>

      <Link href={href} className="latest-analysis-chart" tabIndex={-1}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={article.featuredImage?.alt || article.title}
            fill
            sizes="(max-width: 1080px) 100vw, 640px"
            loading="eager"
            fetchPriority="high"
          />
        ) : (
          <span className="latest-analysis-chart-empty" aria-hidden="true" />
        )}
      </Link>

      <div className="latest-analysis-body">
        <p className="latest-analysis-meta">
          <strong>{article.instrumentSymbol}</strong>
          {date ? <time dateTime={article.publishedAt}>{date}</time> : null}
        </p>
        <h2>
          <Link href={href}>{article.title}</Link>
        </h2>

        {levels.length > 0 ? (
          <dl
            className="latest-analysis-levels"
            aria-label={spanish ? "Niveles clave" : "Key levels"}
          >
            {levels.map((level) => (
              <div key={level.label} className={`is-${level.side}`}>
                <dt>{level.label}</dt>
                <dd>{level.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="latest-analysis-excerpt">{article.excerpt}</p>
        )}

        <div className="latest-analysis-actions">
          <Link href={href} className="latest-analysis-read">
            {spanish ? "Leer el análisis" : "Read the analysis"}
            <span aria-hidden="true"> →</span>
          </Link>
          <Link
            href={localizeHref("/analysis", locale)}
            className="latest-analysis-all"
          >
            {spanish ? "Todos los análisis" : "All analysis"}
          </Link>
        </div>
      </div>
    </article>
  );
}
