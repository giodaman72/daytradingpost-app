import type { AcademyMetric } from "@/types/academy-admin";

export function AcademyMetricGrid({
  metrics,
  privacyThreshold,
}: {
  metrics: AcademyMetric[];
  privacyThreshold: number;
}) {
  if (!metrics.length)
    return (
      <div className="academy-admin-empty">
        <h2>No aggregate activity</h2>
        <p>No verified activity matches the selected filters.</p>
      </div>
    );
  return (
    <dl className="academy-metric-grid">
      {metrics.map((metric) => (
        <div key={metric.key}>
          <dt>{metric.label}</dt>
          <dd>
            {metric.suppressed
              ? "Suppressed"
              : (metric.value?.toLocaleString() ?? "—")}
          </dd>
          {metric.suppressed ? (
            <span>
              Hidden for a cohort smaller than {privacyThreshold} learners.
            </span>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
