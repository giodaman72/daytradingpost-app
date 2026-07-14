import { economicEvents } from "@/lib/dashboard/data";
import { DashboardPanel } from "./DashboardPanel";

export function EconomicCalendar() {
  return (
    <DashboardPanel
      id="economic-calendar"
      eyebrow="Illustrative schedule"
      title="Economic Calendar"
    >
      <div className="dashboard-calendar-notice" role="note">
        Placeholder events · Verify dates and times before trading
      </div>
      <ol className="dashboard-calendar-list">
        {economicEvents.map((item) => (
          <li key={item.id}>
            <time>{item.time}</time>
            <span className="dashboard-currency">{item.currency}</span>
            <div>
              <strong>{item.event}</strong>
              <span>{item.impact} impact</span>
            </div>
            <i
              className={`impact-${item.impact.toLowerCase()}`}
              aria-hidden="true"
            />
          </li>
        ))}
      </ol>
    </DashboardPanel>
  );
}
