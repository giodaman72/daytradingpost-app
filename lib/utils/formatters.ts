type DateFormatOptions = {
  fallback?: string;
  locale?: string;
  timeZone?: string;
};

export function formatDisplayLabel(
  value: string | null | undefined,
  fallback = "Not available",
) {
  if (!value) return fallback;

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatDate(
  value: string | null | undefined,
  {
    fallback = "Not set",
    locale = "en",
    timeZone = "UTC",
  }: DateFormatOptions = {},
) {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone,
  }).format(date);
}
