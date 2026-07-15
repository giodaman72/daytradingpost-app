export class ProviderRequestError extends Error {
  constructor(
    message: string,
    public readonly retryable = true,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ProviderRequestError";
  }
}

export async function withTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await operation(controller.signal);
  } catch (error) {
    if (controller.signal.aborted)
      throw new ProviderRequestError("Market-data provider request timed out.");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function withLimitedRetry<T>(
  operation: () => Promise<T>,
  attempts = 2,
  backoffMs = 75,
) {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (error instanceof ProviderRequestError && !error.retryable)
        throw error;
      if (attempt < attempts - 1)
        await new Promise((resolve) =>
          setTimeout(resolve, backoffMs * (attempt + 1)),
        );
    }
  }
  throw lastError;
}

export class ProviderCircuitBreaker {
  private failures = 0;
  private openUntil = 0;
  constructor(
    private readonly threshold = 3,
    private readonly cooldownMs = 30_000,
  ) {}
  canRequest(now = Date.now()) {
    return now >= this.openUntil;
  }
  success() {
    this.failures = 0;
    this.openUntil = 0;
  }
  failure(now = Date.now()) {
    this.failures += 1;
    if (this.failures >= this.threshold) this.openUntil = now + this.cooldownMs;
  }
}
