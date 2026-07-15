import { getInstrument, INSTRUMENTS } from "@/constants/instruments";

export const MAX_BATCH_INSTRUMENTS = 10;

export function validateInstrument(value: string) {
  return getInstrument(value);
}

export function parseInstrumentList(value: string | null) {
  if (!value)
    return {
      valid: true,
      instruments: INSTRUMENTS.filter((item) => item.enabled).slice(0, 6),
      errors: [] as string[],
    };
  const requested = [
    ...new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
  const errors: string[] = [];
  if (requested.length > MAX_BATCH_INSTRUMENTS)
    errors.push(
      `A maximum of ${MAX_BATCH_INSTRUMENTS} instruments is allowed.`,
    );
  const resolved = requested.slice(0, MAX_BATCH_INSTRUMENTS).map(getInstrument);
  if (resolved.some((item) => !item))
    errors.push("One or more instruments are unsupported.");
  const instruments = resolved
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .filter(
      (item, index, items) =>
        items.findIndex((candidate) => candidate.slug === item.slug) === index,
    );
  return { valid: errors.length === 0, instruments, errors };
}

export function getMarketDataConfig() {
  const provider = process.env.MARKET_DATA_PROVIDER?.trim().toLowerCase() || "";
  const timeoutValue = Number(process.env.MARKET_DATA_TIMEOUT_MS || 5000);
  const cacheValue = Number(process.env.MARKET_DATA_CACHE_SECONDS || 60);
  return {
    provider,
    apiKey: process.env.MARKET_DATA_API_KEY?.trim() || "",
    apiBaseUrl: process.env.MARKET_DATA_API_BASE_URL?.trim() || "",
    timeoutMs:
      Number.isInteger(timeoutValue) &&
      timeoutValue >= 500 &&
      timeoutValue <= 15000
        ? timeoutValue
        : 5000,
    cacheSeconds:
      Number.isInteger(cacheValue) && cacheValue >= 15 && cacheValue <= 300
        ? cacheValue
        : 60,
  };
}
