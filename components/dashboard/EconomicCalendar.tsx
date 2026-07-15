import { developmentEconomicCalendarProvider } from "@/lib/market/economicCalendarProvider";
import { DashboardPanel } from "./DashboardPanel";
import { DashboardEmptyState } from "./DashboardEmptyState";

export async function EconomicCalendar() {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const events = await developmentEconomicCalendarProvider.getEvents(
    today.toISOString(),
    tomorrow.toISOString(),
  );

  return (
    <DashboardPanel
      id="economic-calendar"
      eyebrow="Illustrative schedule"
      title="Economic Calendar"
    >
      {events.length ? (
        <>
          <div className="dashboard-calendar-notice" role="note">
            Development fixture data · Verify every date and time independently
          </div>
          <ol className="dashboard-calendar-list">
            {events.map((item) => (
              <li key={item.id}>
                <time dateTime={item.scheduledAt}>
                  {new Intl.DateTimeFormat("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: "America/New_York",
                  }).format(new Date(item.scheduledAt))}
                </time>
                <span className="dashboard-currency">{item.currency}</span>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.impact} impact</span>
                </div>
                <i
                  className={`impact-${item.impact.toLowerCase()}`}
                  aria-hidden="true"
                />
              </li>
            ))}
          </ol>
        </>
      ) : (
        <DashboardEmptyState
          title="No calendar events connected"
          description="The normalized provider interface is ready for a future verified data source. No events are fabricated in production."
        />
      )}
    </DashboardPanel>
  );
}
