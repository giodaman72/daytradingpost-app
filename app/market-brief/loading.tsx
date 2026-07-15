import { Header } from "@/components/layout/Header";
import { MarketIntelligenceSkeleton } from "@/components/market-intelligence/MarketIntelligenceSkeleton";

export default function MarketBriefLoading() {
  return (
    <main className="analysis-page">
      <Header />
      <section className="analysis-library-section">
        <div className="container">
          <MarketIntelligenceSkeleton count={6} />
        </div>
      </section>
    </main>
  );
}
