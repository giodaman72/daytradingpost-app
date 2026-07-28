import Image from "next/image";
import Link from "next/link";
import { BookOpenCheck, Clock3, Crown, Gauge, UsersRound } from "lucide-react";
import { formatAcademyDuration } from "@/lib/academy/academyPresentation";
import type { AcademyLearningPath } from "@/types/academy";

type LearningPathHeroProps = {
  path: AcademyLearningPath;
};

export function LearningPathHero({ path }: LearningPathHeroProps) {
  return (
    <section className="learning-path-hero">
      <div className="hero-grid" aria-hidden="true" />
      <div className="container">
        <nav aria-label="Breadcrumb">
          <Link href="/academy">Academy</Link>
          <span aria-hidden="true">/</span>
          <Link href="/academy/learning-paths">Learning paths</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{path.title}</span>
        </nav>
        <div className="learning-path-hero-grid">
          <div>
            <span className={`academy-access-badge ${path.accessLevel}`}>
              {path.accessLevel === "premium" ? (
                <Crown size={12} aria-hidden="true" />
              ) : null}
              {path.accessLevel} path
            </span>
            <h1>{path.title}</h1>
            <div className="academy-course-facts">
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
              <span>
                <UsersRound aria-hidden="true" />
                {path.targetAudience.length
                  ? `${path.targetAudience.length} audience groups`
                  : "All focused learners"}
              </span>
            </div>
          </div>
          {path.coverImage?.url ? (
            <div className="learning-path-hero-image">
              <Image
                src={path.coverImage.url}
                alt={path.coverImage.alt || ""}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 420px"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
