export function MarketDataUnavailable({
  instrument,
  locale = "en",
}: {
  instrument?: string;
  locale?: "en" | "es";
}) {
  const spanish = locale === "es";
  return (
    <div className="md-unavailable" role="status">
      <strong>
        {spanish ? "Datos no disponibles" : "Data unavailable"}
        {instrument
          ? spanish
            ? ` para ${instrument}`
            : ` for ${instrument}`
          : ""}
      </strong>
      <span>
        {spanish
          ? "No hay una respuesta verificada del proveedor de datos. El análisis editorial sigue siendo independiente."
          : "No verified market-data provider response is available. Editorial analysis remains independent."}
      </span>
    </div>
  );
}
