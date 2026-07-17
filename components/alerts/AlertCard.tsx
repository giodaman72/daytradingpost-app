import Link from "next/link";
import type { Alert } from "@/types/alert";
import { AlertStatusBadge } from "./AlertStatusBadge";
import { formatAlertCondition } from "@/lib/alerts/alertFormatter";
export function AlertCard({ alert }: { alert: Alert }) {
  return (
    <article className="smart-card">
      <div className="smart-card-top">
        <AlertStatusBadge status={alert.status} />
        <span>{alert.channels.join(" + ")}</span>
      </div>
      <h2>
        <Link href={`/alerts/${alert.id}`}>{alert.name}</Link>
      </h2>
      <p>
        {alert.instrumentSlug ?? alert.economicEventId ?? "Published content"} ·{" "}
        {formatAlertCondition(alert)}
      </p>
      <small>Cooldown: {alert.cooldownMinutes} minutes</small>
    </article>
  );
}
