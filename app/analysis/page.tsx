import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/analysis/ArticleCard";
import { ArticleEmptyState } from "@/components/analysis/ArticleEmptyState";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getArticles } from "@/lib/sanity/client";

export const metadata: Metadata = {
  title: "Market Analysis",
  description:
    "Read DayTradingPost technical analysis, market context, key levels and educational trading insights.",
  alternates: {
    canonical: "/analysis",
  },
  openGraph: {
    title: "Market Analysis | DayTradingPost",
    description:
      "Published technical outlooks, decision levels and market risk factors for active traders.",
    url: "/analysis",
    type: "website",
  },
};

export default async function AnalysisPage() {
  const articles = await getArticles();

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

          <span className="section-kicker">Published market intelligence</span>
          <h1>Turn market structure into a clearer trading plan.</h1>
          <p>
            Explore technical context, key levels and risk-aware market
            briefings published by the DayTradingPost research desk.
          </p>

          <div className="sample-content-notice" role="note">
            <strong>Educational content</strong>
            <span>
              Analysis is informational and time-sensitive. It is not live
              market data, personalized advice, or a recommendation to trade.
            </span>
          </div>
        </div>
      </section>

      <section className="analysis-library-section">
        <div className="container">
          <div className="analysis-library-heading">
            <div>
              <span className="section-kicker">Analysis library</span>
              <h2>Latest research</h2>
            </div>
            <p>
              Each article combines market context, technical levels, primary
              risk factors and an educational planning framework.
            </p>
          </div>

          {articles.length ? (
            <div className="analysis-market-grid">
              {articles.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          ) : (
            <ArticleEmptyState />
          )}
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
              <h3>Challenge the thesis</h3>
              <p>Identify catalysts and conditions that could change the outlook.</p>
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
