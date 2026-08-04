import Link from "next/link";
import type { EconomicEvent } from "@/types/economic-event";
import { formatEconomicTime } from "@/lib/economic/economicFilters";
import { CountryFlag } from "./CountryFlag";
import { CurrencyBadge } from "./CurrencyBadge";
import { EconomicCountdown } from "./EconomicCountdown";
import { ImpactBadge } from "./ImpactBadge";
import { localizeHref, type Locale } from "@/lib/i18n/config";

export function EconomicCard({
  event,
  timeZone = "America/New_York",
  showCountdown = false,
  locale = "en",
}: {
  event: EconomicEvent;
  timeZone?: string;
  showCountdown?: boolean;
  locale?: Locale;
}) {
  const spanish = locale === "es";
  return (
    <article className="economic-card">
      <header>
        <div>
          <CountryFlag code={event.country} name={event.countryName} />
          <CurrencyBadge currency={event.currency} />
        </div>
        <ImpactBadge impact={event.impact} locale={locale} />
      </header>
      <h3>
        <Link href={localizeHref(`/economic-calendar/${event.id}`, locale)}>
          {event.title}
        </Link>
      </h3>
      <time dateTime={event.scheduledTime}>
        {formatEconomicTime(event.scheduledTime, timeZone)}
      </time>
      {showCountdown ? (
        <EconomicCountdown
          scheduledTime={event.scheduledTime}
          locale={locale}
        />
      ) : null}
      <dl>
        <div>
          <dt>{spanish ? "Previsión" : "Forecast"}</dt>
          <dd>{event.forecast ?? "—"}</dd>
        </div>
        <div>
          <dt>{spanish ? "Anterior" : "Previous"}</dt>
          <dd>{event.previous ?? "—"}</dd>
        </div>
        <div>
          <dt>{spanish ? "Dato real" : "Actual"}</dt>
          <dd>{event.actual ?? (spanish ? "Pendiente" : "Pending")}</dd>
        </div>
      </dl>
      {event.isFixture ? (
        <p className="economic-fixture">
          <strong>
            {spanish ? "Calendario simulado:" : "Simulated schedule:"}
          </strong>{" "}
          {spanish
            ? "Ejemplo de desarrollo; no es un evento verificado."
            : "Development fixture, not a verified event."}
        </p>
      ) : null}
      <Link
        className="economic-reminder-link"
        href={localizeHref(
          `/alerts/new?type=economic_event_upcoming&event=${encodeURIComponent(event.id)}&minutes=60`,
          locale,
        )}
      >
        {spanish ? "Crear recordatorio de 1 hora" : "Set 1-hour reminder"}
      </Link>
    </article>
  );
}
