export function MarketDataSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="md-grid" aria-label="Loading market data" aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <div className="md-skeleton" key={index}>
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
