import { enforceAcademyCourseLocale } from "@/lib/academy/academyCourseLocale";
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
import { AcademyTutorLessonActions } from "@/components/academy/tutor/AcademyTutorLessonActions";
import { AcademyError } from "@/lib/academy/academyErrors";
import { formatAcademyDuration } from "@/lib/academy/academyPresentation";
import {
  academyLessonKicker,
  academyLessonText,
  academyLockedMessage,
  academyStatusLabel,
} from "@/lib/academy/academyLessonText";
import { localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import {
  getAcademyCourse,
  getAcademyLessonView,
} from "@/lib/academy/academyService";
import { findPublishedLessonByCourseAndSlug } from "@/lib/academy/academyRepository";
import { listCourseBookmarks } from "@/lib/academy/bookmarks/bookmarkService";
import { listCourseNotes } from "@/lib/academy/notes/learnerNoteService";

type LessonPageProps = {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
};

export const dynamic = "force-dynamic";

/** Published lesson title for the browser tab, without its "N. " order prefix. */
async function lessonTitle(courseSlug: string, lessonSlug: string) {
  try {
    const course = await getAcademyCourse(courseSlug);
    const lesson = await findPublishedLessonByCourseAndSlug(
      course.id,
      lessonSlug,
    );
    if (lesson?.title) return lesson.title.replace(/^\d+\.\s+/, "");
  } catch {
    // Fall back to a readable slug below.
  }
  return lessonSlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const [{ courseSlug, lessonSlug }, locale] = await Promise.all([
    params,
    getRequestLocale(),
  ]);
  const tr = academyLessonText(locale);
  return {
    title: await lessonTitle(courseSlug, lessonSlug),
    description: tr("Private DayTradingPost Academy lesson."),
    alternates: {
      canonical: localizeHref(
        `/academy/courses/${courseSlug}/learn/${lessonSlug}`,
        locale,
      ),
    },
    robots: { index: false, follow: false },
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const [{ courseSlug, lessonSlug }, locale] = await Promise.all([
    params,
    getRequestLocale(),
  ]);
  const tr = academyLessonText(locale);
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
                locale={locale}
                message={academyLockedMessage(
                  error.code,
                  error.message,
                  locale,
                )}
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
  await enforceAcademyCourseLocale(
    course,
    `/academy/courses/${course.slug}/learn/${currentLesson.slug}`,
  );
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
            href={localizeHref(`/academy/courses/${course.slug}/learn`, locale)}
            className="text-link"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            {tr("Back to curriculum")}
          </Link>
          <span className="section-kicker">
            {academyLessonKicker(currentLesson.lessonType, locale)}
          </span>
          <h1>{currentLesson.title}</h1>
          <p>{currentLesson.summary}</p>
          <div className="academy-lesson-meta">
            <span>{formatAcademyDuration(currentLesson.durationMinutes)}</span>
            <span>
              {currentLesson.requiredForCompletion
                ? tr("Required")
                : tr("Optional")}
            </span>
            <span>
              {academyStatusLabel(progress?.status ?? "available", locale)}
            </span>
          </div>
        </div>
      </section>
      <section className="academy-lesson-section">
        <div className="container academy-lesson-layout">
          <LessonCurriculumNavigation
            course={course}
            learningState={learningState}
            locale={locale}
          />
          <article className="academy-lesson-content">
            <AcademyLessonRenderer
              courseId={course.id}
              enrollmentId={learningState.enrollment.id}
              initialPosition={progress?.videoPositionSeconds ?? 0}
              lesson={currentLesson}
              locale={locale}
              moduleId={currentLesson.moduleId}
            />
            <LessonResources
              locale={locale}
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
              locale={locale}
              moduleId={currentLesson.moduleId}
              status={progress?.status ?? "available"}
            />
            {currentLesson.aiTutorEnabled ? (
              <AcademyTutorLessonActions
                courseSlug={course.slug}
                lessonSlug={currentLesson.slug}
                locale={locale}
              />
            ) : null}
            <nav
              className="academy-lesson-pagination"
              aria-label={tr("Lesson navigation")}
            >
              {previousLesson ? (
                <Link
                  href={localizeHref(
                    `/academy/courses/${course.slug}/learn/${previousLesson.slug}`,
                    locale,
                  )}
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  <span>
                    <small>{tr("Previous")}</small>
                    {previousLesson.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {nextLesson ? (
                <Link
                  href={localizeHref(
                    `/academy/courses/${course.slug}/learn/${nextLesson.slug}`,
                    locale,
                  )}
                >
                  <span>
                    <small>{tr("Next")}</small>
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
            locale={locale}
            moduleId={currentLesson.moduleId}
            positionSeconds={progress?.videoPositionSeconds}
          />
        </div>
      </section>
      <section className="academy-disclaimer">
        <div className="container">
          <strong>{tr("Educational risk notice")}</strong>
          <p>
            {tr(
              "This lesson is educational and does not provide personalized investment advice or guarantee any trading outcome.",
            )}
          </p>
        </div>
      </section>
    </>
  );
}
