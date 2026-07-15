import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getSanityImageUrl } from "@/lib/sanity/image";
import type { Article, ArticleSummary } from "@/types/article";
import { ArticleBody } from "./ArticleBody";
import { LevelList } from "./LevelList";
import { MarketIntelligenceSummary } from "@/components/market-intelligence/MarketIntelligenceSummary";
import { MarketOutlookCard } from "@/components/market-intelligence/MarketOutlookCard";
import { summarizeMarketIntelligence } from "@/lib/market/marketIntelligenceTransforms";
import type { MarketIntelligenceRecord } from "@/types/market-intelligence";
import type { MarketQuote } from "@/types/market-data";
import { MarketDataCard } from "@/components/market-data/MarketDataCard";

type ArticleLayoutProps = (
  | { article: Article; locked?: false }
  | { article: ArticleSummary; locked: true }
) & {
  intelligence?: MarketIntelligenceRecord | null;
  marketQuote?: MarketQuote | null;
};

function formatPublishedDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function ArticleLayout(props: ArticleLayoutProps) {
  const article = props.article;
  const fullArticle = props.locked ? null : props.article;
  const imageUrl = getSanityImageUrl(article.featuredImage, 1600, 900);
  const category = article.category?.title || "Market analysis";

  return (
    <main className="analysis-page">
      <Header />

      <section className="analysis-detail-hero analysis-article-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-glow hero-glow-one" aria-hidden="true" />

        <div className="container analysis-detail-heading">
          <nav className="analysis-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/analysis">Analysis</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{article.title}</span>
          </nav>

          <div className="analysis-article-heading-grid">
            <div>
              <div className="analysis-article-labels">
                <span className="section-kicker">{category}</span>
                <span className="analysis-access-badge static">
                  {article.accessLevel === "premium" ? "Premium" : "Free"}
                </span>
              </div>
              <h1>{article.title}</h1>
              <p className="analysis-article-excerpt">{article.excerpt}</p>

              <div className="analysis-byline">
                <span>
                  By{" "}
                  <strong>
                    {article.author?.name || "DayTradingPost Research"}
                  </strong>
                </span>
                <span>{formatPublishedDate(article.publishedAt)}</span>
                <span>{article.instrumentSymbol}</span>
                <span
                  className={`analysis-bias bias-${article.marketBias.toLowerCase()}`}
                >
                  {article.marketBias} bias
                </span>
              </div>
            </div>

            <div className="analysis-featured-image">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={article.featuredImage?.alt || ""}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 520px"
                />
              ) : (
                <div className="visual-lines" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              )}
            </div>
          </div>

          <div className="sample-content-notice" role="note">
            <strong>Educational analysis</strong>
            <span>
              Market levels and bias reflect the author&apos;s published
              analysis at the stated time. They are not live prices or
              personalized trade recommendations.
            </span>
          </div>
        </div>
      </section>

      <section className="analysis-detail-body">
        <div className="container analysis-detail-layout">
          <article className="analysis-detail-main">
            {props.marketQuote ? (
              <section
                className="analysis-market-data"
                aria-labelledby="analysis-market-data-title"
              >
                <div className="analysis-market-data-heading">
                  <div>
                    <span className="section-kicker">Market data</span>
                    <h2 id="analysis-market-data-title">
                      Current provider snapshot
                    </h2>
                  </div>
                  <p>
                    Separate from the author&apos;s published editorial outlook.
                  </p>
                </div>
                <MarketDataCard quote={props.marketQuote} compact />
              </section>
            ) : null}
            {props.intelligence ? (
              fullArticle ? (
                <MarketIntelligenceSummary intelligence={props.intelligence} />
              ) : (
                <MarketOutlookCard
                  outlook={summarizeMarketIntelligence(props.intelligence)}
                />
              )
            ) : null}
            {!fullArticle ? (
              <section
                className="premium-article-gate"
                aria-labelledby="premium-gate-title"
              >
                <span className="section-kicker">Premium preview</span>
                <h2 id="premium-gate-title">
                  Unlock the complete market briefing.
                </h2>
                <p>
                  This preview includes the published market, bias and summary.
                  Premium members can read the complete technical analysis,
                  levels, risk factors and planning notes.
                </p>
                <div className="premium-gate-actions">
                  <Link href="/premium" className="button">
                    View premium plans
                  </Link>
                  <Link
                    href={`/login?next=${encodeURIComponent(`/analysis/${article.slug}`)}`}
                    className="text-link"
                  >
                    Sign in to check access →
                  </Link>
                </div>
              </section>
            ) : (
              <>
                <ArticleBody body={fullArticle.body} />

                <section className="analysis-content-section analysis-risk-section">
                  <span className="analysis-section-number">!</span>
                  <div>
                    <span className="section-kicker">Primary risk factors</span>
                    <h2>What could change the outlook</h2>
                    <ul className="analysis-checklist risk-factor-list">
                      {fullArticle.riskFactors.map((factor) => (
                        <li key={factor}>
                          <span aria-hidden="true">!</span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </>
            )}

            <aside className="analysis-risk-disclaimer">
              <span>Educational risk disclaimer</span>
              <p>
                DayTradingPost content is provided for educational and
                informational purposes only. It is not investment advice, a
                solicitation, or a trade signal. Market conditions can change
                without notice, and trading leveraged products or digital assets
                can result in substantial losses. Verify all information
                independently and never risk capital you cannot afford to lose.
              </p>
            </aside>
          </article>

          {!fullArticle ? (
            <aside
              className="analysis-levels-panel premium-preview-panel"
              aria-label="Premium content preview"
            >
              <span className="panel-label">Member-only analysis</span>
              <h2>Included with Premium</h2>
              <ul>
                <li>Support and resistance map</li>
                <li>Full technical overview</li>
                <li>Primary risk factors</li>
                <li>Trade-planning context</li>
              </ul>
            </aside>
          ) : (
            <aside
              className="analysis-levels-panel"
              aria-label={`${article.instrumentSymbol} key levels`}
            >
              <div className="levels-panel-heading">
                <span className="panel-label">Published levels</span>
                <h2>Technical map</h2>
              </div>
              <LevelList
                label="Resistance"
                levels={fullArticle.resistanceLevels}
                tone="resistance"
              />
              <LevelList
                label="Support"
                levels={fullArticle.supportLevels}
                tone="support"
              />
              <p>
                Published analysis · Confirm current market prices independently
              </p>
            </aside>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
