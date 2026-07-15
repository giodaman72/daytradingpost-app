export function MarketIntelligenceSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className="mi-grid"
      aria-label="Loading market outlooks"
      aria-busy="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <div className="mi-skeleton" key={index}>
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
