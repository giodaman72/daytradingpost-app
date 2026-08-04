import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CountryFlag } from "@/components/economic/CountryFlag";
import { CurrencyBadge } from "@/components/economic/CurrencyBadge";
import { EventDetails } from "@/components/economic/EventDetails";
import { ImpactBadge } from "@/components/economic/ImpactBadge";
import {
  getEconomicEventById,
  formatEconomicTime,
} from "@/lib/economic/economicService";
import { AssistantContextActions } from "@/components/assistant/AssistantContextActions";
import { languageAlternates, localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";

type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ id }, locale] = await Promise.all([params, getRequestLocale()]);
  const event = await getEconomicEventById(id);
  const basePath = `/economic-calendar/${id}`;
  return event
    ? {
        title: event.title,
        description:
          event.description ??
          (locale === "es"
            ? `Detalles del evento económico ${event.title}.`
            : `Economic event details for ${event.title}.`),
        alternates: {
          canonical: localizeHref(basePath, locale),
          languages: languageAlternates(basePath),
        },
      }
    : {
        title:
          locale === "es"
            ? "Evento económico no encontrado"
            : "Economic event not found",
        robots: { index: false },
      };
}

export default async function EconomicEventPage({ params }: Props) {
  const [{ id }, locale] = await Promise.all([params, getRequestLocale()]);
  const spanish = locale === "es";
  const event = await getEconomicEventById(id);
  if (!event) notFound();
  return (
    <main className="economic-page">
      <Header />
      <section className="economic-detail-hero">
        <div className="container">
          <nav aria-label={spanish ? "Migas de pan" : "Breadcrumb"}>
            <Link href={localizeHref("/", locale)}>
              {spanish ? "Inicio" : "Home"}
            </Link>
            <span>/</span>
            <Link href={localizeHref("/economic-calendar", locale)}>
              {spanish ? "Calendario económico" : "Economic calendar"}
            </Link>
            <span>/</span>
            <span aria-current="page">{event.title}</span>
          </nav>
          <div className="economic-detail-labels">
            <CountryFlag code={event.country} name={event.countryName} />
            <CurrencyBadge currency={event.currency} />
            <ImpactBadge impact={event.impact} locale={locale} />
          </div>
          <h1>{event.title}</h1>
          <time dateTime={event.scheduledTime}>
            {formatEconomicTime(event.scheduledTime, "America/New_York")} ET
          </time>
          {event.isFixture ? (
            <p className="economic-fixture-banner">
              <strong>
                {spanish
                  ? "Evento de desarrollo simulado."
                  : "Simulated development event."}
              </strong>{" "}
              {spanish
                ? "La fecha y todos los valores son ilustrativos."
                : "This date and every value are illustrative."}
            </p>
          ) : null}
        </div>
      </section>
      <section className="economic-detail-body">
        <div className="container">
          <EventDetails event={event} locale={locale} />
          <AssistantContextActions
            mode="economic_event"
            event={event.id}
            prompts={[
              "Explain this economic event.",
              "Why can this event affect the currency?",
              "Compare actual versus forecast without inventing missing results.",
              "Explain possible volatility scenarios.",
            ]}
          />
          <aside
            className="economic-reminders"
            aria-labelledby="event-reminders-title"
          >
            <div>
              <span className="section-kicker">
                {spanish ? "Alertas para miembros" : "Member alerts"}
              </span>
              <h2 id="event-reminders-title">
                {spanish
                  ? "Recordarme este evento"
                  : "Remind me about this event"}
              </h2>
              <p>
                {spanish
                  ? "Las horas se muestran en horario de Nueva York. El evaluador consulta el calendario más reciente del proveedor antes de activar la alerta."
                  : "Times are shown in New York time. The evaluator reads the latest provider schedule before triggering."}
              </p>
            </div>
            <div>
              <Link
                href={`/alerts/new?type=economic_event_upcoming&event=${encodeURIComponent(event.id)}&minutes=15`}
              >
                {spanish ? "15 minutos antes" : "15 minutes before"}
              </Link>
              <Link
                href={`/alerts/new?type=economic_event_upcoming&event=${encodeURIComponent(event.id)}&minutes=60`}
              >
                {spanish ? "1 hora antes" : "1 hour before"}
              </Link>
              <Link
                href={`/alerts/new?type=economic_event_upcoming&event=${encodeURIComponent(event.id)}&minutes=1440`}
              >
                {spanish ? "24 horas antes" : "24 hours before"}
              </Link>
              <Link
                href={`/alerts/new?type=economic_event_released&event=${encodeURIComponent(event.id)}`}
              >
                {spanish ? "Al publicarse" : "On release"}
              </Link>
            </div>
          </aside>
          <section className="economic-history">
            <h2>{spanish ? "Valores históricos" : "Historical values"}</h2>
            {event.historicalValues.length ? (
              <table>
                <thead>
                  <tr>
                    <th scope="col">{spanish ? "Fecha" : "Date"}</th>
                    <th scope="col">{spanish ? "Dato real" : "Actual"}</th>
                    <th scope="col">{spanish ? "Previsión" : "Forecast"}</th>
                    <th scope="col">{spanish ? "Anterior" : "Previous"}</th>
                  </tr>
                </thead>
                <tbody>
                  {event.historicalValues.map((value) => (
                    <tr key={value.date}>
                      <td>
                        <time dateTime={value.date}>
                          {formatEconomicTime(value.date, "UTC")}
                        </time>
                      </td>
                      <td>{value.actual ?? "—"}</td>
                      <td>{value.forecast ?? "—"}</td>
                      <td>{value.previous ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>
                {spanish
                  ? "No hay observaciones históricas verificadas disponibles."
                  : "No verified historical observations are available."}
              </p>
            )}
          </section>
          <aside className="economic-risk">
            <strong>
              {spanish
                ? "Aviso educativo de riesgo"
                : "Educational risk disclaimer"}
            </strong>
            <p>
              {spanish
                ? "Las publicaciones económicas pueden provocar cambios bruscos de precio, deslizamiento y diferenciales más amplios. Esta página ofrece únicamente contexto educativo; no es una previsión, señal de trading ni recomendación de inversión."
                : "Economic releases can produce abrupt price changes, slippage, and wider spreads. This page provides educational context only and is not a forecast, trading signal, or investment recommendation."}
            </p>
          </aside>
        </div>
      </section>
      <Footer />
    </main>
  );
}
