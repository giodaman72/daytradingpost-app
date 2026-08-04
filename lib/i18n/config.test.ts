import { describe, expect, it } from "vitest";
import {
  isSpanishPublicPath,
  languageAlternates,
  localizeHref,
  stripLocalePrefix,
  switchLocaleHref,
} from "./config";

describe("public locale routing", () => {
  it("prefixes Spanish public pages and preserves query strings", () => {
    expect(localizeHref("/analysis?market=gold", "es")).toBe(
      "/es/analysis?market=gold",
    );
    expect(localizeHref("/academy/courses/risk", "es")).toBe(
      "/es/academy/courses/risk",
    );
  });

  it("keeps member-only and API routes on their existing URLs", () => {
    expect(localizeHref("/dashboard", "es")).toBe("/dashboard");
    expect(localizeHref("/assistant", "es")).toBe("/assistant");
    expect(localizeHref("/api/charts/bars", "es")).toBe("/api/charts/bars");
  });

  it("switches and strips the visible Spanish prefix", () => {
    expect(stripLocalePrefix("/es/economic-calendar")).toBe(
      "/economic-calendar",
    );
    expect(switchLocaleHref("/analysis", "en")).toBe("/es/analysis");
    expect(switchLocaleHref("/es/analysis", "es")).toBe("/analysis");
  });

  it("identifies only the supported public Spanish route surface", () => {
    expect(isSpanishPublicPath("/es/charts/xauusd")).toBe(true);
    expect(isSpanishPublicPath("/academy/learning-paths")).toBe(true);
    expect(isSpanishPublicPath("/dashboard")).toBe(false);
  });

  it("publishes English, Spanish, and default alternates", () => {
    expect(languageAlternates("/premium")).toEqual({
      "en-US": "/premium",
      es: "/es/premium",
      "x-default": "/premium",
    });
  });
});
