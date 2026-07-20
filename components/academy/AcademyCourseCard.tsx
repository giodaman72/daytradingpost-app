import Image from "next/image";
import Link from "next/link";
import { Clock3, Crown, Gauge, GraduationCap } from "lucide-react";
import type { AcademyCourse } from "@/types/academy";
import { formatAcademyDuration } from "@/lib/academy/academyPresentation";

type AcademyCourseCardProps = {
  course: AcademyCourse;
};

export function AcademyCourseCard({ course }: AcademyCourseCardProps) {
  return (
    <article className="academy-course-card">
      <Link
        href={`/academy/courses/${course.slug}`}
        className="academy-course-card-media"
        aria-label={`View ${course.title}`}
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
          {course.accessLevel}
        </span>
      </Link>
      <div className="academy-course-card-content">
        <div className="academy-course-meta">
          <span>
            <Gauge size={13} aria-hidden="true" />
            {course.difficulty}
          </span>
          <span>
            <Clock3 size={13} aria-hidden="true" />
            {formatAcademyDuration(course.durationMinutes)}
          </span>
        </div>
        <h2>
          <Link href={`/academy/courses/${course.slug}`}>{course.title}</Link>
        </h2>
        <p>{course.excerpt}</p>
        <div className="academy-course-card-footer">
          <span>{course.instructor?.name ?? "DayTradingPost Academy"}</span>
          <Link href={`/academy/courses/${course.slug}`} className="text-link">
            View course <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
