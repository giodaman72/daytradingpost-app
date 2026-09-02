import "server-only";

import {
  normalizeDatabentoJsonLines,
  toDatabentoContinuousSymbol,
  type DatabentoResearchSymbol,
} from "./databentoHistoricalMapper";
import type { PriceBar } from "./types";

const DATASET = "GLBX.MDP3";
const SCHEMA = "ohlcv-1d";
const RECORD_LIMIT = 4_000;

export type DatabentoHistoricalResult = {
  bars: PriceBar[];
  meta: {
    symbol: DatabentoResearchSymbol;
    continuousSymbol: string;
    provider: "Databento";
    dataset: typeof DATASET;
    timeframe: "1Day";
    start: string;
    end: string;
    estimatedCostUsd: number;
    fetchedAt: string;
  };
};

export class DatabentoHistoricalDataError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function getConfig() {
  const apiKey = process.env.DATABENTO_API_KEY?.trim();
  if (!apiKey)
    throw new DatabentoHistoricalDataError(
      "NOT_CONFIGURED",
      "Databento historical data is not configured yet.",
      503,
    );
  if (!/^db-[A-Za-z0-9_-]+$/.test(apiKey))
    throw new DatabentoHistoricalDataError(
      "INVALID_CONFIGURATION",
      "Databento historical data configuration needs attention.",
      503,
    );
  return {
    apiKey,
    baseUrl: "https://hist.databento.com/v0/",
    maxCostUsd: Math.max(
      0,
      Number(process.env.DATABENTO_MAX_REQUEST_COST_USD || "1"),
    ),
  };
}

function requestUrl(
  method: string,
  symbol: string,
  start: string,
  end: string,
) {
  const url = new URL(method, "https://hist.databento.com/v0/");
  url.searchParams.set("dataset", DATASET);
  url.searchParams.set("symbols", symbol);
  url.searchParams.set("schema", SCHEMA);
  url.searchParams.set("stype_in", "continuous");
  url.searchParams.set("start", `${start}T00:00:00Z`);
  url.searchParams.set("end", `${end}T23:59:59Z`);
  url.searchParams.set("limit", String(RECORD_LIMIT));
  return url;
}

async function authenticatedFetch(
  url: URL,
  apiKey: string,
  signal?: AbortSignal,
) {
  return fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
      "User-Agent": "DayTradingPost/0.1",
    },
    next: { revalidate: 3600 },
    signal,
  });
}

async function estimateCost(
  symbol: string,
  start: string,
  end: string,
  apiKey: string,
  signal?: AbortSignal,
) {
  let response: Response;
  try {
    response = await authenticatedFetch(
      requestUrl("metadata.get_cost", symbol, start, end),
      apiKey,
      signal,
    );
  } catch {
    throw new DatabentoHistoricalDataError(
      "PROVIDER_UNAVAILABLE",
      "Databento could not be reached to estimate the request cost.",
      502,
    );
  }
  if (!response.ok) throw providerError(response.status);
  const cost = Number(await response.text());
  if (!Number.isFinite(cost) || cost < 0)
    throw new DatabentoHistoricalDataError(
      "INVALID_RESPONSE",
      "Databento returned an unreadable cost estimate.",
      502,
    );
  return cost;
}

function providerError(status: number) {
  const unauthorized = status === 401 || status === 403;
  const rateLimited = status === 429;
  return new DatabentoHistoricalDataError(
    unauthorized
      ? "PROVIDER_AUTHORIZATION"
      : rateLimited
        ? "PROVIDER_RATE_LIMIT"
        : "PROVIDER_ERROR",
    unauthorized
      ? "Databento credentials or data permissions need attention."
      : rateLimited
        ? "Databento rate limit reached. Try again shortly."
        : "Databento historical data is temporarily unavailable.",
    unauthorized ? 503 : rateLimited ? 429 : 502,
  );
}

export async function getDatabentoDailyBars(
  symbol: DatabentoResearchSymbol,
  start: string,
  end: string,
  signal?: AbortSignal,
): Promise<DatabentoHistoricalResult> {
  const config = getConfig();
  const continuousSymbol = toDatabentoContinuousSymbol(symbol);
  const estimatedCostUsd = await estimateCost(
    continuousSymbol,
    start,
    end,
    config.apiKey,
    signal,
  );
  if (estimatedCostUsd > config.maxCostUsd)
    throw new DatabentoHistoricalDataError(
      "COST_LIMIT_EXCEEDED",
      `Estimated Databento cost ($${estimatedCostUsd.toFixed(4)}) exceeds the per-request safety limit.`,
      422,
    );

  const url = requestUrl("timeseries.get_range", continuousSymbol, start, end);
  url.searchParams.set("encoding", "json");
  url.searchParams.set("compression", "none");
  url.searchParams.set("pretty_px", "true");
  url.searchParams.set("pretty_ts", "true");
  let response: Response;
  try {
    response = await authenticatedFetch(url, config.apiKey, signal);
  } catch {
    throw new DatabentoHistoricalDataError(
      "PROVIDER_UNAVAILABLE",
      "Databento historical data could not be reached.",
      502,
    );
  }
  if (!response.ok) throw providerError(response.status);
  const bars = normalizeDatabentoJsonLines(await response.text());
  if (!bars.length)
    throw new DatabentoHistoricalDataError(
      "NO_DATA",
      "No valid Databento bars were available for that range.",
      404,
    );

  return {
    bars,
    meta: {
      symbol,
      continuousSymbol,
      provider: "Databento",
      dataset: DATASET,
      timeframe: "1Day",
      start,
      end,
      estimatedCostUsd,
      fetchedAt: new Date().toISOString(),
    },
  };
}
