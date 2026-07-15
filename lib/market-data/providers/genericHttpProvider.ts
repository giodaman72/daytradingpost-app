import "server-only";

import {
  getProviderSymbol,
  type InstrumentDefinition,
} from "@/constants/instruments";
import { normalizeProviderQuote, unavailableQuote } from "../marketDataMapper";
import {
  ProviderRequestError,
  withLimitedRetry,
  withTimeout,
} from "../marketDataResilience";
import type { MarketDataProvider } from "./MarketDataProvider";
import type {
  MarketDataHealth,
  ProviderQuotePayload,
} from "@/types/market-data";

type GenericResponse = { data?: ProviderQuotePayload[] };

export function createGenericHttpProvider({
  apiKey,
  baseUrl,
  timeoutMs,
}: {
  apiKey: string;
  baseUrl: string;
  timeoutMs: number;
}): MarketDataProvider {
  async function request(instruments: InstrumentDefinition[]) {
    const mappings = instruments.map((instrument) => ({
      instrument,
      providerSymbol: getProviderSymbol(instrument, "generic_http"),
    }));
    if (mappings.some((item) => !item.providerSymbol))
      throw new ProviderRequestError(
        "A provider symbol mapping is missing.",
        false,
      );
    const url = new URL(
      "quotes",
      baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`,
    );
    url.searchParams.set(
      "symbols",
      mappings.map((item) => item.providerSymbol).join(","),
    );
    return withLimitedRetry(() =>
      withTimeout(async (signal) => {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
          },
          signal,
          cache: "no-store",
        });
        if (!response.ok)
          throw new ProviderRequestError(
            `Market-data provider returned HTTP ${response.status}.`,
            response.status === 429 || response.status >= 500,
            response.status,
          );
        const body = (await response.json()) as GenericResponse;
        if (!Array.isArray(body.data))
          throw new ProviderRequestError(
            "Market-data provider returned a malformed payload.",
            false,
          );
        const receivedAt = new Date().toISOString();
        return mappings.map(({ instrument, providerSymbol }) => {
          const payload = body.data?.find(
            (item) => item.symbol === providerSymbol,
          );
          return payload
            ? (normalizeProviderQuote({
                instrument,
                payload,
                provider: "generic_http",
                receivedAt,
              }) ??
                unavailableQuote(
                  instrument,
                  "generic_http",
                  "Provider returned malformed quote values.",
                ))
            : unavailableQuote(
                instrument,
                "generic_http",
                "Provider did not return this instrument.",
              );
        });
      }, timeoutMs),
    );
  }

  return {
    id: "generic_http",
    simulated: false,
    async getQuote(instrument) {
      return (await request([instrument]))[0];
    },
    getQuotes: request,
    async getDailySnapshot(instrument) {
      return (await request([instrument]))[0];
    },
    async healthCheck(): Promise<MarketDataHealth> {
      try {
        await withTimeout(async (signal) => {
          const response = await fetch(
            new URL("health", baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`),
            {
              headers: { Authorization: `Bearer ${apiKey}` },
              signal,
              cache: "no-store",
            },
          );
          if (!response.ok)
            throw new ProviderRequestError(
              `Health endpoint returned ${response.status}.`,
            );
        }, timeoutMs);
        return {
          configured: true,
          healthy: true,
          provider: "generic_http",
          checkedAt: new Date().toISOString(),
          message: "Provider health endpoint responded successfully.",
        };
      } catch {
        return {
          configured: true,
          healthy: false,
          provider: "generic_http",
          checkedAt: new Date().toISOString(),
          message: "Provider health check failed.",
        };
      }
    },
  };
}
