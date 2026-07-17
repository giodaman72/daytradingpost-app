import { describe, expect, it } from "vitest";
import { DevelopmentAIProvider } from "./developmentProvider";

const request = {
  messages: [{ role: "user" as const, content: "Explain support." }],
  systemInstructions: "Test",
  retrievedContext: "Published Academy context",
  outputFormat: "markdown" as const,
  maximumOutputTokens: 100,
  temperature: 0,
  requestId: "test-request",
};

describe("development provider", () => {
  it("is deterministic and explicitly labeled", async () => {
    const provider = new DevelopmentAIProvider();
    const first = await provider.generateResponse(request);
    const second = await provider.generateResponse(request);
    expect(first.text).toBe(second.text);
    expect(first.text).toContain("Development fixture");
    expect(first.provider).toBe("development");
  });
  it("normalizes representative error fixtures", async () => {
    const provider = new DevelopmentAIProvider();
    await expect(
      provider.generateResponse({
        ...request,
        messages: [{ role: "user", content: "[fixture:timeout]" }],
      }),
    ).rejects.toMatchObject({ code: "PROVIDER_TIMEOUT" });
  });
});
