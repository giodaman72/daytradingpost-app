import type { EconomicEvent } from "@/types/economic-event";

export function EventDetails({ event }: { event: EconomicEvent }) {
  return (
    <div className="economic-event-details">
      <section>
        <h2>Description</h2>
        <p>{event.description ?? "No verified description is available."}</p>
      </section>
      <dl>
        <div>
          <dt>Forecast</dt>
          <dd>{event.forecast ?? "Not available"}</dd>
        </div>
        <div>
          <dt>Previous</dt>
          <dd>{event.previous ?? "Not available"}</dd>
        </div>
        <div>
          <dt>Actual</dt>
          <dd>{event.actual ?? "Pending"}</dd>
        </div>
        <div>
          <dt>Revised</dt>
          <dd>{event.revised ?? "—"}</dd>
        </div>
      </dl>
      <section>
        <h2>Educational explanation</h2>
        <p>
          {event.educationalExplanation ??
            event.description ??
            "No verified explanation is available."}
        </p>
      </section>
      <section>
        <h2>Trading considerations</h2>
        {event.tradingConsiderations.length ? (
          <ul>
            {event.tradingConsiderations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>No planning notes are available.</p>
        )}
      </section>
      <section>
        <h2>Related markets</h2>
        {event.relatedMarkets.length ? (
          <ul className="economic-related-markets">
            {event.relatedMarkets.map((market) => (
              <li key={market}>{market}</li>
            ))}
          </ul>
        ) : (
          <p>No related markets are mapped.</p>
        )}
      </section>
    </div>
  );
}
