import "server-only";
import { revalidateTag } from "next/cache";

export const MARKET_INTELLIGENCE_CACHE_TAG = "market-intelligence";
export function invalidateMarketIntelligence() {
  revalidateTag(MARKET_INTELLIGENCE_CACHE_TAG, { expire: 0 });
}
