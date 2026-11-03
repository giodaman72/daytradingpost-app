import {
  academyCourseHref,
  enforceAcademyCourseLocale,
} from "@/lib/academy/academyCourseLocale";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, CirclePlay } from "lucide-react";
import { AcademyLockedState } from "@/components/academy/AcademyLockedState";
import { AcademyViewEvent } from "@/components/academy/AcademyViewEvent";
import { CourseCurriculum } from "@/components/academy/CourseCurriculum";
import { AcademyError } from "@/lib/academy/academyErrors";
import { getAcademyLearningState } from "@/lib/academy/academyService";
import {
  academyLessonText,
  academyStatusLabel,
} from "@/lib/academy/academyLessonText";
import { localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const spanish = (await getRequestLocale()) === "es";
  return {
    title: spanish ? "Temario del curso" : "Course Curriculum",
    description: spanish
      ? "Tu temario privado del curso en la Academia DayTradingPost."
      : "Your private DayTradingPost Academy course curriculum.",
    robots: { index: false, follow: false },
  };
}

type LearnPageProps = {
  params: Promise<{ courseSlug: string }>;
};

export default async function LearnPage({ params }: LearnPageProps) {
  const [{ courseSlug }, locale] = await Promise.all([
    params,
    getRequestLocale(),
  ]);
  const tr = academyLessonText(locale);
  let result;
  try {
    result = await getAcademyLearningState(courseSlug);
  } catch (error) {
    if (error instanceof AcademyError) {
      if (error.code === "ACADEMY_UNAUTHENTICATED")
        redirect(
          `/login?next=${encodeURIComponent(`/academy/courses/${courseSlug}/learn`)}`,
        );
      if (error.code === "ACADEMY_NOT_ENROLLED")
        redirect(`/academy/courses/${courseSlug}`);
      if (error.code === "ACADEMY_PREMIUM_REQUIRED")
        return (
          <section className="academy-section">
            <div className="container">
              <AcademyLockedState
                courseSlug={courseSlug}
                locale={locale}
                message={tr(
                  "An active Premium membership is required to continue this course.",
                )}
                premium
                title={tr("Premium course access is paused.")}
              />
            </div>
          </section>
        );
      if (
        ["ACADEMY_COURSE_NOT_FOUND", "ACADEMY_VALIDATION_FAILED"].includes(
          error.code,
        )
      )
        notFound();
    }
    throw error;
  }
  const { course, learningState } = result;
  await enforceAcademyCourseLocale(
    course,
    `/academy/courses/${course.slug}/learn`,
  );
  const nextLesson = course.modules
    .flatMap((module) => module.lessons)
    .find((lesson) => {
      const state = learningState.lessonProgress.find(
        (item) => item.lessonId === lesson.id,
      );
      return state && state.status !== "locked" && state.status !== "completed";
    });
  if (nextLesson)
    redirect(
      academyCourseHref(
        course,
        `/academy/courses/${course.slug}/learn/${nextLesson.slug}`,
      ),
    );
  const lastCompletedLesson = course.modules
    .flatMap((module) => module.lessons)
    .toReversed()
    .find((lesson) =>
      learningState.lessonProgress.some(
        (item) => item.lessonId === lesson.id && item.status === "completed",
      ),
    );
  if (lastCompletedLesson)
    redirect(
      academyCourseHref(
        course,
        `/academy/courses/${course.slug}/learn/${lastCompletedLesson.slug}`,
      ),
    );
  return (
    <>
      <AcademyViewEvent courseId={course.id} name="academy_course_resumed" />
      <section className="academy-learn-header">
        <div className="container">
          <Link
            href={localizeHref(`/academy/courses/${course.slug}`, locale)}
            className="text-link"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            {tr("Course overview")}
          </Link>
          <div>
            <div>
              <span className="section-kicker">{tr("Your curriculum")}</span>
              <h1>{course.title}</h1>
              <p>
                {Math.round(learningState.enrollment.progressPercent)}%{" "}
                {tr("complete")} ·{" "}
                {academyStatusLabel(learningState.enrollment.status, locale)}
              </p>
            </div>
            <span className="academy-locked-note">
              <CirclePlay size={17} aria-hidden="true" />
              {tr(
                "No lesson is currently available. Review the prerequisite states below.",
              )}
            </span>
          </div>
          <div
            className="academy-course-progress"
            role="progressbar"
            aria-label={`${course.title} ${tr("progress")}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(learningState.enrollment.progressPercent)}
          >
            <span
              style={{
                width: `${Math.round(learningState.enrollment.progressPercent)}%`,
              }}
            />
          </div>
        </div>
      </section>
      <section className="academy-section academy-learning-curriculum">
        <div className="container">
          <CourseCurriculum
            course={course}
            learningState={learningState}
            locale={locale}
          />
        </div>
      </section>
    </>
  );
}
