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

  it("publishes two support and two resistance levels for every report", () => {
    for (const locale of ["en", "es"] as const) {
      for (const article of getAugustArticles(locale)) {
        expect(article.supportLevels, article.slug).toHaveLength(2);
        expect(article.resistanceLevels, article.slug).toHaveLength(2);
      }
    }
  });

  it("maps entry and stop according to the report direction", () => {
    const bullish = getAugustArticle("wti-trade-setup-2026-08-31", "es");
    const bearish = getAugustArticle("nas100-trade-setup-2026-08-19", "es");

    expect(bullish?.supportLevels).toEqual(["$85.000", "$84.765"]);
    expect(bullish?.resistanceLevels).toEqual(["$86.000", "$86.600"]);
    expect(bearish?.supportLevels).toEqual(["29,399", "29,200"]);
    expect(bearish?.resistanceLevels).toEqual(["29,600", "29,700"]);
  });
});
