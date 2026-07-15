import { Header } from "@/components/layout/Header";
import { MarketIntelligenceSkeleton } from "@/components/market-intelligence/MarketIntelligenceSkeleton";

export default function MarketIntelligenceAdminLoading() {
  return (
    <main className="mi-admin-page">
      <Header />
      <section className="container mi-admin-shell">
        <MarketIntelligenceSkeleton count={4} />
      </section>
    </main>
  );
}
