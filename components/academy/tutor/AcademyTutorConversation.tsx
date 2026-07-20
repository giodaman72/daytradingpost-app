import type { AssistantMessage } from "@/types/ai-message";
import { AcademyTutorEmptyState } from "./AcademyTutorEmptyState";
import { AcademyTutorMessage } from "./AcademyTutorMessage";

export function AcademyTutorConversation({
  messages,
  streamingId,
  courseTitle,
  lessonTitle,
}: {
  messages: AssistantMessage[];
  streamingId?: string | null;
  courseTitle?: string | null;
  lessonTitle?: string | null;
}) {
  if (!messages.length)
    return <AcademyTutorEmptyState lessonTitle={lessonTitle} />;
  return (
    <div
      className="assistant-conversation"
      role="log"
      aria-label="Academy Tutor conversation"
    >
      {messages.map((message) => (
        <AcademyTutorMessage
          key={message.id}
          message={message}
          streaming={message.id === streamingId}
          courseTitle={courseTitle}
          lessonTitle={lessonTitle}
        />
      ))}
    </div>
  );
}
