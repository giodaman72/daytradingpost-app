"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ASSISTANT_SUGGESTED_PROMPTS } from "@/constants/ai-assistant";
import { parseAssistantEventBuffer } from "@/lib/ai/streamParser";
import type {
  AssistantConversation,
  AssistantResponse,
} from "@/types/ai-assistant";
import type { AssistantContextMode } from "@/types/ai-context";
import type { AssistantMessage } from "@/types/ai-message";
import type { AssistantUsageSummary } from "@/types/ai-usage";
import { AssistantComposer } from "./AssistantComposer";
import { AssistantConversation as Conversation } from "./AssistantConversation";
import { AssistantDisclaimer } from "./AssistantDisclaimer";
import { AssistantErrorState } from "./AssistantErrorState";
import { AssistantHistorySidebar } from "./AssistantHistorySidebar";
import { AssistantSuggestedPrompts } from "./AssistantSuggestedPrompts";
import { AssistantUsageMeter } from "./AssistantUsageMeter";

type Context = {
  mode: AssistantContextMode;
  instrumentSlug?: string | null;
  articleSlug?: string | null;
  economicEventId?: string | null;
  watchlistId?: string | null;
  prompt?: string | null;
};

export function AssistantShell({
  initialConversations,
  initialMessages,
  initialConversationId,
  initialUsage,
  premium,
  initialContext,
}: {
  initialConversations: AssistantConversation[];
  initialMessages: AssistantMessage[];
  initialConversationId: string | null;
  initialUsage: AssistantUsageSummary;
  premium: boolean;
  initialContext: Context;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [usage, setUsage] = useState(initialUsage);
  const [mode, setMode] = useState(initialContext.mode);
  const [instrument, setInstrument] = useState(
    initialContext.instrumentSlug ?? "",
  );
  const [question, setQuestion] = useState(initialContext.prompt ?? "");
  const [error, setError] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  function startNew() {
    abortRef.current?.abort();
    setMessages([]);
    setConversationId(null);
    setError("");
    router.replace("/assistant");
  }

  async function submit() {
    const content = question.trim();
    if (!content || streaming) return;
    setQuestion("");
    setError("");
    setStreaming(true);
    const requestId = crypto.randomUUID();
    const now = new Date().toISOString();
    const userTemp: AssistantMessage = {
      id: `temp-user-${requestId}`,
      conversationId: conversationId ?? "",
      userId: "",
      role: "user",
      content,
      citations: [],
      contextMode: mode,
      model: null,
      provider: null,
      safetyFlags: [],
      createdAt: now,
    };
    const assistantTempId = `temp-assistant-${requestId}`;
    const assistantTemp: AssistantMessage = {
      ...userTemp,
      id: assistantTempId,
      role: "assistant",
      content: "",
    };
    setMessages((current) => [...current, userTemp, assistantTemp]);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          conversationId,
          message: content,
          contextMode: mode,
          instrumentSlug: instrument || null,
          articleSlug: initialContext.articleSlug,
          economicEventId: initialContext.economicEventId,
          watchlistId: initialContext.watchlistId,
          requestId,
        }),
      });
      if (!response.ok || !response.body) {
        const body = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(body?.message ?? "The assistant is unavailable.");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let complete: AssistantResponse | null = null;
      for (;;) {
        const chunk = await reader.read();
        buffer += decoder.decode(chunk.value, { stream: !chunk.done });
        const parsed = parseAssistantEventBuffer(buffer);
        buffer = parsed.remainder;
        for (const raw of parsed.events) {
          const item = raw as {
            type: string;
            text?: string;
            conversationId?: string;
            response?: AssistantResponse;
            message?: string;
          };
          if (item.type === "start" && item.conversationId) {
            setConversationId(item.conversationId);
            window.history.replaceState(
              null,
              "",
              `/assistant?conversation=${item.conversationId}`,
            );
          }
          if (item.type === "delta" && item.text)
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantTempId
                  ? { ...message, content: message.content + item.text }
                  : message,
              ),
            );
          if (item.type === "complete" && item.response)
            complete = item.response;
          if (item.type === "error")
            throw new Error(item.message ?? "The assistant is unavailable.");
        }
        if (chunk.done) break;
      }
      if (complete) {
        const completed = complete;
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantTempId
              ? {
                  id: completed.messageId,
                  conversationId: completed.conversationId,
                  userId: "",
                  role: "assistant",
                  content: completed.text,
                  citations: completed.citations,
                  contextMode: mode,
                  model: completed.model,
                  provider: completed.provider,
                  safetyFlags: completed.safetyFlags,
                  createdAt: completed.createdAt,
                }
              : message,
          ),
        );
        setUsage((current) => ({
          ...current,
          requestCount: current.requestCount + 1,
          remaining: Math.max(0, current.remaining - 1),
        }));
      }
    } catch (caught) {
      setMessages((current) =>
        current.filter(
          (message) =>
            message.id !== assistantTempId || Boolean(message.content.trim()),
        ),
      );
      if (controller.signal.aborted) {
        setError(
          "Generation stopped. Any partial response has been preserved.",
        );
      } else {
        setError(
          caught instanceof Error
            ? caught.message
            : "The assistant is unavailable.",
        );
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  return (
    <div className="assistant-shell">
      <AssistantHistorySidebar
        conversations={initialConversations}
        activeId={conversationId}
        onNew={startNew}
      />
      <section className="assistant-workspace">
        <div className="assistant-workspace-bar">
          <AssistantUsageMeter usage={usage} premium={premium} />
          <span
            className={premium ? "assistant-plan premium" : "assistant-plan"}
          >
            {premium ? "Premium context enabled" : "Public context"}
          </span>
        </div>
        <Conversation
          messages={messages}
          streamingId={streaming ? messages.at(-1)?.id : null}
        />
        {error ? <AssistantErrorState message={error} /> : null}
        <AssistantSuggestedPrompts
          prompts={ASSISTANT_SUGGESTED_PROMPTS}
          onSelect={setQuestion}
          disabled={streaming}
        />
        <AssistantComposer
          value={question}
          mode={mode}
          instrument={instrument}
          disabled={streaming || usage.remaining <= 0}
          streaming={streaming}
          onValue={setQuestion}
          onMode={setMode}
          onInstrument={setInstrument}
          onSubmit={() => void submit()}
          onStop={() => abortRef.current?.abort()}
        />
        <AssistantDisclaimer />
      </section>
    </div>
  );
}
