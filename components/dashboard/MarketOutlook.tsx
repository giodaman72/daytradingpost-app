import Link from "next/link";
import { MarketOutlookGrid } from "@/components/market-intelligence/MarketOutlookGrid";
import { MarketDataGrid } from "@/components/market-data/MarketDataGrid";
import type { MarketQuote } from "@/types/market-data";
import type { MarketIntelligenceSummary } from "@/types/market-intelligence";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { DashboardPanel } from "./DashboardPanel";

export function MarketOutlook({
  outlooks,
  quotes,
}: {
  outlooks: MarketIntelligenceSummary[];
  quotes: MarketQuote[];
}) {
  return (
    <DashboardPanel
      id="market-outlook"
      eyebrow="Session briefing"
      title="Today’s Market Outlook"
      className="dashboard-panel-wide"
      action={
        <Link href="/analysis" className="dashboard-panel-link">
          All markets →
        </Link>
      }
    >
      <section
        className="dashboard-market-data"
        aria-labelledby="dashboard-market-data-title"
      >
        <div className="dashboard-subheading">
          <h3 id="dashboard-market-data-title">Quote snapshot</h3>
          <span>Provider data · informational only</span>
        </div>
        <MarketDataGrid quotes={quotes} compact />
      </section>
      <div className="dashboard-subheading">
        <h3>Editorial outlooks</h3>
        <span>Independent research</span>
      </div>
      {outlooks.length ? (
        <MarketOutlookGrid outlooks={outlooks.slice(0, 3)} compact />
      ) : (
        <DashboardEmptyState
          title="No published outlook yet"
          description="Today’s structured outlooks will appear here when the editorial desk publishes them."
          action={
            <Link href="/analysis" className="text-link">
              Browse analysis archive →
            </Link>
          }
        />
      )}
    </DashboardPanel>
  );
}
