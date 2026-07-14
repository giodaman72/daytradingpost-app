import Link from "next/link";
import { ArticleCard } from "@/components/analysis/ArticleCard";
import { ArticleEmptyState } from "@/components/analysis/ArticleEmptyState";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { getLatestArticles } from "@/lib/cms";

const markets = [
  {
    symbol: "XAU/USD",
    name: "Gold",
    price: "4,112.40",
    change: "+0.72%",
    direction: "Bullish",
    positive: true,
  },
  {
    symbol: "NAS100",
    name: "Nasdaq 100",
    price: "25,436.20",
    change: "+0.38%",
    direction: "Bullish",
    positive: true,
  },
  {
    symbol: "BTC/USD",
    name: "Bitcoin",
    price: "118,420",
    change: "-0.41%",
    direction: "Neutral",
    positive: false,
  },
  {
    symbol: "WTI",
    name: "Crude Oil",
    price: "78.64",
    change: "+1.16%",
    direction: "Bullish",
    positive: true,
  },
  {
    symbol: "EUR/USD",
    name: "Euro / Dollar",
    price: "1.1724",
    change: "-0.18%",
    direction: "Bearish",
    positive: false,
  },
  {
    symbol: "DJ30",
    name: "Dow Jones",
    price: "48,305",
    change: "+0.24%",
    direction: "Neutral",
    positive: true,
  },
];

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
  const analyses = await getLatestArticles(3);

  return (
    <main>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label="DayTradingPost homepage">
            <span className="brand-mark">DTP</span>

            <span className="brand-name">
              DayTrading<span>Post</span>
            </span>
          </Link>

          <nav className="desktop-navigation" aria-label="Main navigation">
            <Link href="#markets">Markets</Link>
            <Link href="#analysis">Analysis</Link>
            <Link href="#academy">Academy</Link>
            <Link href="#premium">Premium</Link>
            <Link href="#newsletter">Newsletter</Link>
          </nav>

          <div className="header-actions">
            <Link href="/login" className="login-link">
              Sign in
            </Link>

            <Link href="#premium" className="button button-small">
              Join Premium
            </Link>
          </div>
        </div>
      </header>

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

              <span className="live-indicator">
                <span />
                LIVE
              </span>
            </div>

            <div className="featured-instrument">
              <div className="instrument-heading">
                <div>
                  <span>XAU/USD</span>
                  <h3>Gold</h3>
                </div>

                <span className="bias bias-bullish">Bullish bias</span>
              </div>

              <div className="price-row">
                <strong>4,112.40</strong>
                <span>+0.72%</span>
              </div>

              <div className="chart-placeholder" aria-label="Decorative chart">
                <svg
                  viewBox="0 0 600 180"
                  role="img"
                  aria-label="Illustrative upward market chart"
                >
                  <defs>
                    <linearGradient
                      id="chartGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#f5b942" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#f5b942" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <path
                    className="chart-area"
                    d="M0,150 C35,142 60,154 92,132 C124,110 143,121 177,103 C211,85 230,102 267,78 C301,56 325,73 354,53 C385,32 414,60 445,36 C477,14 520,40 600,10 L600,180 L0,180 Z"
                  />

                  <path
                    className="chart-line"
                    d="M0,150 C35,142 60,154 92,132 C124,110 143,121 177,103 C211,85 230,102 267,78 C301,56 325,73 354,53 C385,32 414,60 445,36 C477,14 520,40 600,10"
                  />
                </svg>
              </div>

              <div className="key-levels">
                <div>
                  <span>Support</span>
                  <strong>4,075</strong>
                </div>

                <div>
                  <span>Resistance</span>
                  <strong>4,145</strong>
                </div>

                <div>
                  <span>Momentum</span>
                  <strong>Positive</strong>
                </div>
              </div>

              <p className="market-disclaimer">
                Illustrative market information. Prices shown are sample data.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="market-strip" id="markets">
        <div className="container">
          <div className="market-grid">
            {markets.map((market) => (
              <article className="market-card" key={market.symbol}>
                <div className="market-card-top">
                  <div>
                    <span className="market-symbol">{market.symbol}</span>
                    <h3>{market.name}</h3>
                  </div>

                  <span
                    className={
                      market.positive ? "market-arrow up" : "market-arrow down"
                    }
                    aria-label={market.positive ? "Price higher" : "Price lower"}
                  >
                    {market.positive ? "↗" : "↘"}
                  </span>
                </div>

                <div className="market-price">
                  <strong>{market.price}</strong>

                  <span className={market.positive ? "positive" : "negative"}>
                    {market.change}
                  </span>
                </div>

                <span className="market-direction">{market.direction}</span>
              </article>
            ))}
          </div>
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
                Independent market intelligence and trading education for
                active traders.
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
