import Link from "next/link";
import { localizeHref, type Locale } from "@/lib/i18n/config";

type ArticleEmptyStateProps = {
  compact?: boolean;
  locale?: Locale;
};

export function ArticleEmptyState({
  compact = false,
  locale = "en",
}: ArticleEmptyStateProps) {
  const spanish = locale === "es";
  return (
    <div className={`analysis-empty-state${compact ? " compact" : ""}`}>
      <span className="analysis-empty-icon" aria-hidden="true">
        DTP
      </span>
      <div>
        <span className="section-kicker">
          {spanish ? "Mesa editorial" : "Publishing desk"}
        </span>
        <h3>
          {spanish
            ? "Estamos preparando un nuevo análisis de mercado."
            : "New market analysis is being prepared."}
        </h3>
        <p>
          {spanish
            ? "Aún no hay artículos publicados. Vuelve pronto para consultar el próximo informe de mercados de DayTradingPost."
            : "No published articles are available yet. Check back shortly for the next DayTradingPost market briefing."}
        </p>
        {!compact ? (
          <Link href={localizeHref("/", locale)} className="card-link">
            {spanish ? "Volver al inicio" : "Return home"}{" "}
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
