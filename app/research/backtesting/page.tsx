import type { Metadata } from "next";
import { BacktestWorkbench } from "@/components/backtesting/BacktestWorkbench";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Quant Strategy Lab",
  description:
    "A transparent research-only backtesting workspace for testing systematic trading rules with historical OHLC data.",
  robots: { index: false, follow: false },
};

export default function BacktestingPage() {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <main className="backtest-page">
      <Header />
      <section className="backtest-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="container">
          <span className="section-kicker">Quant research lab · v0.1</span>
          <h1>Test the rules before you trust the story.</h1>
          <p>
            Run a transparent trend strategy against daily OHLC data with
            explicit execution timing, risk sizing, fees, slippage, and drawdown
            measurement. No orders are sent and no brokerage account is
            connected.
          </p>
        </div>
      </section>
      <section className="backtest-content">
        <div className="container">
          <BacktestWorkbench initialEndDate={today} />
          <p className="backtest-disclaimer">
            <strong>Educational research only.</strong> Backtests are
            hypothetical, sensitive to assumptions, and subject to overfitting,
            survivorship bias, data errors, and changing market conditions. They
            are not investment advice or a promise of future results.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
