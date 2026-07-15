import Link from "next/link";
import { MarketOutlookGrid } from "@/components/market-intelligence/MarketOutlookGrid";
import type { MarketIntelligenceSummary } from "@/types/market-intelligence";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { DashboardPanel } from "./DashboardPanel";

export function MarketOutlook({
  outlooks,
}: {
  outlooks: MarketIntelligenceSummary[];
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
