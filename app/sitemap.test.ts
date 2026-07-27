import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/academy/academyRepository", () => ({
  listPublishedCourses: vi.fn(async () => [{ slug: "risk-foundations" }]),
  listPublishedLearningPaths: vi.fn(async () => [
    { slug: "trader-foundations" },
  ]),
}));
vi.mock("@/lib/sanity/client", () => ({
  getArticleSlugs: vi.fn(async () => [{ slug: "gold-outlook" }]),
}));

import sitemap from "./sitemap";

describe("public sitemap", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("includes public static and published content without private routes", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    const entries = await sitemap();
    const urls = entries.map(({ url }) => url);
    expect(urls).toContain("https://example.com/");
    expect(urls).toContain("https://example.com/analysis/gold-outlook");
    expect(urls).toContain(
      "https://example.com/academy/courses/risk-foundations",
    );
    expect(urls).toContain(
      "https://example.com/academy/learning-paths/trader-foundations",
    );
    expect(urls.some((url) => url.includes("/admin"))).toBe(false);
    expect(urls.some((url) => url.includes("/dashboard"))).toBe(false);
  });
});
