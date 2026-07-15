export function LastUpdated({
  value,
  validForDate,
}: {
  value: string;
  validForDate?: string;
}) {
  const formatted = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/New_York",
  }).format(new Date(value));

  return (
    <p className="mi-updated">
      {validForDate ? `Valid for ${validForDate} · ` : ""}Updated {formatted} ET
    </p>
  );
}
