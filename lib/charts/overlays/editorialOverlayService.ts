import type {
  MarketIntelligenceRecord,
  MarketLevel,
} from "@/types/market-intelligence";
import type { ChartAnnotation } from "@/types/chart";

const numeric = (level: MarketLevel) => {
  const value = Number(level.value.replaceAll(",", ""));
  return Number.isFinite(value) ? value : null;
};
export function normalizeEditorialAnnotations(
  intelligence: MarketIntelligenceRecord,
  premium: boolean,
) {
  const map = (
    levels: MarketLevel[],
    kind: "support" | "resistance",
  ): ChartAnnotation[] =>
    levels.flatMap((level, index) => {
      const value = numeric(level);
      return value === null
        ? []
        : [
            {
              id: `${intelligence.id}:${kind}:${index}`,
              kind,
              label: `${kind === "support" ? "Support" : "Resistance"}: ${level.label ?? value}`,
              value,
              timestamp: intelligence.publishedAt ?? intelligence.updatedAt,
              sourceId: intelligence.id,
              sourceType: "market_intelligence",
              premium,
            },
          ];
    });
  return premium
    ? [
        ...map(intelligence.supportLevels, "support"),
        ...map(intelligence.resistanceLevels, "resistance"),
      ]
    : [];
}
