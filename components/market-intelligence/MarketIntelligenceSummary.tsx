import { EDUCATIONAL_RISK_DISCLAIMER } from "@/lib/market/marketIntelligenceTransforms";
import { LastUpdated } from "./LastUpdated";
import { MarketBiasBadge } from "./MarketBiasBadge";
import { MarketLevels } from "./MarketLevels";
import type { MarketIntelligenceRecord } from "@/types/market-intelligence";
import type { Locale } from "@/lib/i18n/config";

export function MarketIntelligenceSummary({
  intelligence,
  locale = "en",
}: {
  intelligence: MarketIntelligenceRecord;
  locale?: Locale;
}) {
  const spanish = locale === "es";
  return (
    <section
      className="mi-summary"
      aria-labelledby={`outlook-${intelligence.id}`}
    >
      <header>
        <div>
          <span className="section-kicker">
            {spanish
              ? "Perspectiva editorial de mercado · sin precios en directo"
              : "Editorial market outlook · no live prices"}
          </span>
          <h2 id={`outlook-${intelligence.id}`}>
            {intelligence.instrumentName} <small>{intelligence.symbol}</small>
          </h2>
        </div>
        <MarketBiasBadge bias={intelligence.bias} locale={locale} />
      </header>
      <p className="mi-summary-lead">{intelligence.shortSummary}</p>
      <LastUpdated
        value={intelligence.updatedAt}
        validForDate={intelligence.validForDate}
        locale={locale}
      />
      <div className="mi-summary-stats">
        <span>
          {spanish ? "Impulso" : "Momentum"}{" "}
          <strong>{intelligence.momentum}</strong>
        </span>
        <span>
          {spanish ? "Volatilidad" : "Volatility"}{" "}
          <strong>{intelligence.volatility}</strong>
        </span>
      </div>
      <div className="mi-summary-section">
        <h3>{spanish ? "Resumen técnico" : "Technical overview"}</h3>
        <p>{intelligence.technicalOverview}</p>
      </div>
      <div className="mi-level-grid">
        <MarketLevels
          label={spanish ? "Soporte" : "Support"}
          levels={intelligence.supportLevels}
          locale={locale}
        />
        <MarketLevels
          label={spanish ? "Resistencia" : "Resistance"}
          levels={intelligence.resistanceLevels}
          locale={locale}
        />
      </div>
      <div className="mi-scenario-grid">
        <div>
          <h3>{spanish ? "Escenario alcista" : "Bullish scenario"}</h3>
          <p>{intelligence.bullishScenario}</p>
        </div>
        <div>
          <h3>{spanish ? "Escenario bajista" : "Bearish scenario"}</h3>
          <p>{intelligence.bearishScenario}</p>
        </div>
      </div>
      <div className="mi-summary-section">
        <h3>
          {spanish ? "Principales factores de riesgo" : "Primary risk factors"}
        </h3>
        <ul>
          {intelligence.riskFactors.map((risk) => (
            <li key={risk}>{risk}</li>
          ))}
        </ul>
      </div>
      <p className="mi-disclaimer">
        <strong>
          {spanish
            ? "Aviso educativo de riesgo:"
            : "Educational risk disclaimer:"}
        </strong>{" "}
        {spanish
          ? "Este contenido es educativo e informativo, no asesoramiento de inversión ni una señal de trading."
          : EDUCATIONAL_RISK_DISCLAIMER}
      </p>
    </section>
  );
}
