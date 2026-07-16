export const ECONOMIC_IMPACTS = ["high", "medium", "low", "holiday"] as const;

export type EconomicImpact = (typeof ECONOMIC_IMPACTS)[number];
