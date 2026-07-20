import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AcademyLessonRenderer } from "@/components/academy/AcademyLessonRenderer";
import { AcademyLockedState } from "@/components/academy/AcademyLockedState";
import { LessonCurriculumNavigation } from "@/components/academy/LessonCurriculumNavigation";
import { LessonProgressControls } from "@/components/academy/LessonProgressControls";
import { LessonResources } from "@/components/academy/LessonResources";
import { LessonTools } from "@/components/academy/LessonTools";
import { AcademyError } from "@/lib/academy/academyErrors";
import {
  formatAcademyDuration,
  lessonTypeLabel,
} from "@/lib/academy/academyPresentation";
import { getAcademyLessonView } from "@/lib/academy/academyService";
import { listCourseBookmarks } from "@/lib/academy/bookmarks/bookmarkService";
import { listCourseNotes } from "@/lib/academy/notes/learnerNoteService";

type LessonPageProps = {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  return {
    title: lessonSlug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    description: "Private DayTradingPost Academy lesson.",
    alternates: {
      canonical: `/academy/courses/${courseSlug}/learn/${lessonSlug}`,
    },
    robots: { index: false, follow: false },
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseSlug, lessonSlug } = await params;
  let view;
  try {
    view = await getAcademyLessonView(courseSlug, lessonSlug);
  } catch (error) {
    if (error instanceof AcademyError) {
      if (error.code === "ACADEMY_UNAUTHENTICATED")
        redirect(
          `/login?next=${encodeURIComponent(`/academy/courses/${courseSlug}/learn/${lessonSlug}`)}`,
        );
      if (
        [
          "ACADEMY_COURSE_NOT_FOUND",
          "ACADEMY_LESSON_NOT_FOUND",
          "ACADEMY_VALIDATION_FAILED",
        ].includes(error.code)
      )
        notFound();
      if (
        [
          "ACADEMY_LESSON_LOCKED",
          "ACADEMY_PREREQUISITE_NOT_MET",
          "ACADEMY_PREMIUM_REQUIRED",
        ].includes(error.code)
      )
        return (
          <section className="academy-section">
            <div className="container">
              <AcademyLockedState
                courseSlug={courseSlug}
                message={error.message}
                premium={error.code === "ACADEMY_PREMIUM_REQUIRED"}
              />
            </div>
          </section>
        );
      if (error.code === "ACADEMY_NOT_ENROLLED")
        redirect(`/academy/courses/${courseSlug}`);
    }
    throw error;
  }
  const { course, currentLesson, learningState, nextLesson, previousLesson } =
    view;
  const progress =
    learningState.lessonProgress.find(
      (item) => item.lessonId === currentLesson.id,
    ) ?? null;
  const [bookmarks, notes] = await Promise.all([
    listCourseBookmarks(course.id, 100, 0).catch(() => []),
    listCourseNotes(course.id, 100, 0).catch(() => []),
  ]);
  return (
    <>
      <section className="academy-lesson-header">
        <div className="container">
          <Link
            href={`/academy/courses/${course.slug}/learn`}
            className="text-link"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Back to curriculum
          </Link>
          <span className="section-kicker">
            {lessonTypeLabel(currentLesson.lessonType)} lesson
          </span>
          <h1>{currentLesson.title}</h1>
          <p>{currentLesson.summary}</p>
          <div className="academy-lesson-meta">
            <span>{formatAcademyDuration(currentLesson.durationMinutes)}</span>
            <span>
              {currentLesson.requiredForCompletion ? "Required" : "Optional"}
            </span>
            <span>{progress?.status.replace("_", " ") ?? "Available"}</span>
          </div>
        </div>
      </section>
      <section className="academy-lesson-section">
        <div className="container academy-lesson-layout">
          <LessonCurriculumNavigation
            course={course}
            learningState={learningState}
          />
          <article className="academy-lesson-content">
            <AcademyLessonRenderer
              courseId={course.id}
              enrollmentId={learningState.enrollment.id}
              initialPosition={progress?.videoPositionSeconds ?? 0}
              lesson={currentLesson}
              moduleId={currentLesson.moduleId}
            />
            <LessonResources
              resources={currentLesson.resources.map((resource) => ({
                ...resource,
                url: `/api/academy/resources/${encodeURIComponent(resource.id)}?courseSlug=${encodeURIComponent(course.slug)}&lessonSlug=${encodeURIComponent(currentLesson.slug)}`,
              }))}
            />
            <LessonProgressControls
              assessmentId={
                "assessmentId" in currentLesson
                  ? currentLesson.assessmentId
                  : null
              }
              completionMode={currentLesson.completionMode}
              courseId={course.id}
              enrollmentId={learningState.enrollment.id}
              lessonId={currentLesson.id}
              moduleId={currentLesson.moduleId}
              status={progress?.status ?? "available"}
            />
            {currentLesson.aiTutorEnabled ? (
              <section className="academy-tutor-entry">
                <div>
                  <span className="section-kicker">
                    Optional learning support
                  </span>
                  <h2>Ask the AI Assistant about this concept</h2>
                  <p>
                    The Assistant opens only when you choose it and uses
                    published educational sources. It does not receive your
                    private notes or assessment answers.
                  </p>
                </div>
                <Link
                  className="button button-secondary"
                  href={`/assistant?mode=general_education&prompt=${encodeURIComponent(`Explain the key concepts in the Academy lesson “${currentLesson.title}”.`)}`}
                >
                  Ask about this lesson
                </Link>
              </section>
            ) : null}
            <nav
              className="academy-lesson-pagination"
              aria-label="Lesson navigation"
            >
              {previousLesson ? (
                <Link
                  href={`/academy/courses/${course.slug}/learn/${previousLesson.slug}`}
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  <span>
                    <small>Previous</small>
                    {previousLesson.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {nextLesson ? (
                <Link
                  href={`/academy/courses/${course.slug}/learn/${nextLesson.slug}`}
                >
                  <span>
                    <small>Next</small>
                    {nextLesson.title}
                  </span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              ) : null}
            </nav>
          </article>
          <LessonTools
            courseId={course.id}
            initialBookmarks={bookmarks}
            initialNotes={notes}
            lessonId={currentLesson.id}
            moduleId={currentLesson.moduleId}
            positionSeconds={progress?.videoPositionSeconds}
          />
        </div>
      </section>
      <section className="academy-disclaimer">
        <div className="container">
          <strong>Educational risk notice</strong>
          <p>
            This lesson is educational and does not provide personalized
            investment advice or guarantee any trading outcome.
          </p>
        </div>
      </section>
    </>
  );
}
