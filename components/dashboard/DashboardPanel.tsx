import type { ReactNode } from "react";

type DashboardPanelProps = {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  eyebrow: string;
  id: string;
  title: string;
};

export function DashboardPanel({
  action,
  children,
  className = "",
  eyebrow,
  id,
  title,
}: DashboardPanelProps) {
  return (
    <section className={`dashboard-panel ${className}`.trim()} id={id} aria-labelledby={`${id}-title`}>
      <header className="dashboard-panel-header">
        <div>
          <span>{eyebrow}</span>
          <h2 id={`${id}-title`}>{title}</h2>
        </div>
        {action}
      </header>
      <div className="dashboard-panel-content">{children}</div>
    </section>
  );
}
