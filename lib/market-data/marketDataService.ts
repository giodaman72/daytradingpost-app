import "server-only";

import {
  INSTRUMENTS,
  getInstrument,
  type InstrumentDefinition,
} from "@/constants/instruments";
import { DEFAULT_WATCHLIST } from "@/constants/markets";
import { MarketDataCache } from "./marketDataCache";
import { providerFailureFallback, unavailableQuote } from "./marketDataMapper";
import { getMarketDataProvider } from "./providers";
import { getMarketDataConfig } from "./marketDataValidation";
import { ProviderCircuitBreaker } from "./marketDataResilience";
import { storeMarketDataSnapshots } from "./marketDataRepository";

const config = getMarketDataConfig();
const quoteCache = new MarketDataCache(config.cacheSeconds * 1000);
const circuit = new ProviderCircuitBreaker();

export async function getMarketQuotes(instruments: InstrumentDefinition[]) {
  const enabled = instruments.filter((instrument) => instrument.enabled);
  const slugs = enabled.map((instrument) => instrument.slug);
  const fresh = quoteCache.getFresh(slugs);
  if (fresh) return fresh;
  if (!circuit.canRequest())
    return (
      quoteCache.getStale(slugs) ??
      enabled.map((instrument) =>
        unavailableQuote(
          instrument,
          "cooldown",
          "Provider requests are temporarily paused after repeated failures.",
        ),
      )
    );
  const provider = getMarketDataProvider();
  try {
    const quotes = await provider.getQuotes(enabled);
    const usable = quotes.some((quote) => quote.price !== null);
    if (!usable && provider.id !== "unconfigured")
      throw new Error("Provider returned no usable quotes.");
    circuit.success();
    quoteCache.set(slugs, quotes);
    void storeMarketDataSnapshots(quotes);
    return quotes;
  } catch (error) {
    circuit.failure();
    console.error(
      "Market-data provider request failed:",
      error instanceof Error ? error.message : "Unknown provider error",
    );
    return providerFailureFallback(
      enabled,
      quoteCache.getStale(slugs),
      provider.id,
    );
  }
}

export async function getMarketQuote(instrument: InstrumentDefinition) {
  return (await getMarketQuotes([instrument]))[0];
}
export async function getQuoteByInstrument(value: string) {
  const instrument = getInstrument(value);
  return instrument ? getMarketQuote(instrument) : null;
}
export async function getHomepageQuotes() {
  return getMarketQuotes(
    INSTRUMENTS.filter((item) => item.enabled).slice(0, 6),
  );
}
export async function getDashboardQuotes() {
  return getMarketQuotes(
    DEFAULT_WATCHLIST.map((item) => getInstrument(item.symbol)).filter(
      (item): item is InstrumentDefinition => Boolean(item),
    ),
  );
}
export async function getMarketDataHealth() {
  return getMarketDataProvider().healthCheck();
}
