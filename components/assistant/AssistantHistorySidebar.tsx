"use client";

import { academyLessonText } from "@/lib/academy/academyLessonText";
import type { Locale } from "@/lib/i18n/config";

import Link from "next/link";
import type { AssistantConversation } from "@/types/ai-assistant";

export function AssistantHistorySidebar({
  conversations,
  activeId,
  onNew,
  basePath = "/assistant",
  locale = "en",
}: {
  conversations: AssistantConversation[];
  activeId: string | null;
  onNew: () => void;
  basePath?: string;
  locale?: Locale;
}) {
  const tr = academyLessonText(locale);
  async function remove(id: string) {
    if (
      !window.confirm(
        tr("Delete this conversation and its messages permanently?"),
      )
    )
      return;
    const response = await fetch(`/api/assistant/conversations/${id}`, {
      method: "DELETE",
    });
    if (response.ok) window.location.assign(basePath);
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
    const title = window.prompt(tr("Conversation title"), currentTitle)?.trim();
    if (!title || title === currentTitle) return;
    await fetch(`/api/assistant/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    window.location.reload();
  }
  return (
    <aside
      className="assistant-history"
      aria-label={tr("Conversation history")}
    >
      <div>
        <span>{tr("Conversation history")}</span>
        <button type="button" onClick={onNew}>
          {tr("New")}
        </button>
      </div>
      {conversations.length ? (
        <ol>
          {conversations.map((conversation) => (
            <li
              data-active={conversation.id === activeId}
              key={conversation.id}
            >
              <Link
                href={`${basePath}${basePath.includes("?") ? "&" : "?"}conversation=${conversation.id}`}
              >
                <strong>{conversation.title}</strong>
                <small>{conversation.contextMode.replaceAll("_", " ")}</small>
              </Link>
              <div>
                <button
                  type="button"
                  aria-label={`${tr("Rename")} ${conversation.title}`}
                  onClick={() =>
                    void rename(conversation.id, conversation.title)
                  }
                >
                  {tr("Rename")}
                </button>
                {conversation.status === "active" ? (
                  <button
                    type="button"
                    aria-label={`${tr("Archive")} ${conversation.title}`}
                    onClick={() => void archive(conversation.id)}
                  >
                    {tr("Archive")}
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label={`${tr("Restore")} ${conversation.title}`}
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
                    {tr("Restore")}
                  </button>
                )}
                <button
                  type="button"
                  aria-label={`${tr("Delete")} ${conversation.title}`}
                  onClick={() => void remove(conversation.id)}
                >
                  {tr("Delete")}
                </button>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p>{tr("No saved conversations yet.")}</p>
      )}
    </aside>
  );
}
