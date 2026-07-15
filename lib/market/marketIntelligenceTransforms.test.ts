import { describe, expect, it } from "vitest";
import {
  buildMarketBrief,
  calculateBiasDistribution,
  formatMarketIntelligenceResponse,
  summarizeMarketIntelligence,
} from "./marketIntelligenceTransforms";
import { marketIntelligenceFixture } from "@/test/fixtures/marketIntelligence";

describe("market intelligence transformations", () => {
  it("creates a public summary without detailed scenarios", () => {
    const summary = summarizeMarketIntelligence(marketIntelligenceFixture());
    expect(summary.instrumentSlug).toBe("gold");
    expect(summary).not.toHaveProperty("technicalOverview");
  });
  it("calculates bias distribution", () =>
    expect(
      calculateBiasDistribution([
        { bias: "bullish" },
        { bias: "bearish" },
        { bias: "mixed" },
      ]),
    ).toEqual({ bullish: 1, bearish: 1, neutralOrMixed: 1 }));
  it("excludes drafts from the market brief", () => {
    const brief = buildMarketBrief(
      [
        marketIntelligenceFixture(),
        marketIntelligenceFixture({ id: "draft", isPublished: false }),
      ],
      "2026-07-14",
    );
    expect(brief.outlooks).toHaveLength(1);
    expect(brief.riskDisclaimer).toContain("not live prices");
  });
  it("formats a stable API envelope", () => {
    const response = formatMarketIntelligenceResponse(
      [marketIntelligenceFixture()],
      "2026-07-14T12:00:00.000Z",
    );
    expect(response.meta).toEqual({
      count: 1,
      generatedAt: "2026-07-14T12:00:00.000Z",
      sampleData: false,
    });
  });
});
