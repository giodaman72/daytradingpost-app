import Link from "next/link";
import { BookOpenCheck } from "lucide-react";
import type { AcademyEnrollment } from "@/types/academy";
import { DashboardPanel } from "./DashboardPanel";
import { localizeHref, type Locale } from "@/lib/i18n/config";

type AcademyProgressProps = {
  courseTitle?: string | null;
  enrollment?: AcademyEnrollment | null;
  locale?: Locale;
};

export function AcademyProgress({
  courseTitle = null,
  enrollment = null,
  locale = "en",
}: AcademyProgressProps) {
  const spanish = locale === "es";
  const percentage = Math.round(enrollment?.progressPercent ?? 0);
  return (
    <DashboardPanel
      id="academy-progress"
      eyebrow={spanish ? "Ruta de aprendizaje" : "Learning path"}
      title={spanish ? "Progreso en la Academia" : "Academy Progress"}
    >
      <div className="dashboard-progress-card">
        <div className="dashboard-progress-heading">
          <span>
            <BookOpenCheck size={21} aria-hidden="true" />
          </span>
          <div>
            <strong>
              {courseTitle ??
                (spanish ? "Academia de trading" : "Trading Academy")}
            </strong>
            <p>
              {enrollment
                ? spanish
                  ? `Curso ${enrollment.status.replace("_", " ")}`
                  : `${enrollment.status.replace("_", " ")} course`
                : spanish
                  ? "Aún no hay un curso activo"
                  : "No active course yet"}
            </p>
          </div>
          <b>{percentage}%</b>
        </div>
        <div
          className="dashboard-progress-track"
          role="progressbar"
          aria-label={`${courseTitle ?? (spanish ? "Curso de la Academia" : "Academy course")} ${spanish ? "progreso" : "progress"}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
        >
          <span style={{ width: `${percentage}%` }} />
        </div>
        <p>
          {enrollment
            ? spanish
              ? "Continúa desde tu plan privado. El progreso de lecciones y evaluaciones se guarda automáticamente."
              : "Continue from your private curriculum. Lesson and assessment progress is saved automatically."
            : spanish
              ? "Elige un curso estructurado sobre mercados, gestión de riesgos o planificación de operaciones."
              : "Choose a structured course in market process, risk management or trade planning."}
        </p>
        <Link
          href={
            enrollment
              ? localizeHref(
                  `/academy/courses/${enrollment.courseSlug}/learn`,
                  locale,
                )
              : localizeHref("/academy", locale)
          }
          className="button button-secondary"
        >
          {enrollment
            ? spanish
              ? "Continuar curso"
              : "Continue course"
            : spanish
              ? "Explorar la Academia"
              : "Explore the academy"}
        </Link>
      </div>
    </DashboardPanel>
  );
}
