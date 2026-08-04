import type { EconomicImpact } from "@/types/economic-impact";

const labels: Record<EconomicImpact, string> = {
  high: "High impact",
  medium: "Medium impact",
  low: "Low impact",
  holiday: "Market holiday",
};

const spanishLabels: Record<EconomicImpact, string> = {
  high: "Impacto alto",
  medium: "Impacto medio",
  low: "Impacto bajo",
  holiday: "Festivo de mercado",
};

export function ImpactBadge({
  impact,
  locale = "en",
}: {
  impact: EconomicImpact;
  locale?: "en" | "es";
}) {
  return (
    <span className={`economic-impact economic-impact-${impact}`}>
      {(locale === "es" ? spanishLabels : labels)[impact]}
    </span>
  );
}
