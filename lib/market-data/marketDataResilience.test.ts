import { describe, expect, it, vi } from "vitest";
import {
  ProviderCircuitBreaker,
  ProviderRequestError,
  withLimitedRetry,
  withTimeout,
} from "./marketDataResilience";

describe("provider resilience", () => {
  it("aborts timed-out provider work", async () => {
    await expect(
      withTimeout(
        (signal) =>
          new Promise((_, reject) =>
            signal.addEventListener("abort", () =>
              reject(new Error("aborted")),
            ),
          ),
        5,
      ),
    ).rejects.toThrow("timed out");
  });

  it("retries transient errors but not invalid responses", async () => {
    const transient = vi
      .fn()
      .mockRejectedValueOnce(new ProviderRequestError("temporary"))
      .mockResolvedValue("ok");
    await expect(withLimitedRetry(transient, 2, 0)).resolves.toBe("ok");
    expect(transient).toHaveBeenCalledTimes(2);

    const invalid = vi
      .fn()
      .mockRejectedValue(new ProviderRequestError("bad", false));
    await expect(withLimitedRetry(invalid, 2, 0)).rejects.toThrow("bad");
    expect(invalid).toHaveBeenCalledOnce();
  });

  it("opens a circuit after repeated provider failures", () => {
    const circuit = new ProviderCircuitBreaker(2, 100);
    circuit.failure(1_000);
    expect(circuit.canRequest(1_001)).toBe(true);
    circuit.failure(1_001);
    expect(circuit.canRequest(1_050)).toBe(false);
    expect(circuit.canRequest(1_101)).toBe(true);
  });
});
