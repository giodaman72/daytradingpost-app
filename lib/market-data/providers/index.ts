import "server-only";

import { developmentMarketDataProvider } from "./developmentProvider";
import { createGenericHttpProvider } from "./genericHttpProvider";
import { getMarketDataConfig } from "../marketDataValidation";
import { unavailableQuote } from "../marketDataMapper";
import type { MarketDataProvider } from "./MarketDataProvider";

function unavailableProvider(message: string): MarketDataProvider {
  return {
    id: "unconfigured",
    simulated: false,
    async getQuote(instrument) {
      return unavailableQuote(instrument, "unconfigured", message);
    },
    async getQuotes(instruments) {
      return instruments.map((instrument) =>
        unavailableQuote(instrument, "unconfigured", message),
      );
    },
    async getDailySnapshot(instrument) {
      return unavailableQuote(instrument, "unconfigured", message);
    },
    async healthCheck() {
      return {
        configured: false,
        healthy: false,
        provider: "unconfigured",
        checkedAt: new Date().toISOString(),
        message,
      };
    },
  };
}

export function getMarketDataProvider() {
  const config = getMarketDataConfig();
  if (config.provider === "development") {
    if (process.env.NODE_ENV === "production")
      return unavailableProvider(
        "Development fixtures are disabled in production.",
      );
    return developmentMarketDataProvider;
  }
  if (config.provider === "generic_http") {
    if (!config.apiKey || !config.apiBaseUrl)
      return unavailableProvider(
        "The configured market-data provider is missing server credentials.",
      );
    return createGenericHttpProvider({
      apiKey: config.apiKey,
      baseUrl: config.apiBaseUrl,
      timeoutMs: config.timeoutMs,
    });
  }
  return unavailableProvider(
    "No production market-data provider is configured.",
  );
}

export type { MarketDataProvider } from "./MarketDataProvider";
