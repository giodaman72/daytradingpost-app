import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MarketIntelligenceEditor } from "@/components/market-intelligence/MarketIntelligenceEditor";
import { requireMarketEditor } from "@/lib/auth/adminAuthorization";
import { findIntelligenceById } from "@/lib/market/marketIntelligenceRepository";
import { updateMarketIntelligence } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Market Outlook",
  robots: { index: false, follow: false },
};

export default async function EditMarketIntelligencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireMarketEditor();
  const { id } = await params;
  const record = await findIntelligenceById(id);
  if (!record) notFound();

  return (
    <main className="mi-admin-page">
      <Header />
      <section className="container mi-admin-shell narrow">
        <Link className="text-link" href="/admin/market-intelligence">
          ← All outlooks
        </Link>
        <span className="section-kicker">Editorial operations</span>
        <h1>Edit {record.instrumentName} outlook</h1>
        <MarketIntelligenceEditor
          action={updateMarketIntelligence.bind(null, id)}
          record={record}
        />
      </section>
      <Footer />
    </main>
  );
}
