"use client";

import { useState } from "react";
import type { AcademyInstructorReply } from "@/types/academy-admin";

export function InstructorReplyModerationQueue({
  initial,
}: {
  initial: AcademyInstructorReply[];
}) {
  const [replies, setReplies] = useState(initial);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function moderate(id: string, status: "published" | "rejected") {
    const reason = reasons[id]?.trim();
    if (!reason) {
      setMessage("Enter a moderation reason.");
      return;
    }
    setPendingId(id);
    try {
      const response = await fetch(
        `/api/admin/academy/review-replies/${id}/moderate`,
        {
          body: JSON.stringify({
            reason,
            requestId: crypto.randomUUID(),
            status,
          }),
          headers: { "content-type": "application/json" },
          method: "PATCH",
        },
      );
      if (response.ok) {
        setReplies((current) => current.filter((reply) => reply.id !== id));
        setMessage(`Instructor reply ${status}.`);
      } else setMessage("Reply moderation failed.");
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="academy-admin-panel">
      <h2>Pending instructor replies</h2>
      {replies.length ? (
        <ul className="academy-review-list moderation">
          {replies.map((reply) => (
            <li key={reply.id}>
              <p>{reply.replyText}</p>
              <label>
                Moderation reason
                <input
                  maxLength={500}
                  onChange={(event) =>
                    setReasons((current) => ({
                      ...current,
                      [reply.id]: event.target.value,
                    }))
                  }
                  value={reasons[reply.id] ?? ""}
                />
              </label>
              <div className="academy-review-actions">
                <button
                  className="button"
                  disabled={pendingId === reply.id}
                  onClick={() => moderate(reply.id, "published")}
                  type="button"
                >
                  Publish reply
                </button>
                <button
                  disabled={pendingId === reply.id}
                  onClick={() => moderate(reply.id, "rejected")}
                  type="button"
                >
                  Reject reply
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No instructor replies await moderation.</p>
      )}
      <p aria-live="polite" role="status">
        {message}
      </p>
    </section>
  );
}
