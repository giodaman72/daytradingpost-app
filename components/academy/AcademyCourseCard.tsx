import Image from "next/image";
import Link from "next/link";
import { Clock3, Crown, Gauge, GraduationCap } from "lucide-react";
import type { AcademyCourse } from "@/types/academy";
import { formatAcademyDuration } from "@/lib/academy/academyPresentation";
import { localizeHref, type Locale } from "@/lib/i18n/config";

type AcademyCourseCardProps = {
  course: AcademyCourse;
  locale?: Locale;
};

export function AcademyCourseCard({
  course,
  locale = "en",
}: AcademyCourseCardProps) {
  const spanish = locale === "es";
  const courseHref = localizeHref(`/academy/courses/${course.slug}`, locale);
  const difficultyLabels: Record<string, string> = {
    beginner: "principiante",
    intermediate: "intermedio",
    advanced: "avanzado",
  };
  return (
    <article className="academy-course-card">
      <Link
        href={courseHref}
        className="academy-course-card-media"
        aria-label={spanish ? `Ver ${course.title}` : `View ${course.title}`}
      >
        {course.coverImage?.url ? (
          <Image
            src={course.coverImage.url}
            alt={course.coverImage.alt || ""}
            fill
            sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw"
          />
        ) : (
          <span aria-hidden="true">
            <GraduationCap size={38} />
          </span>
        )}
        <span className={`academy-access-badge ${course.accessLevel}`}>
          {course.accessLevel === "premium" ? (
            <Crown size={12} aria-hidden="true" />
          ) : null}
          {course.accessLevel === "free" && spanish
            ? "gratis"
            : course.accessLevel}
        </span>
      </Link>
      <div className="academy-course-card-content">
        <div className="academy-course-meta">
          <span>
            <Gauge size={13} aria-hidden="true" />
            {spanish
              ? (difficultyLabels[course.difficulty] ?? course.difficulty)
              : course.difficulty}
          </span>
          <span>
            <Clock3 size={13} aria-hidden="true" />
            {formatAcademyDuration(course.durationMinutes)}
          </span>
        </div>
        <h2>
          <Link href={courseHref}>{course.title}</Link>
        </h2>
        <p>{course.excerpt}</p>
        <div className="academy-course-card-footer">
          <span>{course.instructor?.name ?? "DayTradingPost Academy"}</span>
          <Link href={courseHref} className="text-link">
            {spanish ? "Ver curso" : "View course"}{" "}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      {spanish ? (
        <span className="sr-only" lang="es">
          El contenido editorial de este curso se conserva en su idioma fuente.
        </span>
      ) : null}
    </article>
  );
}
