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
}: {
  message: AssistantMessage;
  streaming?: boolean;
  courseTitle?: string | null;
  lessonTitle?: string | null;
}) {
  return (
    <article
      className={`assistant-message assistant-message-${message.role}`}
      aria-live={streaming ? "polite" : undefined}
    >
      <header>
        <strong>
          {message.role === "assistant" ? "DTP Academy Tutor" : "You"}
        </strong>
        <AcademyTutorContextBadge
          courseTitle={courseTitle}
          lessonTitle={lessonTitle}
        />
        <time dateTime={message.createdAt}>
          {new Date(message.createdAt).toISOString().slice(11, 16)} UTC
        </time>
      </header>
      <div className="assistant-message-copy">{message.content}</div>
      {message.role === "assistant" ? (
        <>
          <AcademyTutorCitationList citations={message.citations} />
          {!streaming && !message.id.startsWith("temp-") ? (
            <div className="assistant-message-tools">
              <AssistantCopyButton text={message.content} />
              <AcademyTutorFeedback
                conversationId={message.conversationId}
                messageId={message.id}
              />
            </div>
          ) : null}
        </>
      ) : null}
    </article>
  );
}
