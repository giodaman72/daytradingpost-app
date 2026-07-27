import { evaluateProductionReadiness } from "../lib/launch/productionReadiness.mjs";

const result = evaluateProductionReadiness(process.env);

// eslint-disable-next-line no-console
console.log("DayTradingPost production readiness");
for (const warning of result.warnings) console.warn(`WARN: ${warning}`);
if (!result.ready) {
  for (const error of result.errors) console.error(`ERROR: ${error}`);
  console.error(
    `Production configuration is incomplete (${result.errors.length} errors).`,
  );
  process.exitCode = 1;
} else {
  // eslint-disable-next-line no-console
  console.log("Production environment configuration is complete.");
}
