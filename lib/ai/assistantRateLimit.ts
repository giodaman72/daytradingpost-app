import "server-only";
import { AssistantError } from "./assistantErrors";
import { getAssistantConfig } from "./assistantConfig";

const minute = new Map<string, { count: number; resetAt: number }>();
const active = new Map<string, number>();

export function enforceAssistantRateLimit(userId: string) {
  const now = Date.now();
  const current = minute.get(userId);
  if (!current || current.resetAt <= now) {
    minute.set(userId, { count: 1, resetAt: now + 60_000 });
    return;
  }
  if (current.count >= 12)
    throw new AssistantError(
      "RATE_LIMITED",
      "Too many assistant requests. Please wait a minute.",
      429,
      true,
    );
  current.count += 1;
}

export function acquireAssistantConcurrency(userId: string) {
  const current = active.get(userId) ?? 0;
  if (current >= getAssistantConfig().maximumConcurrentRequests)
    throw new AssistantError(
      "CONFLICT",
      "Another assistant response is already in progress.",
      409,
      true,
    );
  active.set(userId, current + 1);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    const next = Math.max(0, (active.get(userId) ?? 1) - 1);
    if (next === 0) active.delete(userId);
    else active.set(userId, next);
  };
}
