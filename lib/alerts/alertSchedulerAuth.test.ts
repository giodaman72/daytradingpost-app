import { describe, expect, it } from "vitest";
import {
  isAlertSchedulerAuthorized,
  normalizeAlertBatchSize,
} from "./alertSchedulerAuth";
describe("alert scheduler security", () => {
  it("requires an exact bearer secret", () => {
    expect(
      isAlertSchedulerAuthorized("Bearer strong-secret", "strong-secret"),
    ).toBe(true);
    expect(isAlertSchedulerAuthorized("Bearer wrong", "strong-secret")).toBe(
      false,
    );
    expect(isAlertSchedulerAuthorized(null, undefined)).toBe(false);
  });
  it("bounds batch pagination", () => {
    expect(normalizeAlertBatchSize(500)).toBe(100);
    expect(normalizeAlertBatchSize("bad")).toBe(25);
    expect(normalizeAlertBatchSize(0)).toBe(1);
  });
});
