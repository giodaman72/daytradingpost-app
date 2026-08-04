import Link from "next/link";
import type { ArticleSummary } from "@/types/article";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { DashboardPanel } from "./DashboardPanel";
import { localizeHref, type Locale } from "@/lib/i18n/config";

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function LatestAnalysis({
  articles,
  locale = "en",
}: {
  articles: ArticleSummary[];
  locale?: Locale;
}) {
  const spanish = locale === "es";
  return (
    <DashboardPanel
      id="latest-analysis"
      eyebrow={
        spanish ? "Fuente de análisis de Sanity" : "Sanity research feed"
      }
      title={spanish ? "Análisis recientes" : "Latest Analysis"}
      className="dashboard-panel-wide"
      action={
        <Link
          href={localizeHref("/analysis", locale)}
          className="dashboard-panel-link"
        >
          {spanish ? "Ver archivo" : "View archive"} →
        </Link>
      }
    >
      {articles.length ? (
        <div className="dashboard-analysis-list">
          {articles.map((article) => (
            <article key={article._id}>
              <div className="dashboard-analysis-symbol">
                <strong>{article.instrumentSymbol}</strong>
                <span>
                  {article.category?.title ||
                    (spanish ? "Análisis de mercados" : "Market analysis")}
                </span>
              </div>
              <div className="dashboard-analysis-copy">
                <div>
                  <span
                    className={`analysis-bias bias-${article.marketBias.toLowerCase()}`}
                  >
                    {article.marketBias}
                  </span>
                  <span>
                    {article.accessLevel === "premium"
                      ? "Premium"
                      : spanish
                        ? "Gratis"
                        : "Free"}
                  </span>
                  <time dateTime={article.publishedAt}>
                    {formatDate(article.publishedAt, locale)}
                  </time>
                </div>
                <h3>
                  <Link
                    href={localizeHref(`/analysis/${article.slug}`, locale)}
                  >
                    {article.title}
                  </Link>
                </h3>
              </div>
              <Link
                href={localizeHref(`/analysis/${article.slug}`, locale)}
                aria-label={`${spanish ? "Leer" : "Read"} ${article.title}`}
              >
                ↗
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <DashboardEmptyState
          title={
            spanish
              ? "La fuente de análisis está vacía"
              : "Analysis feed is empty"
          }
          description={
            spanish
              ? "Publica un artículo con slug y fecha actual para completar esta fuente."
              : "Publish an article with a slug and current publication date to populate this feed."
          }
          action={
            <Link
              href={localizeHref("/analysis", locale)}
              className="text-link"
            >
              {spanish ? "Ver página de análisis" : "View analysis page"} →
            </Link>
          }
        />
      )}
    </DashboardPanel>
  );
}
