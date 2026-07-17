import "server-only";
import { getSmartFeatureLimits } from "@/constants/smart-alerts";
import { getMembershipAccess } from "@/lib/membership/access";
import { enforceMutationRateLimit } from "@/lib/mutationRateLimit";
import {
  findWatchlist,
  insertItem,
  insertWatchlist,
  listWatchlists,
  patchItem,
  patchWatchlist,
  removeItem,
  removeWatchlist,
  setDefaultAtomically,
} from "./watchlistRepository";
import {
  validateInstrumentSlug,
  validateWatchlistInput,
  validateWatchlistNotes,
} from "./watchlistValidation";

async function context() {
  const access = await getMembershipAccess();
  if (!access.user) throw new Error("Authentication required.");
  return {
    userId: access.user.id,
    limits: getSmartFeatureLimits(access.hasPremiumAccess),
    premium: access.hasPremiumAccess,
  };
}
export async function getUserWatchlists() {
  const { userId } = await context();
  return listWatchlists(userId);
}
export async function getDefaultWatchlist() {
  const lists = await getUserWatchlists();
  return lists.find((item) => item.isDefault) ?? lists[0] ?? null;
}
export async function getWatchlistById(id: string) {
  const { userId } = await context();
  return findWatchlist(userId, id);
}
export async function createWatchlist(input: {
  name?: unknown;
  description?: unknown;
}) {
  const { userId, limits } = await context();
  enforceMutationRateLimit(userId, "watchlists");
  const current = await listWatchlists(userId);
  if (current.length >= limits.watchlists)
    throw new Error("Your membership watchlist limit has been reached.");
  const parsed = validateWatchlistInput(input);
  if (!parsed.valid) throw new Error(Object.values(parsed.errors)[0]);
  return insertWatchlist(
    userId,
    parsed.value.name,
    parsed.value.description,
    current.length === 0,
  );
}
export async function updateWatchlist(
  id: string,
  input: { name?: unknown; description?: unknown },
) {
  const { userId } = await context();
  const parsed = validateWatchlistInput(input);
  if (!parsed.valid) throw new Error(Object.values(parsed.errors)[0]);
  return patchWatchlist(userId, id, parsed.value);
}
export async function setDefaultWatchlist(id: string) {
  const { userId } = await context();
  if (!(await findWatchlist(userId, id)))
    throw new Error("Watchlist not found.");
  await setDefaultAtomically(userId, id);
  const updated = await findWatchlist(userId, id);
  if (!updated) throw new Error("Watchlist not found.");
  return updated;
}
export async function deleteWatchlist(id: string) {
  const { userId } = await context();
  const target = await findWatchlist(userId, id);
  if (!target) throw new Error("Watchlist not found.");
  await removeWatchlist(userId, id);
  if (target.isDefault) {
    const fallback =
      (await listWatchlists(userId))[0] ??
      (await insertWatchlist(userId, "My Watchlist", null, true));
    if (!fallback.isDefault) await setDefaultWatchlist(fallback.id);
  }
}
export async function addInstrumentToWatchlist(id: string, value: unknown) {
  const { userId, limits } = await context();
  enforceMutationRateLimit(userId, "watchlists");
  const list = await findWatchlist(userId, id);
  if (!list) throw new Error("Watchlist not found.");
  if (list.items.length >= limits.instrumentsPerWatchlist)
    throw new Error("Your membership instrument limit has been reached.");
  const slug = validateInstrumentSlug(value);
  if (!slug) throw new Error("Choose a supported instrument.");
  return insertItem(userId, id, slug, list.items.length);
}
export async function removeInstrumentFromWatchlist(
  id: string,
  value: unknown,
) {
  const { userId } = await context();
  const slug = validateInstrumentSlug(value);
  if (!slug || !(await findWatchlist(userId, id)))
    throw new Error("Watchlist item not found.");
  await removeItem(userId, id, slug);
}
export async function reorderWatchlistItems(id: string, slugs: string[]) {
  const { userId } = await context();
  const list = await findWatchlist(userId, id);
  if (
    !list ||
    slugs.length !== list.items.length ||
    new Set(slugs).size !== slugs.length ||
    slugs.some(
      (slug) => !list.items.some((item) => item.instrumentSlug === slug),
    )
  )
    throw new Error("Invalid watchlist order.");
  await Promise.all(
    slugs.map((slug, index) =>
      patchItem(userId, id, slug, { display_order: index }),
    ),
  );
}
export async function updateWatchlistItemNotes(
  id: string,
  value: unknown,
  notes: unknown,
) {
  const { userId } = await context();
  const slug = validateInstrumentSlug(value);
  if (!slug || !(await findWatchlist(userId, id)))
    throw new Error("Watchlist item not found.");
  await patchItem(userId, id, slug, { notes: validateWatchlistNotes(notes) });
}
export async function moveWatchlistItem(
  id: string,
  value: unknown,
  direction: "up" | "down",
) {
  const list = await getWatchlistById(id);
  const slug = validateInstrumentSlug(value);
  if (!list || !slug) throw new Error("Watchlist item not found.");
  const order = list.items.map((item) => item.instrumentSlug);
  const index = order.indexOf(slug);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= order.length) return;
  [order[index], order[target]] = [order[target], order[index]];
  await reorderWatchlistItems(id, order);
}
