import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Award, UsersRound } from "lucide-react";
import { AcademyPortableText } from "@/components/academy/AcademyPortableText";
import { AcademyViewEvent } from "@/components/academy/AcademyViewEvent";
import { LearningPathEnrollmentButton } from "@/components/academy/learning-paths/LearningPathEnrollmentButton";
import { LearningPathHero } from "@/components/academy/learning-paths/LearningPathHero";
import { LearningPathLockedState } from "@/components/academy/learning-paths/LearningPathLockedState";
import { LearningPathCourseMap } from "@/components/academy/learning-paths/LearningPathCourseMap";
import { LearningPathMilestone } from "@/components/academy/learning-paths/LearningPathMilestone";
import { LearningPathProgress } from "@/components/academy/learning-paths/LearningPathProgress";
import { AcademyError } from "@/lib/academy/academyErrors";
import { formatAcademyDuration } from "@/lib/academy/academyPresentation";
import {
  getAcademyLearningPath,
  getAcademyLearningPathView,
} from "@/lib/academy/learningPaths/learningPathService";
import { getLearningPathMilestones } from "@/lib/academy/learningPaths/learningPathProgress";

type LearningPathPageProps = {
  params: Promise<{ pathSlug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: LearningPathPageProps): Promise<Metadata> {
  try {
    const path = await getAcademyLearningPath((await params).pathSlug);
    const description = `Follow ${path.title}, a ${path.difficulty} DayTradingPost Academy learning path with ${path.courses.length} ordered courses.`;
    return {
      title: path.title,
      description,
      alternates: { canonical: `/academy/learning-paths/${path.slug}` },
      openGraph: {
        title: `${path.title} | DayTradingPost Academy`,
        description,
        images: path.coverImage?.url
          ? [{ url: path.coverImage.url, alt: path.coverImage.alt }]
          : undefined,
        type: "website",
        url: `/academy/learning-paths/${path.slug}`,
      },
    };
  } catch {
    return {
      title: "Learning path not found",
      robots: { index: false, follow: false },
    };
  }
}

export default async function LearningPathPage({
  params,
}: LearningPathPageProps) {
  const { pathSlug } = await params;
  let view;
  try {
    view = await getAcademyLearningPathView(pathSlug);
  } catch (error) {
    if (
      error instanceof AcademyError &&
      ["ACADEMY_COURSE_NOT_FOUND", "ACADEMY_VALIDATION_FAILED"].includes(
        error.code,
      )
    )
      notFound();
    throw error;
  }
  const { path, progress } = view;
  const milestones = getLearningPathMilestones(progress.progressPercent);
  return (
    <>
      {view.authenticated ? (
        <>
          <AcademyViewEvent
            learningPathId={path.id}
            name="academy_learning_path_viewed"
          />
          {progress.progressPercent === 100 ? (
            <AcademyViewEvent
              learningPathId={path.id}
              name="academy_learning_path_completed"
            />
          ) : null}
        </>
      ) : null}
      <LearningPathHero path={path} />
      <section className="academy-course-overview">
        <div className="container learning-path-detail-grid">
          <article>
            <span className="section-kicker">Path overview</span>
            <AcademyPortableText value={path.description} />
            {path.targetAudience.length ? (
              <section className="academy-objectives">
                <h2>Who this path is for</h2>
                <ul>
                  {path.targetAudience.map((audience) => (
                    <li key={audience}>
                      <UsersRound size={17} aria-hidden="true" />
                      {audience}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            <section className="academy-course-prerequisites">
              <h2>Prerequisites and completion rules</h2>
              <p>
                {path.prerequisitePathIds.length
                  ? `Complete ${path.prerequisitePathIds.length} prerequisite learning ${path.prerequisitePathIds.length === 1 ? "path" : "paths"} before enrollment.`
                  : "No prerequisite learning path is required."}
              </p>
              <p>
                Completion requires every course marked Required. Optional
                courses enrich the path but do not reduce or block completion.
                Progress is calculated from server-verified course enrollments.
              </p>
            </section>
          </article>
          <aside className="academy-enrollment-card learning-path-enrollment">
            <div>
              <strong>
                {view.enrollment ? "Your learning path" : "Start this path"}
              </strong>
              <p>
                {view.enrollment
                  ? `${Math.round(progress.progressPercent)}% of required courses complete.`
                  : "Enrollment creates one path record and initializes the first eligible course without duplicating existing course enrollments."}
              </p>
              <LearningPathEnrollmentButton
                authenticated={view.authenticated}
                enrollment={view.enrollment}
                learningPathId={path.id}
                lockReason={view.lockReason}
                nextCourseSlug={progress.nextCourse?.slug ?? null}
                pathSlug={path.slug}
              />
            </div>
            <dl>
              <div>
                <dt>Required courses</dt>
                <dd>{progress.requiredCourses}</dd>
              </div>
              <div>
                <dt>Optional courses</dt>
                <dd>{path.courses.length - progress.requiredCourses}</dd>
              </div>
              <div>
                <dt>Estimated duration</dt>
                <dd>{formatAcademyDuration(path.durationMinutes)}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
      {view.enrollment ? (
        <section className="academy-section learning-path-progress-section">
          <div className="container">
            <LearningPathProgress
              completed={progress.completedRequiredCourses}
              historicalCompletion={progress.historicalCompletion}
              optionalCompleted={progress.completedOptionalCourses}
              percent={progress.progressPercent}
              remainingLabel={formatAcademyDuration(
                progress.remainingDurationMinutes,
              )}
              required={progress.requiredCourses}
            />
          </div>
        </section>
      ) : view.lockReason && view.authenticated ? (
        <section className="academy-section">
          <div className="container">
            <LearningPathLockedState reason={view.lockReason} />
          </div>
        </section>
      ) : null}
      <section className="academy-section">
        <div className="container learning-path-content-grid">
          <LearningPathCourseMap
            learningPathId={path.id}
            nodes={progress.nodes}
          />
          <aside className="learning-path-milestones">
            <span className="section-kicker">Milestones</span>
            <h2>Path checkpoints</h2>
            <ul>
              {milestones.map((milestone) => (
                <LearningPathMilestone
                  key={milestone.threshold}
                  {...milestone}
                />
              ))}
            </ul>
            <div className="learning-path-certificate-note">
              <Award size={18} aria-hidden="true" />
              <p>
                Learning-path certificates are not issued in this release.
                Course certificates remain available only where a course has a
                real configured certificate workflow.
              </p>
            </div>
          </aside>
        </div>
      </section>
      <section className="academy-disclaimer">
        <div className="container">
          <strong>Educational risk notice</strong>
          <p>
            This guided curriculum is educational only. It is not a trading
            signal, individualized advice, or a promise of financial results.
          </p>
        </div>
      </section>
    </>
  );
}
