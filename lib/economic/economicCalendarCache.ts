import type { EconomicEvent } from "@/types/economic-event";

type CacheEntry = { events: EconomicEvent[]; expiresAt: number };

export class EconomicCalendarCache {
  private entries = new Map<string, CacheEntry>();

  constructor(private readonly ttlMs = 5 * 60_000) {}

  get(key: string, now = Date.now()) {
    const entry = this.entries.get(key);
    if (!entry || entry.expiresAt <= now) return null;
    return entry.events;
  }

  set(key: string, events: EconomicEvent[], now = Date.now()) {
    this.entries.set(key, { events, expiresAt: now + this.ttlMs });
  }

  clear() {
    this.entries.clear();
  }
}
