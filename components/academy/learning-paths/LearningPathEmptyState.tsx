import Link from "next/link";
import { Route } from "lucide-react";
import { localizeHref, type Locale } from "@/lib/i18n/config";

type LearningPathEmptyStateProps = {
  dashboard?: boolean;
  locale?: Locale;
};

export function LearningPathEmptyState({
  dashboard = false,
  locale = "en",
}: LearningPathEmptyStateProps) {
  const spanish = locale === "es";
  return (
    <div className="academy-empty-state">
      <Route aria-hidden="true" />
      <h2>
        {spanish
          ? dashboard
            ? "Aún no te has inscrito en ningún itinerario"
            : "Ningún itinerario coincide con estos filtros"
          : dashboard
            ? "No learning paths enrolled yet"
            : "No learning paths match these filters"}
      </h2>
      <p>
        {spanish
          ? dashboard
            ? "Elige un plan guiado que conecte cursos en una progresión clara."
            : "Amplía la búsqueda o restablece los filtros de dificultad, categoría y acceso."
          : dashboard
            ? "Choose a guided curriculum to connect courses into one clear progression."
            : "Try a broader search or reset the difficulty, category and access filters."}
      </p>
      <Link
        className="button"
        href={localizeHref("/academy/learning-paths", locale)}
      >
        {spanish ? "Explorar itinerarios" : "Browse learning paths"}
      </Link>
    </div>
  );
}
