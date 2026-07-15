import type { MarketQuote } from "@/types/market-data";

type Entry = { quotes: MarketQuote[]; expiresAt: number; staleUntil: number };

export class MarketDataCache {
  private readonly entries = new Map<string, Entry>();
  constructor(
    private readonly ttlMs: number,
    private readonly staleMultiplier = 5,
  ) {}
  key(slugs: string[]) {
    return [...slugs].sort().join(",");
  }
  getFresh(slugs: string[], now = Date.now()) {
    const entry = this.entries.get(this.key(slugs));
    return entry && entry.expiresAt > now ? entry.quotes : null;
  }
  getStale(slugs: string[], now = Date.now()) {
    const entry = this.entries.get(this.key(slugs));
    return entry && entry.staleUntil > now
      ? entry.quotes.map((quote) => ({
          ...quote,
          freshness: quote.simulated
            ? ("simulated" as const)
            : ("stale" as const),
          disclosure: quote.simulated
            ? quote.disclosure
            : "Stale cached quote shown because the provider is unavailable.",
        }))
      : null;
  }
  set(slugs: string[], quotes: MarketQuote[], now = Date.now()) {
    this.entries.set(this.key(slugs), {
      quotes,
      expiresAt: now + this.ttlMs,
      staleUntil: now + this.ttlMs * this.staleMultiplier,
    });
  }
  clear() {
    this.entries.clear();
  }
}
