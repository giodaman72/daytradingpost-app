import type { MarketStatus } from "@/types/market-data";

const labels: Record<MarketStatus, string> = {
  open: "Market open",
  closed: "Market closed",
  premarket: "Premarket",
  afterhours: "After hours",
  unavailable: "Status unavailable",
  unknown: "Status unknown",
};

export function MarketStatusBadge({ status }: { status: MarketStatus }) {
  return (
    <span className={`md-status md-status-${status}`}>{labels[status]}</span>
  );
}
