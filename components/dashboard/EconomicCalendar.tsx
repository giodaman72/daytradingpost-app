import Link from "next/link";
import { EconomicCard } from "@/components/economic/EconomicCard";
import {
  getEconomicToday,
  getEconomicTomorrow,
  getEconomicWeek,
  getRecentEconomicReleases,
  getUpcomingEconomicEvents,
} from "@/lib/economic/economicService";
import { DashboardPanel } from "./DashboardPanel";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { localizeHref, type Locale } from "@/lib/i18n/config";

export async function EconomicCalendar({ locale = "en" }: { locale?: Locale }) {
  const spanish = locale === "es";
  const [today, tomorrow, week, upcoming, recent] = await Promise.all([
    getEconomicToday(),
    getEconomicTomorrow(),
    getEconomicWeek(),
    getUpcomingEconomicEvents(4),
    getRecentEconomicReleases(4),
  ]);
  const groups = [
    [spanish ? "Eventos de hoy" : "Today’s events", today.events],
    [spanish ? "Mañana" : "Tomorrow", tomorrow.events],
    [spanish ? "Esta semana" : "This week", week.events],
    [
      spanish ? "Próximos de alto impacto" : "Upcoming high impact",
      upcoming.events.filter((event) => event.impact === "high"),
    ],
    [spanish ? "Publicados recientemente" : "Recently released", recent.events],
  ] as const;
  const hasEvents = groups.some(([, events]) => events.length);
  return (
    <DashboardPanel
      id="economic-calendar"
      eyebrow={
        spanish ? "Riesgo programado de mercado" : "Scheduled market risk"
      }
      title={spanish ? "Inteligencia económica" : "Economic Intelligence"}
      className="dashboard-panel-wide"
      action={
        <Link
          href={localizeHref("/economic-calendar", locale)}
          className="dashboard-panel-link"
        >
          {spanish ? "Calendario completo" : "Full calendar"} →
        </Link>
      }
    >
      {hasEvents ? (
        <div className="dashboard-economic-groups">
          {groups.map(([label, events]) => (
            <section key={label}>
              <h3>{label}</h3>
              {events.length ? (
                <div className="economic-card-grid">
                  {events
                    .slice(
                      0,
                      label === (spanish ? "Esta semana" : "This week") ? 4 : 2,
                    )
                    .map((event) => (
                      <EconomicCard
                        event={event}
                        key={event.id}
                        locale={locale}
                      />
                    ))}
                </div>
              ) : (
                <p>
                  {spanish
                    ? "No hay eventos verificados."
                    : "No verified events."}
                </p>
              )}
            </section>
          ))}
        </div>
      ) : (
        <DashboardEmptyState
          title={
            spanish
              ? "No hay eventos económicos verificados"
              : "No verified economic events"
          }
          description={
            spanish
              ? "Conecta un proveedor de producción o activa explícitamente el calendario simulado fuera de producción."
              : "Connect a production provider or explicitly enable the simulated development calendar outside production."
          }
        />
      )}
    </DashboardPanel>
  );
}
