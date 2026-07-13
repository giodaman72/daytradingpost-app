import type { Metadata } from "next";
import Link from "next/link";
import { AnalysisCard } from "@/components/analysis/AnalysisCard";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { analysisMarkets } from "@/lib/analysis-data";

export const metadata: Metadata = {
  title: "Market Analysis",
  description:
    "Explore illustrative technical analysis examples for gold, the Nasdaq 100, crude oil and Bitcoin from DayTradingPost.",
  alternates: {
    canonical: "/analysis",
  },
  openGraph: {
    title: "Market Analysis | DayTradingPost",
    description:
      "Illustrative technical outlooks, levels and scenarios across four actively traded markets.",
    url: "/analysis",
    type: "website",
  },
};

export default function AnalysisPage() {
  return (
    <main className="analysis-page">
      <Header />

      <section className="analysis-landing-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-glow hero-glow-one" aria-hidden="true" />
        <div className="hero-glow hero-glow-two" aria-hidden="true" />

        <div className="container analysis-landing-copy">
          <nav className="analysis-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Analysis</span>
          </nav>

          <span className="section-kicker">Daily market intelligence</span>
          <h1>Turn market structure into a clearer trading plan.</h1>
          <p>
            Explore technical context, key levels and two-sided scenarios
            across actively traded markets. Every page below contains
            illustrative sample analysis—not live prices or recommendations.
          </p>

          <div className="sample-content-notice" role="note">
            <strong>Sample content only</strong>
            <span>
              All prices, levels, market biases and scenarios are fictional
              examples created to demonstrate the DayTradingPost experience.
            </span>
          </div>
        </div>
      </section>

      <section className="analysis-library-section">
        <div className="container">
          <div className="analysis-library-heading">
            <div>
              <span className="section-kicker">Analysis library</span>
              <h2>Choose a market</h2>
            </div>
            <p>
              Each outlook maps the current sample structure, decision levels,
              risk factors and planning notes in one consistent format.
            </p>
          </div>

          <div className="analysis-market-grid">
            {analysisMarkets.map((market) => (
              <AnalysisCard key={market.slug} market={market} />
            ))}
          </div>
        </div>
      </section>

      <section className="analysis-method-section">
        <div className="container analysis-method-layout">
          <div>
            <span className="section-kicker">The DayTradingPost method</span>
            <h2>Context first. Scenarios second. Risk always.</h2>
          </div>
          <div className="analysis-method-steps">
            <article>
              <span>01</span>
              <h3>Read the structure</h3>
              <p>Define trend, range conditions and the levels controlling price.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Plan both outcomes</h3>
              <p>Prepare bullish and bearish responses before volatility arrives.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Define invalidation</h3>
              <p>Let risk and position sizing determine whether a setup is viable.</p>
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
