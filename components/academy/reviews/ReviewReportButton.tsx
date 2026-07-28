"use client";

import { useState } from "react";

export function ReviewReportButton({ reviewId }: { reviewId: string }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function report(formData: FormData) {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(`/api/academy/reviews/${reviewId}/report`, {
        body: JSON.stringify({ reason: formData.get("reason") }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as { message?: string };
      setMessage(
        response.ok
          ? "Report submitted for moderator review."
          : (payload.message ?? "Report could not be submitted."),
      );
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <details className="academy-review-report">
      <summary>Report this review</summary>
      <form action={report}>
        <label>
          Reason
          <input maxLength={500} name="reason" required />
        </label>
        <button disabled={pending} type="submit">
          {pending ? "Submitting…" : "Submit report"}
        </button>
        <p aria-live="polite" role="status">
          {message}
        </p>
      </form>
    </details>
  );
}
