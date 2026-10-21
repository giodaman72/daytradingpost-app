import { afterEach, describe, expect, it, vi } from "vitest";

describe("Lemon Squeezy API errors", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("includes Lemon Squeezy's error detail in the message", async () => {
    vi.stubEnv("LEMONSQUEEZY_API_KEY", "test-key");
    vi.stubEnv("LEMONSQUEEZY_STORE_ID", "1");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          {
            errors: [{ title: "Not Found", detail: "Variant 999 not found." }],
          },
          { status: 404 },
        ),
      ),
    );
    const { createLemonSqueezyCheckout } = await import("./client");

    await expect(
      createLemonSqueezyCheckout({
        variantId: "999",
        email: "a@example.com",
        custom: {},
        redirectUrl: "https://daytradingpost.com/membership/success",
      }),
    ).rejects.toThrow(
      "status 404: checkouts request: Not Found - Variant 999 not found.",
    );
  });
});
