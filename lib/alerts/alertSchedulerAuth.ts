import { timingSafeEqual } from "node:crypto";
export function isAlertSchedulerAuthorized(
  authorization: string | null,
  secret: string | undefined,
) {
  const expected = secret?.trim();
  const supplied = authorization?.replace(/^Bearer\s+/i, "") ?? "";
  if (!expected || expected.length !== supplied.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
}
export function normalizeAlertBatchSize(value: unknown, maximum = 100) {
  const parsed = Number(value);
  return Math.min(maximum, Math.max(1, Number.isInteger(parsed) ? parsed : 25));
}
