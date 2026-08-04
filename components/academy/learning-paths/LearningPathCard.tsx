import Image from "next/image";
import Link from "next/link";
import { BookOpenCheck, Clock3, Crown, Gauge } from "lucide-react";
import { formatAcademyDuration } from "@/lib/academy/academyPresentation";
import type { AcademyLearningPath } from "@/types/academy";
import { localizeHref, type Locale } from "@/lib/i18n/config";

type LearningPathCardProps = {
  path: AcademyLearningPath;
  progressPercent?: number | null;
  recommendationReason?: string | null;
  locale?: Locale;
};

export function LearningPathCard({
  path,
  progressPercent,
  recommendationReason,
  locale = "en",
}: LearningPathCardProps) {
  const spanish = locale === "es";
  return (
    <article className="learning-path-card">
      <div className="learning-path-card-media">
        {path.coverImage?.url ? (
          <Image
            src={path.coverImage.url}
            alt={path.coverImage.alt || ""}
            fill
            sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw"
          />
        ) : (
          <BookOpenCheck size={38} aria-hidden="true" />
        )}
        <span className={`academy-access-badge ${path.accessLevel}`}>
          {path.accessLevel === "premium" ? (
            <Crown size={12} aria-hidden="true" />
          ) : null}
          {path.accessLevel}
        </span>
      </div>
      <div className="learning-path-card-content">
        <div className="academy-course-meta">
          <span>
            <Gauge aria-hidden="true" />
            {path.difficulty}
          </span>
          <span>
            <Clock3 aria-hidden="true" />
            {formatAcademyDuration(path.durationMinutes)}
          </span>
          <span>
            <BookOpenCheck aria-hidden="true" />
            {path.courses.length} {spanish ? "cursos" : "courses"}
          </span>
        </div>
        <h2>
          <Link
            href={localizeHref(`/academy/learning-paths/${path.slug}`, locale)}
          >
            {path.title}
          </Link>
        </h2>
        <p>
          {path.targetAudience[0] ??
            (spanish
              ? "Una secuencia guiada de cursos con progreso verificado."
              : "A guided sequence of Academy courses with verified progression.")}
        </p>
        {typeof progressPercent === "number" ? (
          <div className="learning-path-card-progress">
            <span>
              <span
                style={{
                  width: `${Math.max(0, Math.min(progressPercent, 100))}%`,
                }}
              />
            </span>
            <small>
              {Math.round(progressPercent)}%{" "}
              {spanish ? "completado" : "complete"}
            </small>
          </div>
        ) : null}
        {recommendationReason ? (
          <p className="learning-path-reason">{recommendationReason}</p>
        ) : null}
        <Link
          href={localizeHref(`/academy/learning-paths/${path.slug}`, locale)}
          className="text-link"
          aria-label={`${spanish ? "Ver itinerario" : "View learning path"}: ${path.title}`}
        >
          {spanish ? "Ver itinerario" : "View learning path"}{" "}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
