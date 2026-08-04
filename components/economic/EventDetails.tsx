import type { EconomicEvent } from "@/types/economic-event";

export function EventDetails({
  event,
  locale = "en",
}: {
  event: EconomicEvent;
  locale?: "en" | "es";
}) {
  const spanish = locale === "es";
  return (
    <div className="economic-event-details">
      <section>
        <h2>{spanish ? "Descripción" : "Description"}</h2>
        <p>
          {event.description ??
            (spanish
              ? "No hay una descripción verificada disponible."
              : "No verified description is available.")}
        </p>
      </section>
      <dl>
        <div>
          <dt>{spanish ? "Previsión" : "Forecast"}</dt>
          <dd>
            {event.forecast ?? (spanish ? "No disponible" : "Not available")}
          </dd>
        </div>
        <div>
          <dt>{spanish ? "Anterior" : "Previous"}</dt>
          <dd>
            {event.previous ?? (spanish ? "No disponible" : "Not available")}
          </dd>
        </div>
        <div>
          <dt>{spanish ? "Dato real" : "Actual"}</dt>
          <dd>{event.actual ?? (spanish ? "Pendiente" : "Pending")}</dd>
        </div>
        <div>
          <dt>{spanish ? "Revisado" : "Revised"}</dt>
          <dd>{event.revised ?? "—"}</dd>
        </div>
      </dl>
      <section>
        <h2>{spanish ? "Explicación educativa" : "Educational explanation"}</h2>
        <p>
          {event.educationalExplanation ??
            event.description ??
            (spanish
              ? "No hay una explicación verificada disponible."
              : "No verified explanation is available.")}
        </p>
      </section>
      <section>
        <h2>
          {spanish ? "Consideraciones de trading" : "Trading considerations"}
        </h2>
        {event.tradingConsiderations.length ? (
          <ul>
            {event.tradingConsiderations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>
            {spanish
              ? "No hay notas de planificación disponibles."
              : "No planning notes are available."}
          </p>
        )}
      </section>
      <section>
        <h2>{spanish ? "Mercados relacionados" : "Related markets"}</h2>
        {event.relatedMarkets.length ? (
          <ul className="economic-related-markets">
            {event.relatedMarkets.map((market) => (
              <li key={market}>{market}</li>
            ))}
          </ul>
        ) : (
          <p>
            {spanish
              ? "No hay mercados relacionados asignados."
              : "No related markets are mapped."}
          </p>
        )}
      </section>
    </div>
  );
}
