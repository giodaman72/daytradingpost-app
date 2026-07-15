import { describe, expect, it } from "vitest";
import { WATCHLIST_LIMITS } from "@/constants/smart-alerts";
import { assertOwnership, ownsRecord } from "./watchlistAuthorization";
import {
  hasDuplicateInstrument,
  selectDefaultWatchlist,
  validateInstrumentSlug,
  validateWatchlistInput,
} from "./watchlistValidation";
describe("watchlists", () => {
  it("normalizes names and supported instruments", () => {
    expect(
      validateWatchlistInput({ name: "  Swing   Focus " }).value.name,
    ).toBe("Swing Focus");
    expect(validateInstrumentSlug("XAUUSD")).toBe("gold");
    expect(validateInstrumentSlug("made-up")).toBeNull();
  });
  it("enforces ownership", () => {
    expect(ownsRecord("one", { userId: "one" })).toBe(true);
    expect(() => assertOwnership("one", { userId: "two" })).toThrow(
      "Record not found",
    );
  });
  it("detects duplicate instruments", () => {
    expect(hasDuplicateInstrument([{ instrumentSlug: "gold" }], "gold")).toBe(
      true,
    );
  });
  it("chooses an explicit or ordered default", () => {
    expect(
      selectDefaultWatchlist([
        { isDefault: false, displayOrder: 2 },
        { isDefault: false, displayOrder: 1 },
      ])?.displayOrder,
    ).toBe(1);
    expect(selectDefaultWatchlist([])).toBeNull();
  });
  it("defines higher premium limits", () => {
    expect(WATCHLIST_LIMITS.premium.watchlists).toBeGreaterThan(
      WATCHLIST_LIMITS.free.watchlists,
    );
    expect(WATCHLIST_LIMITS.free.activeAlerts).toBe(3);
  });
});
