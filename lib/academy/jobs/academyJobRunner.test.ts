import { describe, expect, it, vi } from "vitest";
import { runAcademyBatchJob } from "./academyJobRunner";

describe("Academy background-job foundation", () => {
  it("reports succeeded, skipped, and failed work without stopping the batch", async () => {
    const result = await runAcademyBatchJob({
      items: ["success", "skip", "failure", "success"],
      process: async (item) => {
        if (item === "failure") throw new Error("provider unavailable");
        return item === "skip" ? "skipped" : "succeeded";
      },
    });

    expect(result).toEqual({
      failed: 1,
      processed: 4,
      skipped: 1,
      succeeded: 2,
    });
  });

  it("uses a conservative bounded batch size", async () => {
    const process = vi.fn(async () => "succeeded" as const);
    const result = await runAcademyBatchJob({
      items: Array.from({ length: 150 }, (_, index) => index),
      maximumBatchSize: 500,
      process,
    });

    expect(process).toHaveBeenCalledTimes(100);
    expect(result.processed).toBe(100);
  });
});
