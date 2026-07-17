"use client";

import Link from "next/link";
import type { AssistantConversation } from "@/types/ai-assistant";

export function AssistantHistorySidebar({
  conversations,
  activeId,
  onNew,
}: {
  conversations: AssistantConversation[];
  activeId: string | null;
  onNew: () => void;
}) {
  async function remove(id: string) {
    if (
      !window.confirm("Delete this conversation and its messages permanently?")
    )
      return;
    const response = await fetch(`/api/assistant/conversations/${id}`, {
      method: "DELETE",
    });
    if (response.ok) window.location.assign("/assistant");
  }
  async function archive(id: string) {
    await fetch(`/api/assistant/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
    window.location.reload();
  }
  async function rename(id: string, currentTitle: string) {
    const title = window.prompt("Conversation title", currentTitle)?.trim();
    if (!title || title === currentTitle) return;
    await fetch(`/api/assistant/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    window.location.reload();
  }
  return (
    <aside className="assistant-history" aria-label="Conversation history">
      <div>
        <span>Conversation history</span>
        <button type="button" onClick={onNew}>
          New
        </button>
      </div>
      {conversations.length ? (
        <ol>
          {conversations.map((conversation) => (
            <li
              data-active={conversation.id === activeId}
              key={conversation.id}
            >
              <Link href={`/assistant?conversation=${conversation.id}`}>
                <strong>{conversation.title}</strong>
                <small>{conversation.contextMode.replaceAll("_", " ")}</small>
              </Link>
              <div>
                <button
                  type="button"
                  aria-label={`Rename ${conversation.title}`}
                  onClick={() =>
                    void rename(conversation.id, conversation.title)
                  }
                >
                  Rename
                </button>
                {conversation.status === "active" ? (
                  <button
                    type="button"
                    aria-label={`Archive ${conversation.title}`}
                    onClick={() => void archive(conversation.id)}
                  >
                    Archive
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label={`Restore ${conversation.title}`}
                    onClick={() =>
                      void fetch(
                        `/api/assistant/conversations/${conversation.id}`,
                        {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: "active" }),
                        },
                      ).then(() => window.location.reload())
                    }
                  >
                    Restore
                  </button>
                )}
                <button
                  type="button"
                  aria-label={`Delete ${conversation.title}`}
                  onClick={() => void remove(conversation.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p>No saved conversations yet.</p>
      )}
    </aside>
  );
}
