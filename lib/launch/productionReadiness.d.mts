export type ProductionEnvironment = Record<string, string | undefined>;

export type ProductionReadinessResult = {
  errors: string[];
  ready: boolean;
  warnings: string[];
};

export function evaluateProductionReadiness(
  env: ProductionEnvironment,
): ProductionReadinessResult;
