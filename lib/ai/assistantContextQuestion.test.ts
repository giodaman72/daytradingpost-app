import { describe, expect, it } from "vitest";
import { buildAssistantContextQuestion } from "./assistantContextQuestion";

describe("assistant contextual question", () => {
  it("creates a visible market-analysis question for a selected instrument", () => {
    expect(buildAssistantContextQuestion("market_analysis", "gold")).toBe(
      "Provide a source-grounded market analysis for Gold (XAUUSD). Cover the latest published outlook, key market drivers, risk factors, and plausible scenarios.",
    );
  });

  it("does not invent a question without a supported market context", () => {
    expect(buildAssistantContextQuestion("market_analysis", "")).toBe("");
    expect(buildAssistantContextQuestion("risk_management", "gold")).toBe("");
    expect(buildAssistantContextQuestion("market_analysis", "unknown")).toBe(
      "",
    );
  });
});
