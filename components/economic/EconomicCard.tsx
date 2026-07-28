import Link from "next/link";
import type { EconomicEvent } from "@/types/economic-event";
import { formatEconomicTime } from "@/lib/economic/economicFilters";
import { CountryFlag } from "./CountryFlag";
import { CurrencyBadge } from "./CurrencyBadge";
import { EconomicCountdown } from "./EconomicCountdown";
import { ImpactBadge } from "./ImpactBadge";

export function EconomicCard({
  event,
  timeZone = "America/New_York",
  showCountdown = false,
}: {
  event: EconomicEvent;
  timeZone?: string;
  showCountdown?: boolean;
}) {
  return (
    <article className="economic-card">
      <header>
        <div>
          <CountryFlag code={event.country} name={event.countryName} />
          <CurrencyBadge currency={event.currency} />
        </div>
        <ImpactBadge impact={event.impact} />
      </header>
      <h3>
        <Link href={`/economic-calendar/${event.id}`}>{event.title}</Link>
      </h3>
      <time dateTime={event.scheduledTime}>
        {formatEconomicTime(event.scheduledTime, timeZone)}
      </time>
      {showCountdown ? (
        <EconomicCountdown scheduledTime={event.scheduledTime} />
      ) : null}
      <dl>
        <div>
          <dt>Forecast</dt>
          <dd>{event.forecast ?? "—"}</dd>
        </div>
        <div>
          <dt>Previous</dt>
          <dd>{event.previous ?? "—"}</dd>
        </div>
        <div>
          <dt>Actual</dt>
          <dd>{event.actual ?? "Pending"}</dd>
        </div>
      </dl>
      {event.isFixture ? (
        <p className="economic-fixture">
          <strong>Simulated schedule:</strong> Development fixture, not a
          verified event.
        </p>
      ) : null}
      <Link
        className="economic-reminder-link"
        href={`/alerts/new?type=economic_event_upcoming&event=${encodeURIComponent(event.id)}&minutes=60`}
      >
        Set 1-hour reminder
      </Link>
    </article>
  );
}
