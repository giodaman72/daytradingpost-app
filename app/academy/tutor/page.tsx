import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AcademyTutorShell } from "@/components/academy/tutor/AcademyTutorShell";
import { filterAuthorizedTutorMessages } from "@/lib/academy/ai/academyTutorMessages";
import { requireAssistantAccess } from "@/lib/ai/assistantAuthorization";
import { listConversations, listMessages } from "@/lib/ai/assistantRepository";
import { getAssistantUsage } from "@/lib/ai/assistantUsage";
import {
  ACADEMY_TUTOR_MODES,
  type AcademyTutorMode,
} from "@/types/ai-assistant";

export const metadata: Metadata = {
  title: "Academy AI Tutor",
  description:
    "Study published DayTradingPost Academy material with source-grounded educational AI support.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const value = (input: string | string[] | undefined) =>
  typeof input === "string" ? input : null;

export default async function AcademyTutorPage({ searchParams }: Props) {
  let access;
  try {
    access = await requireAssistantAccess();
  } catch {
    redirect("/login?next=/academy/tutor");
  }
  const params = await searchParams;
  const conversationId = value(params.conversation);
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
      )
    : [];
  const requestedMode = value(params.action) as AcademyTutorMode | null;
  const tutorMode =
    requestedMode && ACADEMY_TUTOR_MODES.includes(requestedMode)
      ? requestedMode
      : "lesson_question";
  const usage = await getAssistantUsage(access.userId, access.hasPremiumAccess);

  return (
    <>
      <section className="assistant-hero">
        <div className="container">
          <span className="section-kicker">
            Source-grounded learning support
          </span>
          <h1>Academy AI Tutor</h1>
          <p>
            Ask educational questions across authorized, published Academy
            material. Select a course lesson for the most precise context.
          </p>
        </div>
      </section>
      <div className="container">
        <AcademyTutorShell
          initialConversations={conversations}
          initialMessages={messages}
          initialConversationId={active?.id ?? null}
          initialUsage={usage}
          premium={access.hasPremiumAccess}
          basePath="/academy/tutor"
          initialContext={{
            prompt: value(params.prompt),
            tutorMode,
          }}
        />
      </div>
    </>
  );
}
