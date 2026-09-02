import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChartShell } from "@/components/charts/ChartShell";
import { resolveChartSymbol } from "@/lib/charts/chartSymbols";
import { getChartConfig } from "@/lib/charts/chartConfig";
import { getMembershipAccess } from "@/lib/membership/access";
import { listChartLayouts } from "@/lib/charts/chartRepository";
import { languageAlternates, localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import { translateInstrumentName } from "@/lib/i18n/spanish";

type Props = { params: Promise<{ instrument: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ instrument: instrumentSlug }, locale] = await Promise.all([
    params,
    getRequestLocale(),
  ]);
  const instrument = resolveChartSymbol(instrumentSlug);
  if (!instrument) return {};
  const basePath = `/charts/${instrument.slug}`;
  const spanish = locale === "es";
  const instrumentName = spanish
    ? translateInstrumentName(instrument.name)
    : instrument.name;
  return {
    title: spanish
      ? `Gráfico avanzado de ${instrumentName}`
      : `${instrument.name} Advanced Chart`,
    description: spanish
      ? `Gráfico interactivo de ${instrumentName} con atribución del proveedor, indicadores y contexto de DayTradingPost.`
      : `Interactive ${instrument.name} chart with provider attribution, indicators and DayTradingPost context.`,
    alternates: {
      canonical: localizeHref(basePath, locale),
      languages: languageAlternates(basePath),
    },
  };
}
export default async function InstrumentChartPage({ params }: Props) {
  const [{ instrument: instrumentSlug }, locale] = await Promise.all([
    params,
    getRequestLocale(),
  ]);
  const instrument = resolveChartSymbol(instrumentSlug);
  if (!instrument) notFound();
  const spanish = locale === "es";
  const instrumentName = spanish
    ? translateInstrumentName(instrument.name)
    : instrument.name;
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
          <span className="section-kicker">
            {spanish ? "Gráficos avanzados" : "Advanced charting"}
          </span>
          <h1>{instrumentName}</h1>
          <p>
            {spanish
              ? "Los gráficos de terceros, el estado de los datos, el contexto editorial y los diseños de usuario permanecen claramente separados."
              : "Third-party charts, DayTradingPost data status, editorial context and user layouts remain clearly separated."}
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
          locale={locale}
        />
      </div>
      <Footer />
    </main>
  );
}
