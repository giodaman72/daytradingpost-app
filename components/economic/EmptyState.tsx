export function EmptyState({
  title,
  description,
  locale = "en",
}: {
  title?: string;
  description?: string;
  locale?: "en" | "es";
}) {
  const spanish = locale === "es";
  return (
    <div className="economic-empty" role="status">
      <span aria-hidden="true">◎</span>
      <h2>
        {title ??
          (spanish
            ? "No se encontraron eventos económicos"
            : "No economic events found")}
      </h2>
      <p>
        {description ??
          (spanish
            ? "Ningún evento verificado coincide con el periodo y los filtros seleccionados."
            : "No verified events match the selected period and filters.")}
      </p>
    </div>
  );
}
