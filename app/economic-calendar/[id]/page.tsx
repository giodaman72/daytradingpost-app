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

type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEconomicEventById(id);
  return event
    ? {
        title: event.title,
        description:
          event.description ?? `Economic event details for ${event.title}.`,
      }
    : { title: "Economic event not found", robots: { index: false } };
}

export default async function EconomicEventPage({ params }: Props) {
  const { id } = await params;
  const event = await getEconomicEventById(id);
  if (!event) notFound();
  return (
    <main className="economic-page">
      <Header />
      <section className="economic-detail-hero">
        <div className="container">
          <nav aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/economic-calendar">Economic calendar</Link>
            <span>/</span>
            <span aria-current="page">{event.title}</span>
          </nav>
          <div className="economic-detail-labels">
            <CountryFlag code={event.country} name={event.countryName} />
            <CurrencyBadge currency={event.currency} />
            <ImpactBadge impact={event.impact} />
          </div>
          <h1>{event.title}</h1>
          <time dateTime={event.scheduledTime}>
            {formatEconomicTime(event.scheduledTime, "America/New_York")} ET
          </time>
          {event.isFixture ? (
            <p className="economic-fixture-banner">
              <strong>Simulated development event.</strong> This date and every
              value are illustrative.
            </p>
          ) : null}
        </div>
      </section>
      <section className="economic-detail-body">
        <div className="container">
          <EventDetails event={event} />
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
              <span className="section-kicker">Member alerts</span>
              <h2 id="event-reminders-title">Remind me about this event</h2>
              <p>
                Times are shown in New York time. The evaluator reads the latest
                provider schedule before triggering.
              </p>
            </div>
            <div>
              <Link
                href={`/alerts/new?type=economic_event_upcoming&event=${encodeURIComponent(event.id)}&minutes=15`}
              >
                15 minutes before
              </Link>
              <Link
                href={`/alerts/new?type=economic_event_upcoming&event=${encodeURIComponent(event.id)}&minutes=60`}
              >
                1 hour before
              </Link>
              <Link
                href={`/alerts/new?type=economic_event_upcoming&event=${encodeURIComponent(event.id)}&minutes=1440`}
              >
                24 hours before
              </Link>
              <Link
                href={`/alerts/new?type=economic_event_released&event=${encodeURIComponent(event.id)}`}
              >
                On release
              </Link>
            </div>
          </aside>
          <section className="economic-history">
            <h2>Historical values</h2>
            {event.historicalValues.length ? (
              <table>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Actual</th>
                    <th scope="col">Forecast</th>
                    <th scope="col">Previous</th>
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
              <p>No verified historical observations are available.</p>
            )}
          </section>
          <aside className="economic-risk">
            <strong>Educational risk disclaimer</strong>
            <p>
              Economic releases can produce abrupt price changes, slippage, and
              wider spreads. This page provides educational context only and is
              not a forecast, trading signal, or investment recommendation.
            </p>
          </aside>
        </div>
      </section>
      <Footer />
    </main>
  );
}
