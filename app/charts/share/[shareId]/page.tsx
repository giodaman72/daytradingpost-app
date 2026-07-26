import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChartShell } from "@/components/charts/ChartShell";
import { getSharedChartLayout } from "@/lib/charts/chartRepository";
import { resolveChartSymbol } from "@/lib/charts/chartSymbols";

export const metadata: Metadata = {
  title: "Shared chart",
  robots: { index: false, follow: false },
};
export default async function SharedChartPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const shareId = (await params).shareId;
  if (!/^[A-Za-z0-9_-]{20,80}$/.test(shareId)) notFound();
  const layout = await getSharedChartLayout(shareId).catch(() => null);
  const instrument = layout ? resolveChartSymbol(layout.instrumentSlug) : null;
  if (!layout || !instrument) notFound();
  return (
    <main className="charts-page">
      <Header />
      <section className="chart-hero">
        <div className="container">
          <span className="section-kicker">Shared user layout</span>
          <h1>{layout.name}</h1>
          <p>
            This internal link contains sanitized chart settings only. It does
            not include owner identity, private watchlists or account data.
          </p>
        </div>
      </section>
      <div className="container">
        <ChartShell
          initialInstrument={instrument}
          initialTimeframe={layout.timeframe}
          provider={
            layout.provider === "development" ? "first_party" : layout.provider
          }
          layouts={[]}
          premium={false}
          authenticated={false}
        />
      </div>
      <Footer />
    </main>
  );
}
