import type { AlertHistoryEvent } from "@/types/alert-history";
import { acknowledgeAlertAction } from "@/app/alerts/actions";
export function AlertHistoryTable({ events }: { events: AlertHistoryEvent[] }) {
  if (!events.length)
    return (
      <div className="smart-empty">
        <h2>No triggered alerts</h2>
        <p>Verified trigger events and delivery results will appear here.</p>
      </div>
    );
  return (
    <div className="smart-table-wrap">
      <table className="smart-table">
        <caption className="sr-only">Alert trigger history</caption>
        <thead>
          <tr>
            <th scope="col">Triggered</th>
            <th scope="col">Event</th>
            <th scope="col">Value</th>
            <th scope="col">Delivery</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td>
                <time dateTime={event.triggeredAt}>
                  {new Date(event.triggeredAt).toLocaleString("en-US", {
                    timeZone: "America/New_York",
                  })}
                </time>
              </td>
              <td>{event.eventType.replaceAll("_", " ")}</td>
              <td>{event.triggerValue ?? "Event"}</td>
              <td>{event.notificationStatus}</td>
              <td>
                {event.acknowledgedAt ? (
                  "Acknowledged"
                ) : (
                  <form action={acknowledgeAlertAction}>
                    <input type="hidden" name="id" value={event.id} />
                    <button type="submit">Acknowledge</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
