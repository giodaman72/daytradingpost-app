import { describe, expect, it } from "vitest";
import {
  parseAssistantFeedback,
  parseAssistantRequest,
} from "./assistantValidation";

describe("assistant request validation", () => {
  it("normalizes a valid request", () => {
    const value = parseAssistantRequest({
      message: "  Explain   Gold  ",
      contextMode: "market_analysis",
      instrumentSlug: "gold",
      requestId: "request-1",
    });
    expect(value.message).toBe("Explain Gold");
    expect(value.instrumentSlug).toBe("gold");
  });
  it.each<[Record<string, unknown>, number | undefined]>([
    [
      { message: "", contextMode: "market_analysis", requestId: "request-1" },
      undefined,
    ],
    [
      {
        message: "x".repeat(101),
        contextMode: "market_analysis",
        requestId: "request-1",
      },
      100,
    ],
    [
      { message: "Hi", contextMode: "unknown", requestId: "request-1" },
      undefined,
    ],
    [
      {
        message: "Hi",
        contextMode: "market_analysis",
        requestId: "request-1",
        instrumentSlug: "fake",
      },
      undefined,
    ],
  ])("rejects invalid input", (input, maximum) => {
    expect(() => parseAssistantRequest(input, maximum)).toThrow();
  });
  it("validates structured feedback", () => {
    expect(
      parseAssistantFeedback({
        conversationId: "c2a3579e-3e2a-4ff2-a482-c188b829d9bd",
        messageId: "38cb2cf4-a277-40ac-ada9-aa510cbfd06a",
        rating: "negative",
        reason: "missing_citation",
      }).reason,
    ).toBe("missing_citation");
  });
});
