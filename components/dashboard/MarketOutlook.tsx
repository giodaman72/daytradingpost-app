import Link from "next/link";
import type { ArticleSummary } from "@/lib/sanity/types";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { DashboardPanel } from "./DashboardPanel";

export function MarketOutlook({ articles }: { articles: ArticleSummary[] }) {
  const markets = articles.slice(0, 3);

  return (
    <DashboardPanel
      id="market-outlook"
      eyebrow="Session briefing"
      title="Today’s Market Outlook"
      className="dashboard-panel-wide"
      action={<Link href="/analysis" className="dashboard-panel-link">All markets →</Link>}
    >
      {markets.length ? (
        <div className="dashboard-outlook-grid">
          {markets.map((article) => (
            <Link href={`/analysis/${article.slug}`} className="dashboard-outlook-card" key={article._id}>
              <div>
                <span>{article.instrumentSymbol}</span>
                <span className={`analysis-bias bias-${article.marketBias.toLowerCase()}`}>{article.marketBias}</span>
              </div>
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
            </Link>
          ))}
        </div>
      ) : (
        <DashboardEmptyState
          title="No published outlook yet"
          description="Today’s market briefings will appear here when an article is published in Sanity."
          action={<Link href="/analysis" className="text-link">Browse analysis archive →</Link>}
        />
      )}
    </DashboardPanel>
  );
}
