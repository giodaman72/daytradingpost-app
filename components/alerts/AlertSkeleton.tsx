export function AlertSkeleton() {
  return (
    <div
      className="smart-skeleton"
      aria-label="Loading alerts"
      aria-busy="true"
    >
      <span />
      <span />
      <span />
    </div>
  );
}
