export function MarketDataUnavailable({ instrument }: { instrument?: string }) {
  return (
    <div className="md-unavailable" role="status">
      <strong>Data unavailable{instrument ? ` for ${instrument}` : ""}</strong>
      <span>
        No verified market-data provider response is available. Editorial
        analysis remains independent.
      </span>
    </div>
  );
}
