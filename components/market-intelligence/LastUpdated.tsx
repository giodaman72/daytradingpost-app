export function LastUpdated({
  value,
  validForDate,
  locale = "en",
}: {
  value: string;
  validForDate?: string;
  locale?: "en" | "es";
}) {
  const formatted = new Intl.DateTimeFormat(
    locale === "es" ? "es-ES" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/New_York",
    },
  ).format(new Date(value));

  return (
    <p className="mi-updated">
      {validForDate
        ? locale === "es"
          ? `Válido para ${validForDate} · `
          : `Valid for ${validForDate} · `
        : ""}
      {locale === "es" ? "Actualizado" : "Updated"} {formatted} ET
    </p>
  );
}
