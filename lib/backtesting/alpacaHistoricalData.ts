import "server-only";

import {
  normalizeAlpacaBars,
  type AlpacaResearchSymbol,
} from "./alpacaHistoricalMapper";
import type { PriceBar } from "./types";

type AlpacaBarsPayload = {
  bars?: unknown;
  message?: unknown;
};

export type AlpacaHistoricalResult = {
  bars: PriceBar[];
  meta: {
    symbol: AlpacaResearchSymbol;
    provider: "Alpaca";
    feed: "iex" | "sip";
    adjustment: "all";
    timeframe: "1Day";
    start: string;
    end: string;
    fetchedAt: string;
  };
};

export class AlpacaHistoricalDataError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function getConfig() {
  const apiKey = process.env.ALPACA_API_KEY_ID?.trim();
  const secret = process.env.ALPACA_API_SECRET_KEY?.trim();
  if (!apiKey || !secret)
    throw new AlpacaHistoricalDataError(
      "NOT_CONFIGURED",
      "Alpaca historical data is not configured.",
      503,
    );

  const baseUrl =
    process.env.ALPACA_DATA_BASE_URL?.trim() || "https://data.alpaca.markets";
  let parsed: URL;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new AlpacaHistoricalDataError(
      "INVALID_CONFIGURATION",
      "Alpaca historical data is unavailable.",
      503,
    );
  }
  if (parsed.protocol !== "https:")
    throw new AlpacaHistoricalDataError(
      "INVALID_CONFIGURATION",
      "Alpaca historical data is unavailable.",
      503,
    );

  const configuredFeed =
    process.env.ALPACA_HISTORICAL_FEED?.trim().toLowerCase();
  const feed = configuredFeed === "sip" ? "sip" : "iex";
  return { apiKey, secret, baseUrl: parsed.origin, feed } as const;
}

export async function getAlpacaDailyBars(
  symbol: AlpacaResearchSymbol,
  start: string,
  end: string,
  signal?: AbortSignal,
): Promise<AlpacaHistoricalResult> {
  const config = getConfig();
  const url = new URL(`/v2/stocks/${symbol}/bars`, config.baseUrl);
  url.searchParams.set("timeframe", "1Day");
  url.searchParams.set("start", `${start}T00:00:00Z`);
  url.searchParams.set("end", `${end}T23:59:59Z`);
  url.searchParams.set("adjustment", "all");
  url.searchParams.set("feed", config.feed);
  url.searchParams.set("limit", "10000");

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "APCA-API-KEY-ID": config.apiKey,
        "APCA-API-SECRET-KEY": config.secret,
        "User-Agent": "DayTradingPost/0.1",
      },
      next: { revalidate: 3600 },
      signal,
    });
  } catch {
    throw new AlpacaHistoricalDataError(
      "PROVIDER_UNAVAILABLE",
      "Alpaca historical data could not be reached.",
      502,
    );
  }

  let payload: AlpacaBarsPayload = {};
  try {
    payload = (await response.json()) as AlpacaBarsPayload;
  } catch {
    throw new AlpacaHistoricalDataError(
      "INVALID_RESPONSE",
      "Alpaca returned an unreadable response.",
      502,
    );
  }
  if (!response.ok) {
    const providerMessage =
      typeof payload.message === "string" ? payload.message.toLowerCase() : "";
    const unauthorized = response.status === 401 || response.status === 403;
    const rateLimited = response.status === 429;
    throw new AlpacaHistoricalDataError(
      unauthorized
        ? "PROVIDER_AUTHORIZATION"
        : rateLimited
          ? "PROVIDER_RATE_LIMIT"
          : "PROVIDER_ERROR",
      unauthorized
        ? "Alpaca credentials or data permissions need attention."
        : rateLimited
          ? "Alpaca rate limit reached. Try again shortly."
          : providerMessage.includes("subscription")
            ? "The selected Alpaca feed is not available on this account."
            : "Alpaca historical data is temporarily unavailable.",
      unauthorized ? 503 : rateLimited ? 429 : 502,
    );
  }

  const bars = normalizeAlpacaBars(payload.bars);
  if (!bars.length)
    throw new AlpacaHistoricalDataError(
      "NO_DATA",
      "No valid Alpaca bars were available for that range.",
      404,
    );

  return {
    bars,
    meta: {
      symbol,
      provider: "Alpaca",
      feed: config.feed,
      adjustment: "all",
      timeframe: "1Day",
      start,
      end,
      fetchedAt: new Date().toISOString(),
    },
  };
}
