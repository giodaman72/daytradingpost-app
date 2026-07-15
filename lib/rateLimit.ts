import "server-only";

import { createHash } from "node:crypto";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;
const store = new Map<string, { count: number; resetAt: number }>();

export function checkPublicApiRateLimit(request: Request) {
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const identity =
    forwarded ||
    request.headers.get("x-real-ip") ||
    request.headers.get("user-agent") ||
    "unknown";
  const key = createHash("sha256").update(identity).digest("hex");
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }
  if (current.count >= MAX_REQUESTS) {
    return Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  }
  current.count += 1;
  return null;
}
