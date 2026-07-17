import type { AssistantMessage as Message } from "@/types/ai-message";
import { AssistantMessage } from "./AssistantMessage";
import { AssistantEmptyState } from "./AssistantEmptyState";

export function AssistantConversation({
  messages,
  streamingId,
}: {
  messages: Message[];
  streamingId?: string | null;
}) {
  if (!messages.length) return <AssistantEmptyState />;
  return (
    <div
      className="assistant-conversation"
      role="log"
      aria-label="Assistant conversation"
    >
      {messages.map((message) => (
        <AssistantMessage
          message={message}
          streaming={message.id === streamingId}
          key={message.id}
        />
      ))}
    </div>
  );
}
