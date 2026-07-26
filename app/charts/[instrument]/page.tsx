import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChartShell } from "@/components/charts/ChartShell";
import { resolveChartSymbol } from "@/lib/charts/chartSymbols";
import { getChartConfig } from "@/lib/charts/chartConfig";
import { getMembershipAccess } from "@/lib/membership/access";
import { listChartLayouts } from "@/lib/charts/chartRepository";

type Props = { params: Promise<{ instrument: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const instrument = resolveChartSymbol((await params).instrument);
  if (!instrument) return {};
  return {
    title: `${instrument.name} Advanced Chart`,
    description: `Interactive ${instrument.name} chart with provider attribution, indicators and DayTradingPost context.`,
    alternates: { canonical: `/charts/${instrument.slug}` },
  };
}
export default async function InstrumentChartPage({ params }: Props) {
  const instrument = resolveChartSymbol((await params).instrument);
  if (!instrument) notFound();
  const [access, config] = await Promise.all([
    getMembershipAccess(),
    Promise.resolve(getChartConfig()),
  ]);
  const layouts = access.user
    ? await listChartLayouts(access.user.id).catch(() => [])
    : [];
  return (
    <main className="charts-page">
      <Header />
      <section className="chart-hero">
        <div className="container">
          <span className="section-kicker">Advanced charting</span>
          <h1>{instrument.name}</h1>
          <p>
            Third-party charts, DayTradingPost data status, editorial context
            and user layouts remain clearly separated.
          </p>
        </div>
      </section>
      <div className="container">
        <ChartShell
          initialInstrument={instrument}
          initialTimeframe={config.defaultTimeframe}
          provider={config.provider}
          layouts={layouts.filter(
            (item) => item.instrumentSlug === instrument.slug,
          )}
          premium={access.hasPremiumAccess}
          authenticated={Boolean(access.user)}
        />
      </div>
      <Footer />
    </main>
  );
}
