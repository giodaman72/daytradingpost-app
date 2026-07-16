export function LoadingSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div
      className="economic-loading"
      aria-busy="true"
      aria-label="Loading economic events"
    >
      <span />
      {Array.from({ length: rows }, (_, index) => (
        <i key={index} />
      ))}
      <p className="sr-only" role="status">
        Loading economic intelligence…
      </p>
    </div>
  );
}
