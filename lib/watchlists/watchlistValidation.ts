import { getInstrument } from "@/constants/instruments";
import {
  WATCHLIST_DESCRIPTION_MAX_LENGTH,
  WATCHLIST_NAME_MAX_LENGTH,
  WATCHLIST_NOTES_MAX_LENGTH,
} from "@/constants/smart-alerts";

export function normalizeWatchlistName(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}
export function normalizeOptionalText(value: unknown, max: number) {
  const text = typeof value === "string" ? value.trim() : "";
  return text ? text.slice(0, max) : null;
}
export function validateWatchlistInput(input: {
  name?: unknown;
  description?: unknown;
}) {
  const name = normalizeWatchlistName(input.name);
  const description = normalizeOptionalText(
    input.description,
    WATCHLIST_DESCRIPTION_MAX_LENGTH,
  );
  const errors: Record<string, string> = {};
  if (!name || name.length > WATCHLIST_NAME_MAX_LENGTH)
    errors.name = `Use between 1 and ${WATCHLIST_NAME_MAX_LENGTH} characters.`;
  return {
    valid: Object.keys(errors).length === 0,
    value: { name, description },
    errors,
  };
}
export function validateInstrumentSlug(value: unknown) {
  return typeof value === "string"
    ? (getInstrument(value)?.slug ?? null)
    : null;
}
export function validateWatchlistNotes(value: unknown) {
  return normalizeOptionalText(value, WATCHLIST_NOTES_MAX_LENGTH);
}
export function hasDuplicateInstrument(
  items: Array<{ instrumentSlug: string }>,
  slug: string,
) {
  return items.some((item) => item.instrumentSlug === slug);
}
export function selectDefaultWatchlist<
  T extends { isDefault: boolean; displayOrder: number },
>(items: T[]) {
  return (
    items.find((item) => item.isDefault) ??
    [...items].sort((a, b) => a.displayOrder - b.displayOrder)[0] ??
    null
  );
}
