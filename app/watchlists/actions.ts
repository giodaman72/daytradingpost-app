"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addInstrumentToWatchlist,
  createWatchlist,
  deleteWatchlist,
  removeInstrumentFromWatchlist,
  setDefaultWatchlist,
  updateWatchlist,
  updateWatchlistItemNotes,
  moveWatchlistItem,
} from "@/lib/watchlists";
function path(id?: string, message?: string, error = false) {
  const base = id ? `/watchlists/${id}` : "/watchlists";
  const query = message
    ? `?${error ? "error" : "notice"}=${encodeURIComponent(message)}`
    : "";
  return `${base}${query}`;
}
export async function createWatchlistAction(formData: FormData) {
  let destination = path(undefined, "Could not create watchlist.", true);
  try {
    const item = await createWatchlist({
      name: formData.get("name"),
      description: formData.get("description"),
    });
    revalidatePath("/watchlists");
    destination = path(item.id, "Watchlist created.");
  } catch (error) {
    destination = path(
      undefined,
      error instanceof Error ? error.message : "Could not create watchlist.",
      true,
    );
  }
  redirect(destination);
}
export async function updateWatchlistAction(formData: FormData) {
  const id = String(formData.get("id"));
  let destination = path(id, "Watchlist updated.");
  try {
    await updateWatchlist(id, {
      name: formData.get("name"),
      description: formData.get("description"),
    });
    revalidatePath(`/watchlists/${id}`);
  } catch (error) {
    destination = path(
      id,
      error instanceof Error ? error.message : "Could not update watchlist.",
      true,
    );
  }
  redirect(destination);
}
export async function deleteWatchlistAction(formData: FormData) {
  let destination = path(undefined, "Watchlist deleted.");
  try {
    await deleteWatchlist(String(formData.get("id")));
    revalidatePath("/watchlists");
  } catch (error) {
    destination = path(
      undefined,
      error instanceof Error ? error.message : "Could not delete watchlist.",
      true,
    );
  }
  redirect(destination);
}
export async function setDefaultWatchlistAction(formData: FormData) {
  const id = String(formData.get("id"));
  await setDefaultWatchlist(id);
  revalidatePath("/watchlists");
  redirect(path(id, "Default watchlist updated."));
}
export async function addInstrumentAction(formData: FormData) {
  const id = String(formData.get("id"));
  let destination = path(id, "Instrument added.");
  try {
    await addInstrumentToWatchlist(id, formData.get("instrument"));
    revalidatePath(`/watchlists/${id}`);
  } catch (error) {
    destination = path(
      id,
      error instanceof Error ? error.message : "Could not add instrument.",
      true,
    );
  }
  redirect(destination);
}
export async function removeInstrumentAction(formData: FormData) {
  const id = String(formData.get("id"));
  await removeInstrumentFromWatchlist(id, formData.get("instrument"));
  revalidatePath(`/watchlists/${id}`);
  redirect(path(id, "Instrument removed."));
}
export async function updateItemNotesAction(formData: FormData) {
  const id = String(formData.get("id"));
  await updateWatchlistItemNotes(
    id,
    formData.get("instrument"),
    formData.get("notes"),
  );
  revalidatePath(`/watchlists/${id}`);
  redirect(path(id, "Notes updated."));
}
export async function moveInstrumentAction(formData: FormData) {
  const id = String(formData.get("id"));
  const direction = formData.get("direction") === "up" ? "up" : "down";
  await moveWatchlistItem(id, formData.get("instrument"), direction);
  revalidatePath(`/watchlists/${id}`);
}
