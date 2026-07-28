import type { AssistantMessage as Message } from "@/types/ai-message";
import { AssistantCitationList } from "./AssistantCitationList";
import { AssistantContextBadge } from "./AssistantContextBadge";
import { AssistantFeedback } from "./AssistantFeedback";
import { AssistantCopyButton } from "./AssistantCopyButton";

export function AssistantMessage({
  message,
  streaming = false,
}: {
  message: Message;
  streaming?: boolean;
}) {
  return (
    <article
      className={`assistant-message assistant-message-${message.role}`}
      aria-live={streaming ? "polite" : undefined}
    >
      <header>
        <strong>
          {message.role === "assistant" ? "DTP AI Assistant" : "You"}
        </strong>
        <AssistantContextBadge mode={message.contextMode} />
        <time dateTime={message.createdAt}>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </header>
      <div className="assistant-message-copy">{message.content}</div>
      {message.role === "assistant" ? (
        <>
          <AssistantCitationList citations={message.citations} />
          {!streaming && !message.id.startsWith("temp-") ? (
            <div className="assistant-message-tools">
              <AssistantCopyButton text={message.content} />
              <AssistantFeedback
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
