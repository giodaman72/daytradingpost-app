import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MarketOutlookGrid } from "@/components/market-intelligence/MarketOutlookGrid";
import { getLatestMarketIntelligence } from "@/lib/market/marketIntelligenceService";
import { buildMarketBrief } from "@/lib/market/marketIntelligenceTransforms";
import { EconomicCard } from "@/components/economic/EconomicCard";
import { getUpcomingEconomicEvents } from "@/lib/economic/economicService";

export const metadata: Metadata = {
  title: "Daily Market Brief",
  description:
    "DayTradingPost editorial market bias, momentum, volatility and risk context across tracked instruments.",
  alternates: { canonical: "/market-brief" },
};

export default async function MarketBriefPage() {
  const [records, economic] = await Promise.all([
    getLatestMarketIntelligence({ limit: 50 }),
    getUpcomingEconomicEvents(6),
  ]);
  const brief = buildMarketBrief(records);

  return (
    <main className="analysis-page">
      <Header />
      <section className="analysis-landing-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="container analysis-landing-copy">
          <nav className="analysis-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Market brief</span>
          </nav>
          <span className="section-kicker">
            Centralized market intelligence
          </span>
          <h1>{brief.headline}</h1>
          <p>{brief.summary}</p>
          <div
            className="mi-distribution"
            aria-label="Editorial bias distribution"
          >
            <span>
              <strong>{brief.distribution.bullish}</strong> Bullish
            </span>
            <span>
              <strong>{brief.distribution.bearish}</strong> Bearish
            </span>
            <span>
              <strong>{brief.distribution.neutralOrMixed}</strong> Neutral or
              mixed
            </span>
          </div>
          <div className="sample-content-notice" role="note">
            <strong>No live data</strong>
            <span>
              Every value shown here was entered by the editorial team. No
              real-time prices are displayed or inferred.
            </span>
          </div>
        </div>
      </section>
      <section className="analysis-library-section">
        <div className="container">
          <section className="market-brief-events">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Scheduled event risk</span>
                <h2>Top upcoming economic releases</h2>
              </div>
              <Link href="/economic-calendar" className="text-link">
                View calendar →
              </Link>
            </div>
            {economic.events.length ? (
              <div className="economic-card-grid">
                {economic.events.slice(0, 3).map((event) => (
                  <EconomicCard event={event} key={event.id} />
                ))}
              </div>
            ) : (
              <p className="economic-empty">
                No verified upcoming releases are connected.
              </p>
            )}
          </section>
          <MarketOutlookGrid
            outlooks={brief.outlooks.filter((outlook) => outlook.isFeatured)}
          />
          <p className="mi-disclaimer">
            <strong>Educational risk disclaimer:</strong> {brief.riskDisclaimer}
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
