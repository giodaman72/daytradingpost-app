import Image from "next/image";
import earthImage from "@/public/images/home-earth-3d.webp";
import { RotatingEarthSurface } from "./RotatingEarthSurface";

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
            alt={spanish ? "La Tierra" : "Earth"}
            width={1254}
            height={1254}
            unoptimized
            loading="eager"
            fetchPriority="high"
          />
          <RotatingEarthSurface src={earthImage.src} />
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
