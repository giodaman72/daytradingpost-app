import { academyLessonText } from "@/lib/academy/academyLessonText";
import type { Locale } from "@/lib/i18n/config";
import type { AssistantMessage } from "@/types/ai-message";
import { AcademyTutorEmptyState } from "./AcademyTutorEmptyState";
import { AcademyTutorMessage } from "./AcademyTutorMessage";

export function AcademyTutorConversation({
  messages,
  streamingId,
  courseTitle,
  lessonTitle,
  locale = "en",
}: {
  messages: AssistantMessage[];
  streamingId?: string | null;
  courseTitle?: string | null;
  lessonTitle?: string | null;
  locale?: Locale;
}) {
  const tr = academyLessonText(locale);
  if (!messages.length)
    return <AcademyTutorEmptyState lessonTitle={lessonTitle} locale={locale} />;
  return (
    <div
      className="assistant-conversation"
      role="log"
      aria-label={tr("Academy Tutor conversation")}
    >
      {messages.map((message) => (
        <AcademyTutorMessage
          key={message.id}
          message={message}
          streaming={message.id === streamingId}
          courseTitle={courseTitle}
          lessonTitle={lessonTitle}
          locale={locale}
        />
      ))}
    </div>
  );
}
