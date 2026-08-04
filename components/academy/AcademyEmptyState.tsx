import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { localizeHref, type Locale } from "@/lib/i18n/config";

type AcademyEmptyStateProps = {
  filtered?: boolean;
  locale?: Locale;
};

export function AcademyEmptyState({
  filtered = false,
  locale = "en",
}: AcademyEmptyStateProps) {
  const spanish = locale === "es";
  return (
    <div className="academy-empty-state">
      <BookOpenText size={34} aria-hidden="true" />
      <h2>
        {filtered
          ? spanish
            ? "Ningún curso coincide con estos filtros."
            : "No courses match these filters."
          : spanish
            ? "Los cursos están en camino."
            : "Courses are on the way."}
      </h2>
      <p>
        {filtered
          ? spanish
            ? "Prueba una palabra más general o restablece los filtros de dificultad y acceso."
            : "Try a broader keyword or reset the difficulty and access filters."
          : spanish
            ? "Los cursos publicados aparecerán aquí en cuanto el programa esté listo."
            : "Published Academy courses will appear here as soon as the curriculum is ready."}
      </p>
      {filtered ? (
        <Link
          href={localizeHref("/academy/courses", locale)}
          className="button button-secondary"
        >
          {spanish ? "Limpiar filtros" : "Clear filters"}
        </Link>
      ) : null}
    </div>
  );
}
