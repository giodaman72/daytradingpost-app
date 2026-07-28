import { afterEach, describe, expect, it, vi } from "vitest";
import { INSTRUMENTS } from "@/constants/instruments";
import { getMarketDataProvider } from "./index";

describe("market-data provider selection", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns intentional unavailable data when market data is disabled", async () => {
    vi.stubEnv("MARKET_DATA_PROVIDER", "disabled");
    const provider = getMarketDataProvider();

    expect(provider.id).toBe("disabled");
    await expect(provider.getQuote(INSTRUMENTS[0])).resolves.toMatchObject({
      freshness: "unavailable",
      price: null,
      provider: "disabled",
      simulated: false,
    });
    await expect(provider.healthCheck()).resolves.toMatchObject({
      configured: true,
      healthy: true,
      provider: "disabled",
    });
  });
});
