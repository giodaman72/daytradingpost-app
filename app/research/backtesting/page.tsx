import type { Metadata } from "next";
import { BacktestWorkbench } from "@/components/backtesting/BacktestWorkbench";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getRequestLocale } from "@/lib/i18n/server";
import { languageAlternates, localizeHref } from "@/lib/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const spanish = locale === "es";
  return {
    title: spanish
      ? "Laboratorio de estrategias cuantitativas"
      : "Quant Strategy Lab",
    description: spanish
      ? "Espacio transparente de backtesting para investigar reglas sistemáticas de trading con datos históricos OHLC."
      : "A transparent research-only backtesting workspace for testing systematic trading rules with historical OHLC data.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: localizeHref("/research/backtesting", locale),
      languages: languageAlternates("/research/backtesting"),
    },
  };
}

export default async function BacktestingPage() {
  const locale = await getRequestLocale();
  const spanish = locale === "es";
  const today = new Date().toISOString().slice(0, 10);
  return (
    <main className="backtest-page">
      <Header />
      <section className="backtest-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="container">
          <span className="section-kicker">
            {spanish
              ? "Laboratorio de investigación cuantitativa · v0.1"
              : "Quant research lab · v0.1"}
          </span>
          <h1>
            {spanish
              ? "Pon a prueba las reglas antes de confiar en la narrativa."
              : "Test the rules before you trust the story."}
          </h1>
          <p>
            {spanish
              ? "Ejecuta una estrategia de tendencia transparente con datos OHLC diarios, tiempos de ejecución explícitos, dimensionamiento del riesgo, comisiones, deslizamiento y medición de drawdown. No se envían órdenes ni se conecta ninguna cuenta de bróker."
              : "Run a transparent trend strategy against daily OHLC data with explicit execution timing, risk sizing, fees, slippage, and drawdown measurement. No orders are sent and no brokerage account is connected."}
          </p>
        </div>
      </section>
      <section className="backtest-content">
        <div className="container">
          <BacktestWorkbench initialEndDate={today} locale={locale} />
          <p className="backtest-disclaimer">
            <strong>
              {spanish
                ? "Investigación exclusivamente educativa."
                : "Educational research only."}
            </strong>{" "}
            {spanish
              ? "Los backtests son hipotéticos, sensibles a los supuestos y están sujetos a sobreajuste, sesgo de supervivencia, errores de datos y cambios en las condiciones del mercado. No constituyen asesoramiento de inversión ni una promesa de resultados futuros."
              : "Backtests are hypothetical, sensitive to assumptions, and subject to overfitting, survivorship bias, data errors, and changing market conditions. They are not investment advice or a promise of future results."}
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
