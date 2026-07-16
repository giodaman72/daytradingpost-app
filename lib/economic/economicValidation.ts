import { ECONOMIC_EVENT_STATUSES } from "@/types/economic-event";
import { ECONOMIC_IMPACTS } from "@/types/economic-impact";
import type { EconomicFilters } from "@/types/economic-calendar";
import type { EconomicCountryCode } from "@/types/economic-country";
import type { EconomicCurrency } from "@/types/economic-currency";
import type { EconomicEventStatus } from "@/types/economic-event";
import type { EconomicImpact } from "@/types/economic-impact";
import type { EconomicEvent } from "@/types/economic-event";

export type RawEconomicEvent = Partial<Record<keyof EconomicEvent, unknown>>;

export const ECONOMIC_COUNTRIES: EconomicCountryCode[] = [
  "AU",
  "CA",
  "CN",
  "EU",
  "GB",
  "JP",
  "NZ",
  "US",
];
export const ECONOMIC_CURRENCIES: EconomicCurrency[] = [
  "AUD",
  "CAD",
  "CNY",
  "EUR",
  "GBP",
  "JPY",
  "NZD",
  "USD",
];
export const MAX_ECONOMIC_PAGE_SIZE = 100;

function list<T extends string>(value: string | null, allowed: readonly T[]) {
  if (!value) return [];
  return [...new Set(value.split(",").map((item) => item.trim().toUpperCase()))]
    .map((item) =>
      allowed.find((allowedItem) => allowedItem.toUpperCase() === item),
    )
    .filter((item): item is T => Boolean(item));
}

function validateList<T extends string>(
  searchParams: URLSearchParams,
  key: string,
  allowed: readonly T[],
  errors: string[],
) {
  const raw = searchParams.get(key);
  const parsed = list(raw, allowed);
  if (raw) {
    const requested = [
      ...new Set(
        raw
          .split(",")
          .map((item) => item.trim().toUpperCase())
          .filter(Boolean),
      ),
    ];
    const supported = new Set(allowed.map((item) => item.toUpperCase()));
    const unsupported = requested.filter((item) => !supported.has(item));
    if (unsupported.length)
      errors.push(
        `${key} contains unsupported values: ${unsupported.join(", ")}.`,
      );
  }
  return parsed;
}

function validDate(value: string | null) {
  return value &&
    /^\d{4}-\d{2}-\d{2}(?:T.*Z)?$/.test(value) &&
    Number.isFinite(Date.parse(value))
    ? value
    : undefined;
}

export function parseEconomicFilters(searchParams: URLSearchParams) {
  const errors: string[] = [];
  const requestedLimit = Number(searchParams.get("limit") ?? 50);
  const requestedOffset = Number(searchParams.get("offset") ?? 0);
  const fromRaw = searchParams.get("from");
  const toRaw = searchParams.get("to");
  const from = validDate(fromRaw);
  const to = validDate(toRaw);
  if (fromRaw && !from)
    errors.push("from must be an ISO date or UTC timestamp.");
  if (toRaw && !to) errors.push("to must be an ISO date or UTC timestamp.");
  if (
    !Number.isInteger(requestedLimit) ||
    requestedLimit < 1 ||
    requestedLimit > MAX_ECONOMIC_PAGE_SIZE
  )
    errors.push(`limit must be between 1 and ${MAX_ECONOMIC_PAGE_SIZE}.`);
  if (!Number.isInteger(requestedOffset) || requestedOffset < 0)
    errors.push("offset must be a non-negative integer.");

  const countries = validateList(
    searchParams,
    "country",
    ECONOMIC_COUNTRIES,
    errors,
  );
  const currencies = validateList(
    searchParams,
    "currency",
    ECONOMIC_CURRENCIES,
    errors,
  );
  const impacts = validateList(
    searchParams,
    "impact",
    ECONOMIC_IMPACTS,
    errors,
  );
  const statuses = validateList(
    searchParams,
    "status",
    ECONOMIC_EVENT_STATUSES,
    errors,
  );

  const filters: EconomicFilters = {
    from,
    to,
    search: searchParams.get("search")?.trim().slice(0, 100) || undefined,
    countries,
    currencies,
    impacts: impacts as EconomicImpact[],
    eventTypes: searchParams
      .get("eventType")
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 10),
    statuses: statuses as EconomicEventStatus[],
    limit: Number.isInteger(requestedLimit)
      ? Math.min(MAX_ECONOMIC_PAGE_SIZE, Math.max(1, requestedLimit))
      : 50,
    offset: Number.isInteger(requestedOffset)
      ? Math.max(0, requestedOffset)
      : 0,
  };
  return { valid: errors.length === 0, filters, errors };
}

export function isValidTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function normalizeEconomicEvent(
  input: RawEconomicEvent,
  source: string,
  isFixture = false,
): EconomicEvent | null {
  const scheduledTime =
    typeof input.scheduledTime === "string" &&
    Number.isFinite(Date.parse(input.scheduledTime))
      ? new Date(input.scheduledTime).toISOString()
      : null;
  const country = ECONOMIC_COUNTRIES.find((item) => item === input.country);
  const currency = ECONOMIC_CURRENCIES.find((item) => item === input.currency);
  const impact = ECONOMIC_IMPACTS.find((item) => item === input.impact);
  const status =
    ECONOMIC_EVENT_STATUSES.find((item) => item === input.status) ??
    "scheduled";
  if (
    !scheduledTime ||
    !country ||
    !currency ||
    !impact ||
    typeof input.title !== "string" ||
    !input.title.trim()
  )
    return null;
  const text = (value: unknown) =>
    typeof value === "string" && value.trim() ? value.trim() : null;
  const strings = (value: unknown) =>
    Array.isArray(value)
      ? value
          .filter((item): item is string => typeof item === "string")
          .slice(0, 20)
      : [];
  const id = text(input.id) ?? text(input.providerEventId);
  if (!id) return null;
  return {
    id,
    providerEventId: text(input.providerEventId) ?? id,
    title: input.title.trim(),
    description: text(input.description),
    country,
    countryName: text(input.countryName) ?? country,
    currency,
    impact,
    scheduledTime,
    forecast: text(input.forecast),
    previous: text(input.previous),
    actual: text(input.actual),
    revised: text(input.revised),
    eventType: text(input.eventType) ?? "other",
    category: text(input.category) ?? "Economic release",
    source,
    status,
    isFixture,
    historicalValues: Array.isArray(input.historicalValues)
      ? (input.historicalValues as EconomicEvent["historicalValues"])
      : [],
    relatedMarkets: strings(input.relatedMarkets),
    educationalExplanation: text(input.educationalExplanation),
    tradingConsiderations: strings(input.tradingConsiderations),
    createdAt: text(input.createdAt) ?? scheduledTime,
    updatedAt: text(input.updatedAt) ?? scheduledTime,
  };
}
