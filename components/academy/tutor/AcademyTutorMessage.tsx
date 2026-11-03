import { academyLessonText } from "@/lib/academy/academyLessonText";
import type { Locale } from "@/lib/i18n/config";
import { AssistantCopyButton } from "@/components/assistant/AssistantCopyButton";
import type { AssistantMessage } from "@/types/ai-message";
import { AcademyTutorCitationList } from "./AcademyTutorCitationList";
import { AcademyTutorContextBadge } from "./AcademyTutorContextBadge";
import { AcademyTutorFeedback } from "./AcademyTutorFeedback";

export function AcademyTutorMessage({
  message,
  streaming,
  courseTitle,
  lessonTitle,
  locale = "en",
}: {
  message: AssistantMessage;
  streaming?: boolean;
  courseTitle?: string | null;
  lessonTitle?: string | null;
  locale?: Locale;
}) {
  const tr = academyLessonText(locale);
  return (
    <article
      className={`assistant-message assistant-message-${message.role}`}
      aria-live={streaming ? "polite" : undefined}
    >
      <header>
        <strong>
          {message.role === "assistant" ? tr("DTP Academy Tutor") : tr("You")}
        </strong>
        <AcademyTutorContextBadge
          courseTitle={courseTitle}
          lessonTitle={lessonTitle}
          locale={locale}
        />
        <time dateTime={message.createdAt}>
          {new Date(message.createdAt).toISOString().slice(11, 16)} UTC
        </time>
      </header>
      <div className="assistant-message-copy">{message.content}</div>
      {message.role === "assistant" ? (
        <>
          <AcademyTutorCitationList
            citations={message.citations}
            locale={locale}
          />
          {!streaming && !message.id.startsWith("temp-") ? (
            <div className="assistant-message-tools">
              <AssistantCopyButton text={message.content} locale={locale} />
              <AcademyTutorFeedback
                conversationId={message.conversationId}
                messageId={message.id}
                locale={locale}
              />
            </div>
          ) : null}
        </>
      ) : null}
    </article>
  );
}
