import Link from "next/link";
import { ArticleCard } from "@/components/analysis/ArticleCard";
import { ArticleEmptyState } from "@/components/analysis/ArticleEmptyState";
import { Header } from "@/components/layout/Header";
import { EmptyMarketState } from "@/components/market-intelligence/EmptyMarketState";
import { MarketOutlookCard } from "@/components/market-intelligence/MarketOutlookCard";
import { MarketOutlookGrid } from "@/components/market-intelligence/MarketOutlookGrid";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { EconomicCard } from "@/components/economic/EconomicCard";
import { MarketDataGrid } from "@/components/market-data/MarketDataGrid";
import { getLatestArticles } from "@/lib/cms";
import { getHomepageQuotes } from "@/lib/market-data/marketDataService";
import { getEconomicToday } from "@/lib/economic/economicService";
import { getFeaturedMarketIntelligence } from "@/lib/market/marketIntelligenceService";

const academyTopics = [
  {
    number: "01",
    title: "Market Foundations",
    description:
      "Learn chart types, market structure, order execution and essential trading terminology.",
  },
  {
    number: "02",
    title: "Technical Analysis",
    description:
      "Understand trends, support, resistance, momentum, volatility and price patterns.",
  },
  {
    number: "03",
    title: "Risk Management",
    description:
      "Build a repeatable framework for position sizing, trade management and capital protection.",
  },
];

export default async function Home() {
  const [analyses, outlooks, quotes, economicToday] = await Promise.all([
    getLatestArticles(3),
    getFeaturedMarketIntelligence(),
    getHomepageQuotes(),
    getEconomicToday(),
  ]);

  return (
    <main>
      <Header />

      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />

        <div className="hero-glow hero-glow-one" aria-hidden="true" />
        <div className="hero-glow hero-glow-two" aria-hidden="true" />

        <div className="container hero-content">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Independent market intelligence
            </div>

            <h1>
              Trade the markets with
              <span> greater clarity.</span>
            </h1>

            <p className="hero-description">
              Daily technical analysis, professional trading education and
              actionable market insights designed for active traders.
            </p>

            <div className="hero-actions">
              <Link href="#analysis" className="button">
                Read today&apos;s analysis
                <span aria-hidden="true">→</span>
              </Link>

              <Link href="#academy" className="button button-secondary">
                Explore the academy
              </Link>
            </div>

            <div className="trust-row">
              <div>
                <strong>Daily</strong>
                <span>Market coverage</span>
              </div>

              <div>
                <strong>Multi-asset</strong>
                <span>Trading insights</span>
              </div>

              <div>
                <strong>Practical</strong>
                <span>Trader education</span>
              </div>
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-header">
              <div>
                <span className="panel-label">Today&apos;s outlook</span>
                <h2>Market Intelligence</h2>
              </div>

              <span className="editorial-indicator">EDITORIAL</span>
            </div>
            {outlooks[0] ? (
              <MarketOutlookCard outlook={outlooks[0]} />
            ) : (
              <EmptyMarketState />
            )}
          </div>
        </div>
      </section>

      <section className="market-strip" id="markets">
        <div className="container">
          <div className="market-data-heading">
            <div>
              <span className="section-kicker">Market data</span>
              <h2>Provider quote snapshot</h2>
            </div>
            <p>Prices are informational and may be delayed or simulated.</p>
          </div>
          <MarketDataGrid quotes={quotes} compact />
        </div>
      </section>

      <section className="section editorial-outlooks-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Editorial intelligence</span>
              <h2>Structured market outlooks</h2>
            </div>
          </div>
          <MarketOutlookGrid outlooks={outlooks} />
        </div>
      </section>

      <section
        className="section section-muted homepage-economic"
        id="economic-calendar"
      >
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Economic intelligence</span>
              <h2>Today&apos;s high-impact events</h2>
            </div>
            <Link href="/economic-calendar" className="text-link">
              Open full calendar <span aria-hidden="true">→</span>
            </Link>
          </div>
          {economicToday.events.filter((event) => event.impact === "high")
            .length ? (
            <div className="economic-card-grid">
              {economicToday.events
                .filter((event) => event.impact === "high")
                .slice(0, 3)
                .map((event) => (
                  <EconomicCard event={event} showCountdown key={event.id} />
                ))}
            </div>
          ) : (
            <div className="economic-empty" role="status">
              <h3>No verified high-impact events today</h3>
              <p>
                Check the complete calendar for medium-impact releases and
                upcoming events.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="section" id="analysis">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Market analysis</span>
              <h2>Insights for today&apos;s trading session</h2>
            </div>

            <Link href="/analysis" className="text-link">
              View all analysis
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {analyses.length ? (
            <div className="analysis-grid">
              {analyses.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          ) : (
            <ArticleEmptyState compact />
          )}
        </div>
      </section>

      <section className="section section-muted" id="academy">
        <div className="container academy-layout">
          <div className="academy-intro">
            <span className="section-kicker">Trading academy</span>

            <h2>Develop the skills behind better trading decisions.</h2>

            <p>
              Learn through structured, practical lessons created for traders
              who want to understand the market—not merely follow signals.
            </p>

            <Link href="/academy" className="button">
              Start learning
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="academy-topics">
            {academyTopics.map((topic) => (
              <article className="academy-topic" key={topic.number}>
                <span>{topic.number}</span>

                <div>
                  <h3>{topic.title}</h3>
                  <p>{topic.description}</p>
                </div>

                <span className="topic-arrow" aria-hidden="true">
                  ↗
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="premium">
        <div className="container">
          <div className="premium-card">
            <div className="premium-copy">
              <span className="section-kicker">DayTradingPost Premium</span>

              <h2>Your complete daily trading intelligence package.</h2>

              <p>
                Access premium market briefings, detailed trade scenarios,
                educational webinars and member-only resources.
              </p>

              <ul className="premium-list">
                <li>
                  <span>✓</span>
                  Daily technical outlooks
                </li>
                <li>
                  <span>✓</span>
                  Key support and resistance levels
                </li>
                <li>
                  <span>✓</span>
                  Live educational webinars
                </li>
                <li>
                  <span>✓</span>
                  Premium academy content
                </li>
              </ul>
            </div>

            <div className="pricing-card">
              <span className="pricing-label">Founding membership</span>

              <div className="price">
                <strong>$39</strong>
                <span>/month</span>
              </div>

              <p>Cancel anytime. Premium content added every week.</p>

              <Link href="/premium" className="button button-full">
                Join Premium
                <span aria-hidden="true">→</span>
              </Link>

              <span className="pricing-note">
                Membership enrollment opening soon
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="newsletter-section" id="newsletter">
        <div className="container newsletter-layout">
          <div>
            <span className="section-kicker">The Daily Market Brief</span>

            <h2>Start every trading day better informed.</h2>

            <p>
              Get important market developments, technical levels and upcoming
              economic events delivered to your inbox.
            </p>
          </div>

          <NewsletterForm />
        </div>
      </section>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand-column">
              <Link href="/" className="brand">
                <span className="brand-mark">DTP</span>

                <span className="brand-name">
                  DayTrading<span>Post</span>
                </span>
              </Link>

              <p>
                Independent market intelligence and trading education for active
                traders.
              </p>
            </div>

            <div className="footer-links">
              <div>
                <h3>Markets</h3>
                <Link href="/markets/gold">Gold</Link>
                <Link href="/markets/indices">Indices</Link>
                <Link href="/markets/forex">Forex</Link>
                <Link href="/markets/crypto">Crypto</Link>
              </div>

              <div>
                <h3>Learn</h3>
                <Link href="/academy">Trading Academy</Link>
                <Link href="/analysis">Market Analysis</Link>
                <Link href="/webinars">Webinars</Link>
                <Link href="/premium">Premium</Link>
              </div>

              <div>
                <h3>Company</h3>
                <Link href="/about">About</Link>
                <Link href="/contact">Contact</Link>
                <Link href="/privacy">Privacy</Link>
                <Link href="/terms">Terms</Link>
              </div>
            </div>
          </div>

          <div className="risk-warning">
            <strong>Risk warning:</strong> Trading leveraged financial products
            involves significant risk and may not be suitable for every
            investor. DayTradingPost provides educational and informational
            content only and does not provide personalized investment advice.
          </div>

          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} DayTradingPost. All rights reserved.
            </span>

            <span>Professional market intelligence for active traders.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
