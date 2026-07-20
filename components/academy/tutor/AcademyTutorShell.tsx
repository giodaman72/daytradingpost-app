"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AssistantHistorySidebar } from "@/components/assistant/AssistantHistorySidebar";
import { parseAssistantEventBuffer } from "@/lib/ai/streamParser";
import type {
  AcademyTutorMode,
  AssistantConversation,
  AssistantResponse,
} from "@/types/ai-assistant";
import type { AssistantMessage } from "@/types/ai-message";
import type { AssistantUsageSummary } from "@/types/ai-usage";
import { AcademyTutorComposer } from "./AcademyTutorComposer";
import { AcademyTutorConversation } from "./AcademyTutorConversation";
import { AcademyTutorDisclaimer } from "./AcademyTutorDisclaimer";
import { AcademyTutorErrorState } from "./AcademyTutorErrorState";
import { AcademyTutorSuggestedPrompts } from "./AcademyTutorSuggestedPrompts";
import { AcademyTutorUsageMeter } from "./AcademyTutorUsageMeter";

export type AcademyTutorInitialContext = {
  courseSlug?: string | null;
  courseTitle?: string | null;
  lessonSlug?: string | null;
  lessonTitle?: string | null;
  attemptId?: string | null;
  prompt?: string | null;
  tutorMode: AcademyTutorMode;
};

const SUGGESTED_PROMPTS = [
  "Explain the key ideas in this lesson.",
  "Simplify this concept with an educational example.",
  "Give me three AI-generated review questions.",
  "Create a study checklist for this topic.",
  "What educational topic should I study next?",
] as const;

export function AcademyTutorShell({
  initialConversations,
  initialMessages,
  initialConversationId,
  initialUsage,
  premium,
  initialContext,
  basePath,
}: {
  initialConversations: AssistantConversation[];
  initialMessages: AssistantMessage[];
  initialConversationId: string | null;
  initialUsage: AssistantUsageSummary;
  premium: boolean;
  initialContext: AcademyTutorInitialContext;
  basePath: string;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [usage, setUsage] = useState(initialUsage);
  const [question, setQuestion] = useState(initialContext.prompt ?? "");
  const [tutorMode, setTutorMode] = useState(initialContext.tutorMode);
  const [error, setError] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  function startNew() {
    abortRef.current?.abort();
    setMessages([]);
    setConversationId(null);
    setError("");
    router.replace(basePath);
  }

  async function submit() {
    const content = question.trim();
    if (!content || streaming) return;
    setQuestion("");
    setError("");
    setStreaming(true);
    const requestId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const temporaryUser: AssistantMessage = {
      id: `temp-user-${requestId}`,
      conversationId: conversationId ?? "",
      userId: "",
      role: "user",
      content,
      citations: [],
      contextMode: "academy_tutor",
      model: null,
      provider: null,
      safetyFlags: [],
      createdAt,
    };
    const assistantId = `temp-assistant-${requestId}`;
    setMessages((current) => [
      ...current,
      temporaryUser,
      { ...temporaryUser, id: assistantId, role: "assistant", content: "" },
    ]);
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
          contextMode: "academy_tutor",
          academyCourseSlug: initialContext.courseSlug ?? null,
          academyLessonSlug: initialContext.lessonSlug ?? null,
          academyAttemptId: initialContext.attemptId ?? null,
          academyTutorMode: tutorMode,
          requestId,
        }),
      });
      if (!response.ok || !response.body) {
        const body = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(body?.message ?? "The Academy Tutor is unavailable.");
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
              `${basePath}${basePath.includes("?") ? "&" : "?"}conversation=${item.conversationId}`,
            );
          }
          if (item.type === "delta" && item.text)
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? { ...message, content: message.content + item.text }
                  : message,
              ),
            );
          if (item.type === "complete" && item.response)
            complete = item.response;
          if (item.type === "error")
            throw new Error(
              item.message ?? "The Academy Tutor is unavailable.",
            );
        }
        if (chunk.done) break;
      }
      if (complete) {
        const completed = complete;
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? {
                  ...message,
                  id: completed.messageId,
                  conversationId: completed.conversationId,
                  content: completed.text,
                  citations: completed.citations,
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
            message.id !== assistantId || Boolean(message.content.trim()),
        ),
      );
      setError(
        controller.signal.aborted
          ? "Generation stopped. Any partial response has been preserved."
          : caught instanceof Error
            ? caught.message
            : "The Academy Tutor is unavailable.",
      );
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  return (
    <div className="assistant-shell academy-tutor-shell">
      <AssistantHistorySidebar
        conversations={initialConversations}
        activeId={conversationId}
        onNew={startNew}
        basePath={basePath}
      />
      <section className="assistant-workspace">
        <div className="assistant-workspace-bar">
          <AcademyTutorUsageMeter usage={usage} premium={premium} />
          <span
            className={premium ? "assistant-plan premium" : "assistant-plan"}
          >
            {initialContext.lessonTitle
              ? `Lesson context: ${initialContext.lessonTitle}`
              : "Published Academy context"}
          </span>
        </div>
        <AcademyTutorConversation
          messages={messages}
          streamingId={streaming ? messages.at(-1)?.id : null}
          courseTitle={initialContext.courseTitle}
          lessonTitle={initialContext.lessonTitle}
        />
        {error ? <AcademyTutorErrorState message={error} /> : null}
        <AcademyTutorSuggestedPrompts
          prompts={SUGGESTED_PROMPTS}
          onSelect={setQuestion}
          disabled={streaming}
        />
        <AcademyTutorComposer
          value={question}
          tutorMode={tutorMode}
          disabled={streaming || usage.remaining <= 0}
          streaming={streaming}
          onValue={setQuestion}
          onTutorMode={setTutorMode}
          onSubmit={() => void submit()}
          onStop={() => abortRef.current?.abort()}
        />
        <AcademyTutorDisclaimer />
      </section>
    </div>
  );
}
