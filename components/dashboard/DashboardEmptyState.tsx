import type { ReactNode } from "react";

export function DashboardEmptyState({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="dashboard-empty-state" role="status">
      <span aria-hidden="true">◇</span>
      <strong>{title}</strong>
      <p>{description}</p>
      {action}
    </div>
  );
}
