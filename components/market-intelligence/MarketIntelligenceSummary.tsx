import { EDUCATIONAL_RISK_DISCLAIMER } from "@/lib/market/marketIntelligenceTransforms";
import { LastUpdated } from "./LastUpdated";
import { MarketBiasBadge } from "./MarketBiasBadge";
import { MarketLevels } from "./MarketLevels";
import type { MarketIntelligenceRecord } from "@/types/market-intelligence";

export function MarketIntelligenceSummary({
  intelligence,
}: {
  intelligence: MarketIntelligenceRecord;
}) {
  return (
    <section
      className="mi-summary"
      aria-labelledby={`outlook-${intelligence.id}`}
    >
      <header>
        <div>
          <span className="section-kicker">
            Editorial market outlook · no live prices
          </span>
          <h2 id={`outlook-${intelligence.id}`}>
            {intelligence.instrumentName} <small>{intelligence.symbol}</small>
          </h2>
        </div>
        <MarketBiasBadge bias={intelligence.bias} />
      </header>
      <p className="mi-summary-lead">{intelligence.shortSummary}</p>
      <LastUpdated
        value={intelligence.updatedAt}
        validForDate={intelligence.validForDate}
      />
      <div className="mi-summary-stats">
        <span>
          Momentum <strong>{intelligence.momentum}</strong>
        </span>
        <span>
          Volatility <strong>{intelligence.volatility}</strong>
        </span>
      </div>
      <div className="mi-summary-section">
        <h3>Technical overview</h3>
        <p>{intelligence.technicalOverview}</p>
      </div>
      <div className="mi-level-grid">
        <MarketLevels label="Support" levels={intelligence.supportLevels} />
        <MarketLevels
          label="Resistance"
          levels={intelligence.resistanceLevels}
        />
      </div>
      <div className="mi-scenario-grid">
        <div>
          <h3>Bullish scenario</h3>
          <p>{intelligence.bullishScenario}</p>
        </div>
        <div>
          <h3>Bearish scenario</h3>
          <p>{intelligence.bearishScenario}</p>
        </div>
      </div>
      <div className="mi-summary-section">
        <h3>Primary risk factors</h3>
        <ul>
          {intelligence.riskFactors.map((risk) => (
            <li key={risk}>{risk}</li>
          ))}
        </ul>
      </div>
      <p className="mi-disclaimer">
        <strong>Educational risk disclaimer:</strong>{" "}
        {EDUCATIONAL_RISK_DISCLAIMER}
      </p>
    </section>
  );
}
