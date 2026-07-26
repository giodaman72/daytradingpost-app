import { ChartError } from "./chartErrors";
const requests = new Map<string, { count: number; resetAt: number }>();
export function enforceChartRateLimit(key: string, maximum = 60) {
  const now = Date.now();
  const current = requests.get(key);
  if (!current || current.resetAt <= now) {
    requests.set(key, { count: 1, resetAt: now + 60_000 });
    return;
  }
  if (current.count >= maximum)
    throw new ChartError("RATE_LIMITED", "Too many chart requests.", 429);
  current.count += 1;
}
