import Link from "next/link";
import { localizeHref, type Locale } from "@/lib/i18n/config";

export function EmptyMarketState({
  admin = false,
  locale = "en",
}: {
  admin?: boolean;
  locale?: Locale;
}) {
  const spanish = locale === "es";
  return (
    <div className="mi-empty" role="status">
      <span aria-hidden="true">◇</span>
      <h3>
        {spanish
          ? "No hay perspectivas publicadas"
          : "No published outlooks available"}
      </h3>
      <p>
        {spanish
          ? "El equipo editorial aún no ha publicado inteligencia estructurada de mercado para esta vista."
          : "The editorial desk has not published structured market intelligence for this view yet."}
      </p>
      {admin ? (
        <Link href="/admin/market-intelligence/new">Create an outlook</Link>
      ) : (
        <Link href={localizeHref("/analysis", locale)}>
          {spanish ? "Explorar análisis" : "Browse analysis"}
        </Link>
      )}
    </div>
  );
}
