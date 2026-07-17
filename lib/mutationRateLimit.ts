import "server-only";
const attempts = new Map<string, { count: number; resetAt: number }>();
export function enforceMutationRateLimit(
  userId: string,
  namespace: string,
  maximum = 30,
  windowMs = 60_000,
) {
  const key = `${namespace}:${userId}`;
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (current.count >= maximum)
    throw new Error("Too many changes. Please wait a minute and try again.");
  current.count += 1;
}
