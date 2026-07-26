import { describe, expect, it } from "vitest";
import type { WatchlistWithItems } from "@/types/watchlist";
import { AssistantError } from "../assistantErrors";
import { selectOwnedWatchlist } from "./watchlistRetriever";

const watchlist = (id: string, isDefault = false): WatchlistWithItems => ({
  id,
  userId: "user-1",
  name: `Watchlist ${id}`,
  description: null,
  isDefault,
  displayOrder: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  items: [],
});

describe("assistant watchlist ownership selection", () => {
  it("selects only an explicitly owned watchlist", () => {
    const owned = [watchlist("owned")];
    expect(selectOwnedWatchlist(owned, "owned")?.id).toBe("owned");
    expect(() => selectOwnedWatchlist(owned, "another-user-list")).toThrow(
      AssistantError,
    );
  });

  it("uses the owner's default list when no id is supplied", () => {
    const owned = [watchlist("first"), watchlist("default", true)];
    expect(selectOwnedWatchlist(owned, null)?.id).toBe("default");
    expect(selectOwnedWatchlist([], null)).toBeNull();
  });
});
