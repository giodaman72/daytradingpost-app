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
    expect(localizeHref("/auth/verify?type=email", "es")).toBe(
      "/es/auth/verify?type=email",
    );
  });

  it("prefixes Spanish member routes and keeps API routes unchanged", () => {
    expect(localizeHref("/account", "es")).toBe("/es/account");
    expect(localizeHref("/dashboard", "es")).toBe("/es/dashboard");
    expect(localizeHref("/assistant", "es")).toBe("/es/assistant");
    expect(localizeHref("/watchlists", "es")).toBe("/es/watchlists");
    expect(localizeHref("/alerts/new", "es")).toBe("/es/alerts/new");
    expect(localizeHref("/research/backtesting", "es")).toBe(
      "/es/research/backtesting",
    );
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
    expect(isSpanishPublicPath("/es/auth/verify")).toBe(true);
    expect(isSpanishPublicPath("/dashboard")).toBe(true);
    expect(isSpanishPublicPath("/es/account/billing")).toBe(true);
  });

  it("publishes English, Spanish, and default alternates", () => {
    expect(languageAlternates("/premium")).toEqual({
      "en-US": "/premium",
      es: "/es/premium",
      "x-default": "/premium",
    });
  });
});
