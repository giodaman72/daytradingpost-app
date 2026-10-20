import type { Locale } from "@/lib/i18n/config";

/** The four Forex sessions, the usual overlap and a source link. */
export function ForexSessionsContent({ locale }: { locale: Locale }) {
  const spanish = locale === "es";
  const sessions = [
    {
      city: spanish ? "Sídney · Australia" : "Sydney · Australia",
      hours: "08:00–17:00",
      localTime: spanish ? "Hora de Sídney" : "Sydney time",
    },
    {
      city: spanish ? "Tokio · Asia" : "Tokyo · Asia",
      hours: "09:00–18:00",
      localTime: spanish ? "Hora de Tokio" : "Tokyo time",
    },
    {
      city: spanish ? "Londres" : "London",
      hours: "08:00–17:00",
      localTime: spanish ? "Hora de Londres" : "London time",
    },
    {
      city: spanish ? "Nueva York · EE. UU." : "New York · USA",
      hours: "08:00–17:00",
      localTime: spanish ? "Hora de Nueva York" : "New York time",
    },
  ];

  return (
    <>
      <p className="session-earth-kicker">
        {spanish ? "SESIONES DE FOREX" : "FOREX SESSIONS"}
      </p>
      <div className="session-earth-hours">
        {sessions.map((session) => (
          <div key={session.city}>
            <strong>{session.city}</strong>
            <span>{session.hours}</span>
            <small>{session.localTime}</small>
          </div>
        ))}
      </div>
      <p className="session-earth-overlap">
        {spanish ? "SOLAPAMIENTO HABITUAL" : "TYPICAL OVERLAP"}
        <strong>
          08:00–12:00 <span>{spanish ? "Nueva York" : "New York"}</span>
        </strong>
      </p>
      <p className="session-earth-note">
        {spanish
          ? "Lunes–viernes. El cambio de horario de verano puede desplazar el solapamiento."
          : "Monday–Friday. Daylight-saving transitions can shift the overlap."}{" "}
        <a
          href="https://www.oanda.com/us-en/skills-and-insights/education/trading-asset-classes/forex/when-is-the-best-time-for-forex-trading/"
          target="_blank"
          rel="noreferrer"
        >
          {spanish ? "Guía de horarios ↗" : "Session guide ↗"}
        </a>
      </p>
    </>
  );
}

/** Stand-alone Forex sessions panel, shown under the latest-analysis card. */
export function ForexSessionsPanel({ locale }: { locale: Locale }) {
  return (
    <aside
      className="session-earth-card forex-sessions-panel"
      aria-label={locale === "es" ? "Sesiones de Forex" : "Forex sessions"}
    >
      <ForexSessionsContent locale={locale} />
    </aside>
  );
}
