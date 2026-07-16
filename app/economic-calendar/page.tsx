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

export const metadata: Metadata = {
  title: "Economic Calendar",
  description:
    "Filterable economic events, release expectations and educational market-risk context.",
  alternates: { canonical: "/economic-calendar" },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EconomicCalendarPage({ searchParams }: Props) {
  const raw = await searchParams;
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
    return `/economic-calendar?${params.toString()}`;
  };
  const pageNumber = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(filteredEvents.length / limit));
  return (
    <main className="economic-page">
      <Header />
      <section className="economic-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="container">
          <span className="section-kicker">Economic intelligence</span>
          <h1>Plan around the events that can reshape volatility.</h1>
          <p>
            Search and filter normalized releases while keeping schedules,
            outcomes, and educational context clearly separated from trade
            recommendations.
          </p>
          <CalendarHeader range={range} timeZone={timeZone} />
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
          />
          <FilterPanel values={{ ...values, range, timeZone }} />
          {parsed.valid ? null : (
            <div className="economic-validation" role="alert">
              <strong>Some filters could not be applied.</strong>
              <ul>
                {parsed.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          <EconomicTable events={events} timeZone={timeZone} />
          {filteredEvents.length > limit ? (
            <nav
              className="economic-pagination"
              aria-label="Economic calendar pages"
            >
              <span>
                Page {pageNumber} of {pageCount}
              </span>
              <div>
                {offset > 0 ? (
                  <Link href={pageQuery(Math.max(0, offset - limit))}>
                    Previous
                  </Link>
                ) : (
                  <span aria-disabled="true">Previous</span>
                )}
                {offset + limit < filteredEvents.length ? (
                  <Link href={pageQuery(offset + limit)}>Next</Link>
                ) : (
                  <span aria-disabled="true">Next</span>
                )}
              </div>
            </nav>
          ) : null}
          <p className="economic-risk">
            <strong>Educational risk disclaimer:</strong> Economic schedules and
            values can change without notice. Verify releases with the original
            source. This calendar is informational and is not investment advice.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
