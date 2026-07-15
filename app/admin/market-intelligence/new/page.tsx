import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MarketIntelligenceEditor } from "@/components/market-intelligence/MarketIntelligenceEditor";
import { requireMarketEditor } from "@/lib/auth/adminAuthorization";
import { createMarketIntelligence } from "../actions";

export const metadata: Metadata = {
  title: "New Market Outlook",
  robots: { index: false, follow: false },
};

export default async function NewMarketIntelligencePage() {
  await requireMarketEditor();
  return (
    <main className="mi-admin-page">
      <Header />
      <section className="container mi-admin-shell narrow">
        <Link className="text-link" href="/admin/market-intelligence">
          ← All outlooks
        </Link>
        <span className="section-kicker">Editorial operations</span>
        <h1>Create market outlook</h1>
        <MarketIntelligenceEditor
          action={createMarketIntelligence}
          defaultDate={new Date().toISOString().slice(0, 10)}
        />
      </section>
      <Footer />
    </main>
  );
}
