import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AcademyTutorShell } from "@/components/academy/tutor/AcademyTutorShell";
import { AcademyError } from "@/lib/academy/academyErrors";
import { enforceAcademyCourseLocale } from "@/lib/academy/academyCourseLocale";
import { academyLessonText } from "@/lib/academy/academyLessonText";
import { localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import { filterAuthorizedTutorMessages } from "@/lib/academy/ai/academyTutorMessages";
import {
  getAcademyLearningState,
  getAcademyLessonView,
} from "@/lib/academy/academyService";
import { requireAssistantAccess } from "@/lib/ai/assistantAuthorization";
import { listConversations, listMessages } from "@/lib/ai/assistantRepository";
import { getAssistantUsage } from "@/lib/ai/assistantUsage";
import {
  ACADEMY_TUTOR_MODES,
  type AcademyTutorMode,
} from "@/types/ai-assistant";

type Props = {
  params: Promise<{ courseSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ courseSlug }, locale] = await Promise.all([
    params,
    getRequestLocale(),
  ]);
  const tr = academyLessonText(locale);
  return {
    title: tr("Course AI Tutor"),
    description: tr("Private, source-grounded AI Tutor for an Academy course."),
    alternates: {
      canonical: localizeHref(`/academy/courses/${courseSlug}/tutor`, locale),
    },
    robots: { index: false, follow: false },
  };
}

const value = (input: string | string[] | undefined) =>
  typeof input === "string" ? input : null;

export default async function CourseTutorPage({ params, searchParams }: Props) {
  const [{ courseSlug }, query, locale] = await Promise.all([
    params,
    searchParams,
    getRequestLocale(),
  ]);
  const tr = academyLessonText(locale);
  const lessonSlug = value(query.lesson);
  const attemptId = value(query.attempt);
  let access;
  try {
    access = await requireAssistantAccess();
  } catch {
    redirect(
      `${localizeHref("/login", locale)}?next=${encodeURIComponent(localizeHref(`/academy/courses/${courseSlug}/tutor`, locale))}`,
    );
  }
  let course;
  let lesson = null;
  try {
    if (lessonSlug) {
      const view = await getAcademyLessonView(courseSlug, lessonSlug);
      course = view.course;
      lesson = view.currentLesson;
      if (!lesson.aiTutorEnabled)
        throw new AcademyError(
          "ACADEMY_FORBIDDEN",
          "AI Tutor is not enabled for this lesson.",
        );
    } else {
      course = (await getAcademyLearningState(courseSlug)).course;
    }
  } catch (error) {
    if (error instanceof AcademyError) {
      if (
        ["ACADEMY_COURSE_NOT_FOUND", "ACADEMY_LESSON_NOT_FOUND"].includes(
          error.code,
        )
      )
        notFound();
      if (error.code === "ACADEMY_NOT_ENROLLED")
        redirect(localizeHref(`/academy/courses/${courseSlug}`, locale));
      if (error.code === "ACADEMY_PREMIUM_REQUIRED")
        redirect(localizeHref("/premium", locale));
    }
    throw error;
  }
  const tutorPath = `/academy/courses/${course.slug}/tutor`;
  await enforceAcademyCourseLocale(course, tutorPath);
  const conversationId = value(query.conversation);
  const conversations = await listConversations(
    access.userId,
    1,
    20,
    "academy_tutor",
  ).catch(() => []);
  const active = conversationId
    ? (conversations.find(
        (conversation) => conversation.id === conversationId,
      ) ?? null)
    : null;
  const messages = active
    ? filterAuthorizedTutorMessages(
        await listMessages(access.userId, active.id, 50).catch(() => []),
        access.hasPremiumAccess,
        course.slug,
      )
    : [];
  const requestedMode = value(query.action) as AcademyTutorMode | null;
  const tutorMode =
    requestedMode && ACADEMY_TUTOR_MODES.includes(requestedMode)
      ? requestedMode
      : "lesson_question";
  const basePath = `${localizeHref(tutorPath, locale)}${
    lesson ? `?lesson=${encodeURIComponent(lesson.slug)}` : ""
  }`;

  return (
    <>
      <section className="assistant-hero">
        <div className="container">
          <span className="section-kicker">
            {tr("Private Academy workspace")}
          </span>
          <h1>
            {locale === "es"
              ? `Tutor: ${lesson ? lesson.title : course.title}`
              : `${lesson ? lesson.title : course.title} Tutor`}
          </h1>
          <p>
            {tr(
              "Context is limited to content your account can access. Private notes, answer keys, drafts, and other learners are excluded.",
            )}
          </p>
        </div>
      </section>
      <div className="container">
        <AcademyTutorShell
          initialConversations={conversations}
          initialMessages={messages}
          initialConversationId={active?.id ?? null}
          initialUsage={await getAssistantUsage(
            access.userId,
            access.hasPremiumAccess,
          )}
          premium={access.hasPremiumAccess}
          basePath={basePath}
          locale={locale}
          initialContext={{
            courseSlug: course.slug,
            courseTitle: course.title,
            lessonSlug: lesson?.slug ?? null,
            lessonTitle: lesson?.title ?? null,
            attemptId,
            prompt: value(query.prompt),
            tutorMode,
          }}
        />
      </div>
    </>
  );
}
