import "server-only";
import {
  findWatchlist,
  listWatchlists,
} from "@/lib/watchlists/watchlistRepository";
import type { RetrievalDocument } from "@/types/ai-context";

export async function retrieveWatchlist(
  userId: string,
  watchlistId: string | null,
): Promise<RetrievalDocument[]> {
  const watchlist = watchlistId
    ? await findWatchlist(userId, watchlistId)
    : ((await listWatchlists(userId)).find((item) => item.isDefault) ??
      (await listWatchlists(userId))[0] ??
      null);
  if (!watchlist) return [];
  return [
    {
      sourceType: "watchlist",
      sourceId: watchlist.id,
      title: watchlist.name,
      content: `Authorized instruments: ${watchlist.items.map((item) => item.instrumentSlug).join(", ") || "none"}.`,
      url: "/watchlists",
      timestamp: watchlist.updatedAt,
      premium: true,
      delayed: false,
      fixture: false,
      relevance: 100,
    },
  ];
}
