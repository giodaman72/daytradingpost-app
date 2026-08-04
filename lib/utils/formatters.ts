type DateFormatOptions = {
  fallback?: string;
  locale?: string;
  timeZone?: string;
};

type DisplayLabelOptions = {
  fallback?: string;
  locale?: "en" | "es";
};

const SPANISH_DISPLAY_LABELS: Record<string, string> = {
  active: "Activa",
  annual: "Anual",
  basic: "Básico",
  canceled: "Cancelada",
  cancelled: "Cancelada",
  expired: "Caducada",
  failed: "Fallida",
  free: "Gratis",
  inactive: "Inactiva",
  monthly: "Mensual",
  paid: "Pagada",
  pending: "Pendiente",
  premium: "Premium",
  refunded: "Reembolsada",
  starter: "Inicial",
  suspended: "Suspendida",
  trial: "Prueba",
  unpaid: "No pagada",
  verified: "Verificada",
  yearly: "Anual",
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

export function formatLocalizedDisplayLabel(
  value: string | null | undefined,
  { fallback, locale = "en" }: DisplayLabelOptions = {},
) {
  const localizedFallback =
    fallback ?? (locale === "es" ? "No disponible" : "Not available");
  if (!value) return localizedFallback;

  if (locale === "es") {
    return (
      SPANISH_DISPLAY_LABELS[value.toLowerCase()] ?? formatDisplayLabel(value)
    );
  }

  return formatDisplayLabel(value, localizedFallback);
}

export function formatDate(
  value: string | null | undefined,
  options: DateFormatOptions = {},
) {
  const locale = options.locale ?? "en";
  const timeZone = options.timeZone ?? "UTC";
  const fallback =
    options.fallback ??
    (locale.startsWith("es") ? "No configurado" : "Not set");
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone,
  }).format(date);
}
