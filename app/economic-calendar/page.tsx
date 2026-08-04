import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CalendarHeader } from "@/components/economic/CalendarHeader";
import { EconomicTable } from "@/components/economic/EconomicTable";
import { FilterPanel } from "@/components/economic/FilterPanel";
import { StatisticsCards } from "@/components/economic/StatisticsCards";
import {
  getEconomicToday,
  getEconomicTomorrow,
  getEconomicWeek,
} from "@/lib/economic/economicService";
import {
  filterEconomicEvents,
  paginateEconomicEvents,
} from "@/lib/economic/economicFilters";
import { calculateEconomicStatistics } from "@/lib/economic/economicStatistics";
import {
  isValidTimeZone,
  parseEconomicFilters,
} from "@/lib/economic/economicValidation";
import { languageAlternates, localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const spanish = locale === "es";
  return {
    title: spanish ? "Calendario económico" : "Economic Calendar",
    description: spanish
      ? "Eventos económicos filtrables, previsiones y contexto educativo sobre el riesgo de mercado."
      : "Filterable economic events, release expectations and educational market-risk context.",
    alternates: {
      canonical: localizeHref("/economic-calendar", locale),
      languages: languageAlternates("/economic-calendar"),
    },
  };
}

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EconomicCalendarPage({ searchParams }: Props) {
  const [raw, locale] = await Promise.all([searchParams, getRequestLocale()]);
  const spanish = locale === "es";
  const values = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
  const range = ["today", "tomorrow", "week"].includes(values.range ?? "")
    ? values.range!
    : "week";
  const timeZone =
    values.timeZone && isValidTimeZone(values.timeZone)
      ? values.timeZone
      : "America/New_York";
  const now = new Date();
  const [base, statisticsWeek, statisticsTomorrow] = await Promise.all([
    range === "today"
      ? getEconomicToday(now, timeZone)
      : range === "tomorrow"
        ? getEconomicTomorrow(now, timeZone)
        : getEconomicWeek(now, timeZone),
    getEconomicWeek(now, timeZone),
    getEconomicTomorrow(now, timeZone),
  ]);
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values))
    if (value) query.set(key, value);
  const parsed = parseEconomicFilters(query);
  const filteredEvents = filterEconomicEvents(base.events, {
    ...parsed.filters,
    from: undefined,
    to: undefined,
    limit: undefined,
    offset: undefined,
  });
  const limit = Math.min(parsed.filters.limit ?? 20, 20);
  const offset = parsed.filters.offset ?? 0;
  const events = paginateEconomicEvents(filteredEvents, limit, offset);
  const statisticsEvents = [
    ...statisticsWeek.events,
    ...statisticsTomorrow.events,
  ].filter(
    (event, index, all) =>
      all.findIndex((candidate) => candidate.id === event.id) === index,
  );
  const pageQuery = (nextOffset: number) => {
    const params = new URLSearchParams(query);
    params.set("limit", String(limit));
    params.set("offset", String(nextOffset));
    return localizeHref(`/economic-calendar?${params.toString()}`, locale);
  };
  const pageNumber = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(filteredEvents.length / limit));
  return (
    <main className="economic-page">
      <Header />
      <section className="economic-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="container">
          <span className="section-kicker">
            {spanish ? "Inteligencia económica" : "Economic intelligence"}
          </span>
          <h1>
            {spanish
              ? "Planifica en torno a los eventos que pueden transformar la volatilidad."
              : "Plan around the events that can reshape volatility."}
          </h1>
          <p>
            {spanish
              ? "Busca y filtra publicaciones normalizadas manteniendo separados los horarios, resultados y contexto educativo de cualquier recomendación de trading."
              : "Search and filter normalized releases while keeping schedules, outcomes, and educational context clearly separated from trade recommendations."}
          </p>
          <CalendarHeader range={range} timeZone={timeZone} locale={locale} />
        </div>
      </section>
      <section className="economic-library">
        <div className="container">
          <StatisticsCards
            statistics={calculateEconomicStatistics(
              statisticsEvents,
              now,
              timeZone,
            )}
            locale={locale}
          />
          <FilterPanel
            values={{ ...values, range, timeZone }}
            locale={locale}
          />
          {parsed.valid ? null : (
            <div className="economic-validation" role="alert">
              <strong>
                {spanish
                  ? "No se pudieron aplicar algunos filtros."
                  : "Some filters could not be applied."}
              </strong>
              <ul>
                {parsed.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          <EconomicTable events={events} timeZone={timeZone} locale={locale} />
          {filteredEvents.length > limit ? (
            <nav
              className="economic-pagination"
              aria-label={
                spanish
                  ? "Páginas del calendario económico"
                  : "Economic calendar pages"
              }
            >
              <span>
                {spanish ? "Página" : "Page"} {pageNumber}{" "}
                {spanish ? "de" : "of"} {pageCount}
              </span>
              <div>
                {offset > 0 ? (
                  <Link href={pageQuery(Math.max(0, offset - limit))}>
                    {spanish ? "Anterior" : "Previous"}
                  </Link>
                ) : (
                  <span aria-disabled="true">
                    {spanish ? "Anterior" : "Previous"}
                  </span>
                )}
                {offset + limit < filteredEvents.length ? (
                  <Link href={pageQuery(offset + limit)}>
                    {spanish ? "Siguiente" : "Next"}
                  </Link>
                ) : (
                  <span aria-disabled="true">
                    {spanish ? "Siguiente" : "Next"}
                  </span>
                )}
              </div>
            </nav>
          ) : null}
          <p className="economic-risk">
            <strong>
              {spanish
                ? "Aviso educativo de riesgo:"
                : "Educational risk disclaimer:"}
            </strong>{" "}
            {spanish
              ? "Los calendarios y valores económicos pueden cambiar sin aviso. Verifica las publicaciones en la fuente original. Este calendario es informativo y no constituye asesoramiento de inversión."
              : "Economic schedules and values can change without notice. Verify releases with the original source. This calendar is informational and is not investment advice."}
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
