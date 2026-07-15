import type { Alert } from "@/types/alert";
import { formatAlertCondition } from "@/lib/alerts/alertFormatter";
export function AlertTriggerSummary({ alert }: { alert: Alert }) {
  return (
    <dl className="smart-details">
      <div>
        <dt>Type</dt>
        <dd>{alert.alertType.replaceAll("_", " ")}</dd>
      </div>
      <div>
        <dt>Condition</dt>
        <dd>{formatAlertCondition(alert)}</dd>
      </div>
      <div>
        <dt>Source</dt>
        <dd>
          {alert.instrumentSlug ?? alert.economicEventId ?? "Published content"}
        </dd>
      </div>
      <div>
        <dt>Channels</dt>
        <dd>{alert.channels.join(", ")}</dd>
      </div>
      <div>
        <dt>Cooldown</dt>
        <dd>{alert.cooldownMinutes} minutes</dd>
      </div>
    </dl>
  );
}
