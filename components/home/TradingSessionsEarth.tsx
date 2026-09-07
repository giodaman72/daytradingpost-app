import Image from "next/image";
import earthImage from "@/public/images/home-earth-3d.webp";

export function TradingSessionsEarth({ locale }: { locale: "en" | "es" }) {
  const spanish = locale === "es";
  const london = spanish ? "Londres" : "London";
  const newYork = spanish ? "Nueva York · EE. UU." : "New York · USA";
  return (
    <figure className="reference-globe session-earth">
      <div className="session-earth-visual">
        <Image
          className="reference-globe-image"
          src={earthImage}
          alt={
            spanish
              ? "La Tierra con Londres y Nueva York conectados sobre el Atlántico"
              : "Earth with London and New York connected across the Atlantic"
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
            d="M31 30 Q47 9 69.5 23"
            fill="none"
            stroke="#fbbf3b"
            strokeWidth=".35"
            strokeDasharray="1 1"
          />
          <circle cx="31" cy="30" r="2.6" fill="#fbbf3b" fillOpacity=".2" />
          <circle cx="69.5" cy="23" r="2.6" fill="#7dd3fc" fillOpacity=".2" />
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
        </svg>
        <span className="session-earth-marker session-earth-new-york">
          {newYork}
        </span>
        <span className="session-earth-marker session-earth-london">
          {london}
        </span>
      </div>
      <figcaption className="session-earth-card">
        <p className="session-earth-kicker">
          {spanish ? "SESIONES DE FOREX" : "FOREX SESSIONS"}
        </p>
        <div className="session-earth-hours">
          <div>
            <strong>{london}</strong>
            <span>08:00–17:00</span>
            <small>{spanish ? "Hora de Londres" : "London time"}</small>
          </div>
          <div>
            <strong>{newYork}</strong>
            <span>08:00–17:00</span>
            <small>{spanish ? "Hora de Nueva York" : "New York time"}</small>
          </div>
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
