import Link from "next/link";
import type { Alert } from "@/types/alert";
import { DashboardPanel } from "./DashboardPanel";
import { AlertStatusBadge } from "@/components/alerts/AlertStatusBadge";
export function SmartAlerts({ alerts }: { alerts: Alert[] }) {
  const active = alerts.filter((item) => item.status === "active");
  const recent = alerts.filter((item) => item.lastTriggeredAt).slice(0, 3);
  return (
    <DashboardPanel
      id="smart-alerts"
      eyebrow={`${active.length} active`}
      title="Smart alerts"
      action={<Link href="/alerts/new">Quick create</Link>}
    >
      <div className="dashboard-alert-summary">
        <strong>{active.length}</strong>
        <span>conditions evaluated server-side</span>
      </div>
      {recent.length ? (
        <ul>
          {recent.map((alert) => (
            <li key={alert.id}>
              <AlertStatusBadge status={alert.status} />
              <Link href={`/alerts/${alert.id}`}>{alert.name}</Link>
              <time dateTime={alert.lastTriggeredAt!}>
                {new Date(alert.lastTriggeredAt!).toLocaleDateString("en-US")}
              </time>
            </li>
          ))}
        </ul>
      ) : (
        <p>No recently triggered alerts.</p>
      )}
      <Link className="text-link" href="/alerts">
        Manage alerts →
      </Link>
    </DashboardPanel>
  );
}
