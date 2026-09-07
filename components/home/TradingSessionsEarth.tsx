import Image from "next/image";
import earthImage from "@/public/images/home-earth-3d.webp";

export function TradingSessionsEarth({ locale }: { locale: "en" | "es" }) {
  const spanish = locale === "es";
  const london = spanish ? "Londres" : "London";
  const newYork = spanish ? "Nueva York · EE. UU." : "New York · USA";
  const tokyo = spanish ? "Tokio · Asia" : "Tokyo · Asia";
  const sydney = spanish ? "Sídney · Australia" : "Sydney · Australia";

  const sessions = [
    {
      city: sydney,
      hours: "08:00–17:00",
      localTime: spanish ? "Hora de Sídney" : "Sydney time",
    },
    {
      city: tokyo,
      hours: "09:00–18:00",
      localTime: spanish ? "Hora de Tokio" : "Tokyo time",
    },
    {
      city: london,
      hours: "08:00–17:00",
      localTime: spanish ? "Hora de Londres" : "London time",
    },
    {
      city: newYork,
      hours: "08:00–17:00",
      localTime: spanish ? "Hora de Nueva York" : "New York time",
    },
  ];

  return (
    <figure className="reference-globe session-earth">
      <div className="session-earth-visual">
        <div className="session-earth-rotor">
          <Image
            className="reference-globe-image"
            src={earthImage}
            alt={
              spanish
                ? "La Tierra con las sesiones de Sídney, Tokio, Londres y Nueva York"
                : "Earth with the Sydney, Tokyo, London, and New York trading sessions"
            }
            width={1254}
            height={1254}
            unoptimized
            loading="eager"
            fetchPriority="high"
          />
          <svg
            className="session-earth-route"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <path
              d="M31 30 Q47 9 69.5 23 Q86 31 82 50 Q85 70 66 78 Q42 92 31 30"
              fill="none"
              stroke="#fbbf3b"
              strokeWidth=".35"
              strokeDasharray="1 1"
            />
            <circle cx="31" cy="30" r="2.6" fill="#fbbf3b" fillOpacity=".2" />
            <circle cx="69.5" cy="23" r="2.6" fill="#7dd3fc" fillOpacity=".2" />
            <circle cx="82" cy="50" r="2.6" fill="#f472b6" fillOpacity=".2" />
            <circle cx="66" cy="78" r="2.6" fill="#34d399" fillOpacity=".2" />
            <circle
              cx="31"
              cy="30"
              r=".65"
              fill="#fbbf3b"
              stroke="#fff"
              strokeWidth=".2"
            />
            <circle
              cx="69.5"
              cy="23"
              r=".65"
              fill="#7dd3fc"
              stroke="#fff"
              strokeWidth=".2"
            />
            <circle
              cx="82"
              cy="50"
              r=".65"
              fill="#f472b6"
              stroke="#fff"
              strokeWidth=".2"
            />
            <circle
              cx="66"
              cy="78"
              r=".65"
              fill="#34d399"
              stroke="#fff"
              strokeWidth=".2"
            />
          </svg>
          <span className="session-earth-marker-anchor session-earth-new-york">
            <span className="session-earth-marker">{newYork}</span>
          </span>
          <span className="session-earth-marker-anchor session-earth-london">
            <span className="session-earth-marker">{london}</span>
          </span>
          <span className="session-earth-marker-anchor session-earth-tokyo">
            <span className="session-earth-marker">{tokyo}</span>
          </span>
          <span className="session-earth-marker-anchor session-earth-sydney">
            <span className="session-earth-marker">{sydney}</span>
          </span>
        </div>
      </div>
      <figcaption className="session-earth-card">
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
      </figcaption>
    </figure>
  );
}
