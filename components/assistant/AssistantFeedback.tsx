"use client";

import { academyLessonText } from "@/lib/academy/academyLessonText";
import type { Locale } from "@/lib/i18n/config";

import { useState } from "react";

export function AssistantFeedback({
  conversationId,
  messageId,
  locale = "en",
}: {
  conversationId: string;
  messageId: string;
  locale?: Locale;
}) {
  const tr = academyLessonText(locale);
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("helpful");
  const [comment, setComment] = useState("");
  async function send(rating: "positive" | "negative") {
    setStatus(tr("Saving…"));
    const response = await fetch("/api/assistant/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        messageId,
        rating,
        reason:
          rating === "negative" && reason === "helpful"
            ? "not_helpful"
            : reason,
        comment,
      }),
    });
    setStatus(
      response.ok ? tr("Feedback saved") : tr("Could not save feedback"),
    );
  }
  return (
    <div className="assistant-feedback" aria-label={tr("Rate this answer")}>
      <span>{tr("Was this useful?")}</span>
      <label>
        <span className="sr-only">{tr("Feedback reason")}</span>
        <select
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          aria-label={tr("Feedback reason")}
        >
          <option value="helpful">{tr("Helpful")}</option>
          <option value="not_helpful">{tr("Not helpful")}</option>
          <option value="incorrect">{tr("Incorrect")}</option>
          <option value="outdated">{tr("Outdated")}</option>
          <option value="missing_citation">{tr("Missing citation")}</option>
          <option value="unsafe">{tr("Unsafe")}</option>
          <option value="other">{tr("Other")}</option>
        </select>
      </label>
      <label>
        <span className="sr-only">{tr("Optional feedback comment")}</span>
        <input
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={500}
          placeholder={tr("Optional comment")}
          aria-label={tr("Optional feedback comment")}
        />
      </label>
      <button
        type="button"
        onClick={() => void send("positive")}
        aria-label={tr("Mark answer helpful")}
      >
        {tr("Yes")}
      </button>
      <button
        type="button"
        onClick={() => void send("negative")}
        aria-label={tr("Mark answer not helpful")}
      >
        {tr("No")}
      </button>
      <small role="status">{status}</small>
    </div>
  );
}
