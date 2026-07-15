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

export async function EconomicCalendar() {
  const [today, tomorrow, week, upcoming, recent] = await Promise.all([
    getEconomicToday(),
    getEconomicTomorrow(),
    getEconomicWeek(),
    getUpcomingEconomicEvents(4),
    getRecentEconomicReleases(4),
  ]);
  const groups = [
    ["Today’s events", today.events],
    ["Tomorrow", tomorrow.events],
    ["This week", week.events],
    [
      "Upcoming high impact",
      upcoming.events.filter((event) => event.impact === "high"),
    ],
    ["Recently released", recent.events],
  ] as const;
  const hasEvents = groups.some(([, events]) => events.length);
  return (
    <DashboardPanel
      id="economic-calendar"
      eyebrow="Scheduled market risk"
      title="Economic Intelligence"
      className="dashboard-panel-wide"
      action={
        <Link href="/economic-calendar" className="dashboard-panel-link">
          Full calendar →
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
                    .slice(0, label === "This week" ? 4 : 2)
                    .map((event) => (
                      <EconomicCard event={event} key={event.id} />
                    ))}
                </div>
              ) : (
                <p>No verified events.</p>
              )}
            </section>
          ))}
        </div>
      ) : (
        <DashboardEmptyState
          title="No verified economic events"
          description="Connect a production provider or explicitly enable the simulated development calendar outside production."
        />
      )}
    </DashboardPanel>
  );
}
