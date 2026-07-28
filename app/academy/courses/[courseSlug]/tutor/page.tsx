import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AcademyTutorShell } from "@/components/academy/tutor/AcademyTutorShell";
import { AcademyError } from "@/lib/academy/academyErrors";
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
  const { courseSlug } = await params;
  return {
    title: "Course AI Tutor",
    description: "Private, source-grounded AI Tutor for an Academy course.",
    alternates: { canonical: `/academy/courses/${courseSlug}/tutor` },
    robots: { index: false, follow: false },
  };
}

const value = (input: string | string[] | undefined) =>
  typeof input === "string" ? input : null;

export default async function CourseTutorPage({ params, searchParams }: Props) {
  const { courseSlug } = await params;
  const query = await searchParams;
  const lessonSlug = value(query.lesson);
  const attemptId = value(query.attempt);
  let access;
  try {
    access = await requireAssistantAccess();
  } catch {
    redirect(
      `/login?next=${encodeURIComponent(`/academy/courses/${courseSlug}/tutor`)}`,
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
        redirect(`/academy/courses/${courseSlug}`);
      if (error.code === "ACADEMY_PREMIUM_REQUIRED") redirect("/premium");
    }
    throw error;
  }
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
  const basePath = `/academy/courses/${course.slug}/tutor${
    lesson ? `?lesson=${encodeURIComponent(lesson.slug)}` : ""
  }`;

  return (
    <>
      <section className="assistant-hero">
        <div className="container">
          <span className="section-kicker">Private Academy workspace</span>
          <h1>{lesson ? `${lesson.title} Tutor` : `${course.title} Tutor`}</h1>
          <p>
            Context is limited to content your account can access. Private
            notes, answer keys, drafts, and other learners are excluded.
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
