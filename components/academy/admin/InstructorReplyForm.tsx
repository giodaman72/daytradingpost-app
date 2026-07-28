"use client";

import { useState } from "react";

export function InstructorReplyForm({
  existing,
  reviewId,
}: {
  existing?: { replyText: string; status: string } | null;
  reviewId: string;
}) {
  const [replyText, setReplyText] = useState(existing?.replyText ?? "");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(
        `/api/instructor/academy/reviews/${reviewId}/reply`,
        {
          body: JSON.stringify({ replyText }),
          headers: { "content-type": "application/json" },
          method: "POST",
        },
      );
      const payload = (await response.json()) as { message?: string };
      setMessage(
        response.ok
          ? "Reply submitted for moderation."
          : (payload.message ?? "Reply could not be saved."),
      );
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="academy-instructor-reply-form" onSubmit={submit}>
      {existing ? <p>Current reply status: {existing.status}</p> : null}
      <label>
        Instructor response
        <textarea
          maxLength={1000}
          onChange={(event) => setReplyText(event.target.value)}
          required
          rows={4}
          value={replyText}
        />
      </label>
      <button disabled={pending} type="submit">
        {pending ? "Saving…" : existing ? "Update reply" : "Submit reply"}
      </button>
      <p aria-live="polite" role="status">
        {message}
      </p>
    </form>
  );
}
