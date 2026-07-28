import { describe, expect, it } from "vitest";
import { stripMarkup } from "./plainText";

describe("stripMarkup", () => {
  it("removes complete, nested, and unterminated markup in one pass", () => {
    expect(stripMarkup("Market <strong>open</strong>")).toBe("Market open");
    expect(stripMarkup("<<script>alert(1)</script>Support")).toBe(
      "alert(1)Support",
    );
    expect(stripMarkup("Visible<script")).toBe("Visible");
  });
});
