import Link from "next/link";
import type { EconomicEvent } from "@/types/economic-event";
import { formatEconomicTime } from "@/lib/economic/economicFilters";
import { EconomicCard } from "./EconomicCard";
import { CountryFlag } from "./CountryFlag";
import { CurrencyBadge } from "./CurrencyBadge";
import { ImpactBadge } from "./ImpactBadge";
import { EmptyState } from "./EmptyState";
import { localizeHref, type Locale } from "@/lib/i18n/config";

export function EconomicTable({
  events,
  timeZone = "America/New_York",
  locale = "en",
}: {
  events: EconomicEvent[];
  timeZone?: string;
  locale?: Locale;
}) {
  const spanish = locale === "es";
  if (!events.length) return <EmptyState locale={locale} />;
  return (
    <div className="economic-table-wrap">
      {events.some((event) => event.isFixture) ? (
        <p className="economic-fixture-banner" role="note">
          <strong>
            {spanish
              ? "Calendario de desarrollo simulado."
              : "Simulated development schedule."}
          </strong>{" "}
          {spanish
            ? "Las fechas y valores son ilustrativos y no deben utilizarse para tomar decisiones de trading."
            : "Dates and values are illustrative and must not be used for trading decisions."}
        </p>
      ) : null}
      <table className="economic-table">
        <caption className="sr-only">
          {spanish
            ? "Eventos económicos ordenados por hora programada"
            : "Economic events sorted by scheduled time"}
        </caption>
        <thead>
          <tr>
            <th scope="col">{spanish ? "Hora" : "Time"}</th>
            <th scope="col">{spanish ? "País" : "Country"}</th>
            <th scope="col">{spanish ? "Divisa" : "Currency"}</th>
            <th scope="col">{spanish ? "Evento" : "Event"}</th>
            <th scope="col">{spanish ? "Impacto" : "Impact"}</th>
            <th scope="col">{spanish ? "Previsión" : "Forecast"}</th>
            <th scope="col">{spanish ? "Anterior" : "Previous"}</th>
            <th scope="col">{spanish ? "Dato real" : "Actual"}</th>
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
                <Link
                  href={localizeHref(`/economic-calendar/${event.id}`, locale)}
                >
                  {event.title}
                </Link>
                {event.isFixture ? (
                  <small>{spanish ? "Simulado" : "Simulated"}</small>
                ) : null}
              </td>
              <td>
                <ImpactBadge impact={event.impact} locale={locale} />
              </td>
              <td>{event.forecast ?? "—"}</td>
              <td>{event.previous ?? "—"}</td>
              <td>{event.actual ?? (spanish ? "Pendiente" : "Pending")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="economic-mobile-list">
        {events.map((event) => (
          <EconomicCard
            event={event}
            timeZone={timeZone}
            locale={locale}
            key={event.id}
          />
        ))}
      </div>
    </div>
  );
}
