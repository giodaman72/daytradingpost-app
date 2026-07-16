import type { EconomicImpact } from "@/types/economic-impact";

const labels: Record<EconomicImpact, string> = {
  high: "High impact",
  medium: "Medium impact",
  low: "Low impact",
  holiday: "Market holiday",
};

export function ImpactBadge({ impact }: { impact: EconomicImpact }) {
  return (
    <span className={`economic-impact economic-impact-${impact}`}>
      {labels[impact]}
    </span>
  );
}
