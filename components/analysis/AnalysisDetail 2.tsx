import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import type { AnalysisMarket } from "@/lib/analysis-data";
import { LevelList } from "./LevelList";
import { ScenarioCard } from "./ScenarioCard";

type AnalysisDetailProps = {
  market: AnalysisMarket;
};

export function AnalysisDetail({ market }: AnalysisDetailProps) {
  return (
    <main className="analysis-page">
      <Header />

      <section className="analysis-detail-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-glow hero-glow-one" aria-hidden="true" />

        <div className="container analysis-detail-heading">
          <nav className="analysis-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/analysis">Analysis</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{market.name}</span>
          </nav>

          <div className="analysis-detail-title-row">
            <div>
              <span className="section-kicker">{market.assetClass}</span>
              <h1>{market.name} technical analysis</h1>
              <p className="analysis-detail-symbol">{market.symbol}</p>
            </div>

            <div className="analysis-detail-snapshot">
              <span className={`analysis-bias bias-${market.bias.toLowerCase()}`}>
                {market.bias} bias
              </span>
              <div>
                <span>Illustrative sample price</span>
                <strong>{market.samplePrice}</strong>
              </div>
            </div>
          </div>

          <div className="sample-content-notice" role="note">
            <strong>Illustrative sample content</strong>
            <span>
              Prices, levels, bias and scenarios on this page are fictional
              examples for product demonstration only. They are not real-time
              market data or trade recommendations.
            </span>
          </div>
        </div>
      </section>

      <section className="analysis-detail-body">
        <div className="container analysis-detail-layout">
          <article className="analysis-detail-main">
            <section className="analysis-content-section">
              <span className="analysis-section-number">01</span>
              <div>
                <span className="section-kicker">Technical overview</span>
                <h2>How the structure reads</h2>
                <p>{market.technicalOverview}</p>
              </div>
            </section>

            <div className="scenario-grid">
              <ScenarioCard direction="bullish">
                {market.bullishScenario}
              </ScenarioCard>
              <ScenarioCard direction="bearish">
                {market.bearishScenario}
              </ScenarioCard>
            </div>

            <section className="analysis-content-section">
              <span className="analysis-section-number">02</span>
              <div>
                <span className="section-kicker">Primary risk factors</span>
                <h2>What could change the outlook</h2>
                <ul className="analysis-checklist risk-factor-list">
                  {market.riskFactors.map((factor) => (
                    <li key={factor}>
                      <span aria-hidden="true">!</span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="analysis-content-section">
              <span className="analysis-section-number">03</span>
              <div>
                <span className="section-kicker">Trade planning notes</span>
                <h2>Build the plan before the position</h2>
                <ul className="analysis-checklist">
                  {market.tradePlanningNotes.map((note) => (
                    <li key={note}>
                      <span aria-hidden="true">✓</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <aside className="analysis-risk-disclaimer">
              <span>Educational risk disclaimer</span>
              <p>
                This illustrative analysis is provided for education and
                interface demonstration only. It does not use live market data
                and is not investment advice, a solicitation, or a trade
                signal. Trading leveraged products and digital assets can lead
                to losses greater than expected. Verify all information
                independently and never risk capital you cannot afford to lose.
              </p>
            </aside>
          </article>

          <aside className="analysis-levels-panel" aria-label={`${market.name} key levels`}>
            <div className="levels-panel-heading">
              <span className="panel-label">Illustrative levels</span>
              <h2>Technical map</h2>
            </div>
            <LevelList
              label="Resistance"
              levels={market.resistanceLevels}
              tone="resistance"
            />
            <LevelList
              label="Support"
              levels={market.supportLevels}
              tone="support"
            />
            <p>Sample levels only · Not real-time market data</p>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}
