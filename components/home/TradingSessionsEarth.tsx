import Image from "next/image";
import earthImage from "@/public/images/home-earth-3d.webp";
import { ForexSessionsContent } from "./ForexSessions";

/**
 * Globe hero visual. The homepage now leads with the latest analysis and
 * only falls back to this when no article can be loaded.
 */
export function TradingSessionsEarth({ locale }: { locale: "en" | "es" }) {
  const spanish = locale === "es";

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
        </div>
      </div>
      <figcaption className="session-earth-card">
        <ForexSessionsContent locale={locale} />
      </figcaption>
    </figure>
  );
}
