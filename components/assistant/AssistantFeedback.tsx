"use client";

import { useState } from "react";

export function AssistantFeedback({
  conversationId,
  messageId,
}: {
  conversationId: string;
  messageId: string;
}) {
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("helpful");
  const [comment, setComment] = useState("");
  async function send(rating: "positive" | "negative") {
    setStatus("Saving…");
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
    setStatus(response.ok ? "Feedback saved" : "Could not save feedback");
  }
  return (
    <div className="assistant-feedback" aria-label="Rate this answer">
      <span>Was this useful?</span>
      <label>
        <span className="sr-only">Feedback reason</span>
        <select
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          aria-label="Feedback reason"
        >
          <option value="helpful">Helpful</option>
          <option value="not_helpful">Not helpful</option>
          <option value="incorrect">Incorrect</option>
          <option value="outdated">Outdated</option>
          <option value="missing_citation">Missing citation</option>
          <option value="unsafe">Unsafe</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label>
        <span className="sr-only">Optional feedback comment</span>
        <input
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={500}
          placeholder="Optional comment"
          aria-label="Optional feedback comment"
        />
      </label>
      <button
        type="button"
        onClick={() => void send("positive")}
        aria-label="Mark answer helpful"
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => void send("negative")}
        aria-label="Mark answer not helpful"
      >
        No
      </button>
      <small role="status">{status}</small>
    </div>
  );
}
