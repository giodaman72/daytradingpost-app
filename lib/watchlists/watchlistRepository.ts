import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  Watchlist,
  WatchlistItem,
  WatchlistWithItems,
} from "@/types/watchlist";

const mapList = (row: Record<string, unknown>): Watchlist => ({
  id: String(row.id),
  userId: String(row.user_id),
  name: String(row.name),
  description: row.description as string | null,
  isDefault: Boolean(row.is_default),
  displayOrder: Number(row.display_order),
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at),
});
const mapItem = (row: Record<string, unknown>): WatchlistItem => ({
  id: String(row.id),
  watchlistId: String(row.watchlist_id),
  userId: String(row.user_id),
  instrumentSlug: String(row.instrument_slug),
  displayOrder: Number(row.display_order),
  notes: row.notes as string | null,
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at),
});

export async function listWatchlists(
  userId: string,
): Promise<WatchlistWithItems[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("watchlists")
    .select("*,watchlist_items(*)")
    .eq("user_id", userId)
    .order("display_order")
    .order("created_at");
  if (error) throw new Error("Watchlists are unavailable.");
  return (data ?? []).map((row) => ({
    ...mapList(row),
    items: ((row.watchlist_items as Record<string, unknown>[]) ?? [])
      .map(mapItem)
      .sort((a, b) => a.displayOrder - b.displayOrder),
  }));
}
export async function findWatchlist(userId: string, id: string) {
  return (await listWatchlists(userId)).find((item) => item.id === id) ?? null;
}
export async function insertWatchlist(
  userId: string,
  name: string,
  description: string | null,
  isDefault: boolean,
) {
  const { data, error } = await getSupabaseAdmin()
    .from("watchlists")
    .insert({ user_id: userId, name, description, is_default: isDefault })
    .select()
    .single();
  if (error)
    throw new Error(
      error.code === "23505"
        ? "A default watchlist already exists."
        : "Could not create watchlist.",
    );
  return mapList(data);
}
export async function patchWatchlist(
  userId: string,
  id: string,
  patch: Record<string, unknown>,
) {
  const { data, error } = await getSupabaseAdmin()
    .from("watchlists")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .maybeSingle();
  if (error || !data) throw new Error("Watchlist not found.");
  return mapList(data);
}
export async function removeWatchlist(userId: string, id: string) {
  const { error } = await getSupabaseAdmin()
    .from("watchlists")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error("Could not delete watchlist.");
}
export async function setDefaultAtomically(userId: string, id: string) {
  const { error } = await getSupabaseAdmin().rpc("set_default_watchlist", {
    p_user_id: userId,
    p_watchlist_id: id,
  });
  if (error) throw new Error("Could not update default watchlist.");
}
export async function insertItem(
  userId: string,
  watchlistId: string,
  instrumentSlug: string,
  order: number,
) {
  const { data, error } = await getSupabaseAdmin()
    .from("watchlist_items")
    .insert({
      user_id: userId,
      watchlist_id: watchlistId,
      instrument_slug: instrumentSlug,
      display_order: order,
    })
    .select()
    .single();
  if (error)
    throw new Error(
      error.code === "23505"
        ? "That instrument is already in this watchlist."
        : "Could not add instrument.",
    );
  return mapItem(data);
}
export async function removeItem(
  userId: string,
  watchlistId: string,
  instrumentSlug: string,
) {
  const { error } = await getSupabaseAdmin()
    .from("watchlist_items")
    .delete()
    .eq("user_id", userId)
    .eq("watchlist_id", watchlistId)
    .eq("instrument_slug", instrumentSlug);
  if (error) throw new Error("Could not remove instrument.");
}
export async function patchItem(
  userId: string,
  watchlistId: string,
  instrumentSlug: string,
  patch: Record<string, unknown>,
) {
  const { error } = await getSupabaseAdmin()
    .from("watchlist_items")
    .update(patch)
    .eq("user_id", userId)
    .eq("watchlist_id", watchlistId)
    .eq("instrument_slug", instrumentSlug);
  if (error) throw new Error("Could not update instrument.");
}
