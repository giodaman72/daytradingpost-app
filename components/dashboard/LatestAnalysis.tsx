import Link from "next/link";
import type { ArticleSummary } from "@/types/article";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { DashboardPanel } from "./DashboardPanel";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function LatestAnalysis({ articles }: { articles: ArticleSummary[] }) {
  return (
    <DashboardPanel
      id="latest-analysis"
      eyebrow="Sanity research feed"
      title="Latest Analysis"
      className="dashboard-panel-wide"
      action={
        <Link href="/analysis" className="dashboard-panel-link">
          View archive →
        </Link>
      }
    >
      {articles.length ? (
        <div className="dashboard-analysis-list">
          {articles.map((article) => (
            <article key={article._id}>
              <div className="dashboard-analysis-symbol">
                <strong>{article.instrumentSymbol}</strong>
                <span>{article.category?.title || "Market analysis"}</span>
              </div>
              <div className="dashboard-analysis-copy">
                <div>
                  <span
                    className={`analysis-bias bias-${article.marketBias.toLowerCase()}`}
                  >
                    {article.marketBias}
                  </span>
                  <span>
                    {article.accessLevel === "premium" ? "Premium" : "Free"}
                  </span>
                  <time dateTime={article.publishedAt}>
                    {formatDate(article.publishedAt)}
                  </time>
                </div>
                <h3>
                  <Link href={`/analysis/${article.slug}`}>
                    {article.title}
                  </Link>
                </h3>
              </div>
              <Link
                href={`/analysis/${article.slug}`}
                aria-label={`Read ${article.title}`}
              >
                ↗
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <DashboardEmptyState
          title="Analysis feed is empty"
          description="Publish an article with a slug and current publication date to populate this feed."
          action={
            <Link href="/analysis" className="text-link">
              View analysis page →
            </Link>
          }
        />
      )}
    </DashboardPanel>
  );
}
