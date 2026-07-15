import type { AlertStatus } from "@/types/alert";
export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  return (
    <span className={`alert-status status-${status}`}>
      <i aria-hidden="true" />
      {status}
    </span>
  );
}
