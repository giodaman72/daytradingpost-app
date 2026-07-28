import "server-only";
import { listWatchlists } from "@/lib/watchlists/watchlistRepository";
import type { RetrievalDocument } from "@/types/ai-context";
import type { WatchlistWithItems } from "@/types/watchlist";
import { AssistantError } from "../assistantErrors";

export function selectOwnedWatchlist(
  watchlists: WatchlistWithItems[],
  watchlistId: string | null,
) {
  if (watchlistId) {
    const selected = watchlists.find((item) => item.id === watchlistId);
    if (!selected)
      throw new AssistantError("NOT_FOUND", "Watchlist not found.", 404);
    return selected;
  }
  return watchlists.find((item) => item.isDefault) ?? watchlists[0] ?? null;
}

export async function retrieveWatchlistContext(
  userId: string,
  watchlistId: string | null,
): Promise<{
  documents: RetrievalDocument[];
  instrumentSlugs: string[];
}> {
  const watchlists = await listWatchlists(userId);
  const watchlist = selectOwnedWatchlist(watchlists, watchlistId);
  if (!watchlist) return { documents: [], instrumentSlugs: [] };
  const instrumentSlugs = [
    ...new Set(watchlist.items.map((item) => item.instrumentSlug)),
  ];
  return {
    documents: [
      {
        sourceType: "watchlist",
        sourceId: watchlist.id,
        title: watchlist.name,
        content: `Authorized instruments: ${instrumentSlugs.join(", ") || "none"}.`,
        url: `/watchlists/${watchlist.id}`,
        timestamp: watchlist.updatedAt,
        premium: true,
        delayed: false,
        fixture: false,
        relevance: 100,
      },
    ],
    instrumentSlugs,
  };
}
