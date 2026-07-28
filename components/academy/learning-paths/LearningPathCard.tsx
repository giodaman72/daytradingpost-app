import Image from "next/image";
import Link from "next/link";
import { BookOpenCheck, Clock3, Crown, Gauge } from "lucide-react";
import { formatAcademyDuration } from "@/lib/academy/academyPresentation";
import type { AcademyLearningPath } from "@/types/academy";

type LearningPathCardProps = {
  path: AcademyLearningPath;
  progressPercent?: number | null;
  recommendationReason?: string | null;
};

export function LearningPathCard({
  path,
  progressPercent,
  recommendationReason,
}: LearningPathCardProps) {
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
            {path.courses.length} courses
          </span>
        </div>
        <h2>
          <Link href={`/academy/learning-paths/${path.slug}`}>
            {path.title}
          </Link>
        </h2>
        <p>
          {path.targetAudience[0] ??
            "A guided sequence of Academy courses with verified progression."}
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
            <small>{Math.round(progressPercent)}% complete</small>
          </div>
        ) : null}
        {recommendationReason ? (
          <p className="learning-path-reason">{recommendationReason}</p>
        ) : null}
        <Link
          href={`/academy/learning-paths/${path.slug}`}
          className="text-link"
          aria-label={`View ${path.title} learning path`}
        >
          View learning path <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
