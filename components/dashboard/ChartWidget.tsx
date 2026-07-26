import Link from "next/link";
import type { InstrumentDefinition } from "@/constants/instruments";
import type { MarketQuote } from "@/types/market-data";
import { DashboardPanel } from "./DashboardPanel";
export function ChartWidget({
  instrument,
  quote,
}: {
  instrument: InstrumentDefinition | null;
  quote: MarketQuote | null;
}) {
  return (
    <DashboardPanel
      id="advanced-chart"
      eyebrow="Advanced chart"
      title={instrument?.name ?? "Market chart"}
    >
      {instrument ? (
        <div className="dashboard-chart-widget">
          <div>
            <strong>{quote?.price ?? "Unavailable"}</strong>
            <span>
              {instrument.symbol} ·{" "}
              {quote?.delayed
                ? "Delayed"
                : quote?.simulated
                  ? "Simulated fixture"
                  : (quote?.marketStatus ?? "Provider status unavailable")}
            </span>
          </div>
          <div className="dashboard-chart-placeholder" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <nav aria-label={`${instrument.name} chart actions`}>
            <Link href={`/charts/${instrument.slug}`}>Open full chart</Link>
            <Link href={`/alerts/new?instrument=${instrument.slug}`}>
              Create alert
            </Link>
            <Link href={`/analysis?instrument=${instrument.slug}`}>
              View analysis
            </Link>
          </nav>
        </div>
      ) : (
        <p>Add an instrument to your default watchlist to open its chart.</p>
      )}
    </DashboardPanel>
  );
}
