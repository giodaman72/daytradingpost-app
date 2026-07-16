import Link from "next/link";
import type { EconomicEvent } from "@/types/economic-event";
import { formatEconomicTime } from "@/lib/economic/economicFilters";
import { EconomicCard } from "./EconomicCard";
import { CountryFlag } from "./CountryFlag";
import { CurrencyBadge } from "./CurrencyBadge";
import { ImpactBadge } from "./ImpactBadge";
import { EmptyState } from "./EmptyState";

export function EconomicTable({
  events,
  timeZone = "America/New_York",
}: {
  events: EconomicEvent[];
  timeZone?: string;
}) {
  if (!events.length) return <EmptyState />;
  return (
    <div className="economic-table-wrap">
      {events.some((event) => event.isFixture) ? (
        <p className="economic-fixture-banner" role="note">
          <strong>Simulated development schedule.</strong> Dates and values are
          illustrative and must not be used for trading decisions.
        </p>
      ) : null}
      <table className="economic-table">
        <caption className="sr-only">
          Economic events sorted by scheduled time
        </caption>
        <thead>
          <tr>
            <th scope="col">Time</th>
            <th scope="col">Country</th>
            <th scope="col">Currency</th>
            <th scope="col">Event</th>
            <th scope="col">Impact</th>
            <th scope="col">Forecast</th>
            <th scope="col">Previous</th>
            <th scope="col">Actual</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td>
                <time dateTime={event.scheduledTime}>
                  {formatEconomicTime(event.scheduledTime, timeZone)}
                </time>
              </td>
              <td>
                <CountryFlag code={event.country} name={event.countryName} />
                <span>{event.countryName}</span>
              </td>
              <td>
                <CurrencyBadge currency={event.currency} />
              </td>
              <td>
                <Link href={`/economic-calendar/${event.id}`}>
                  {event.title}
                </Link>
                {event.isFixture ? <small>Simulated</small> : null}
              </td>
              <td>
                <ImpactBadge impact={event.impact} />
              </td>
              <td>{event.forecast ?? "—"}</td>
              <td>{event.previous ?? "—"}</td>
              <td>{event.actual ?? "Pending"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="economic-mobile-list">
        {events.map((event) => (
          <EconomicCard event={event} timeZone={timeZone} key={event.id} />
        ))}
      </div>
    </div>
  );
}
