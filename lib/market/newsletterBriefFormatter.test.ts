import { describe, expect, it } from "vitest";
import { formatMarketBriefForNewsletter } from "./newsletterBriefFormatter";
import { marketIntelligenceFixture } from "@/test/fixtures/marketIntelligence";

describe("newsletter market brief formatter", () => {
  it("creates article URLs from the configured site URL", () => {
    const result = formatMarketBriefForNewsletter(
      [marketIntelligenceFixture()],
      "https://daytradingpost.example/",
    );
    expect(result.featuredOutlooks[0].articleUrl).toBe(
      "https://daytradingpost.example/analysis/gold-daily-outlook",
    );
  });
  it("omits non-featured records from the featured newsletter list", () => {
    expect(
      formatMarketBriefForNewsletter(
        [marketIntelligenceFixture({ isFeatured: false })],
        "https://example.com",
      ).featuredOutlooks,
    ).toEqual([]);
  });
});
