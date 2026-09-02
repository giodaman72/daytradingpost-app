import { describe, expect, it } from "vitest";
import { getAugustArticle, getAugustArticles } from "./augustArticles";

describe("August bilingual analysis library", () => {
  it("keeps 32 independent articles in each language", () => {
    const english = getAugustArticles("en");
    const spanish = getAugustArticles("es");

    expect(english).toHaveLength(32);
    expect(spanish).toHaveLength(32);
    expect(english.every((article) => article.language === "en")).toBe(true);
    expect(spanish.every((article) => article.language === "es")).toBe(true);
    expect(new Set(english.map((article) => article._id))).not.toEqual(
      new Set(spanish.map((article) => article._id)),
    );
  });

  it("returns the localized record for a shared route slug", () => {
    const slug = "wti-trade-setup-2026-08-31";

    expect(getAugustArticle(slug, "en")?.title).toContain(
      "Crude Oil 1H Trade Setup",
    );
    expect(getAugustArticle(slug, "es")?.title).toContain(
      "Configuración de trading del petróleo crudo",
    );
  });
});
