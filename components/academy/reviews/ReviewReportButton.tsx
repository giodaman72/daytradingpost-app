"use client";

import { useMemo, useState } from "react";
import { academyLessonText } from "@/lib/academy/academyLessonText";
import type { Locale } from "@/lib/i18n/config";

export function ReviewReportButton({
  locale = "en",
  reviewId,
}: {
  locale?: Locale;
  reviewId: string;
}) {
  const tr = useMemo(() => academyLessonText(locale), [locale]);
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
          ? tr("Report submitted for moderator review.")
          : locale === "es"
            ? tr("Report could not be submitted.")
            : (payload.message ?? "Report could not be submitted."),
      );
    } catch {
      setMessage(tr("Network error. Please try again."));
    } finally {
      setPending(false);
    }
  }

  return (
    <details className="academy-review-report">
      <summary>{tr("Report this review")}</summary>
      <form action={report}>
        <label>
          {tr("Reason")}
          <input maxLength={500} name="reason" required />
        </label>
        <button disabled={pending} type="submit">
          {pending ? tr("Submitting…") : tr("Submit report")}
        </button>
        <p aria-live="polite" role="status">
          {message}
        </p>
      </form>
    </details>
  );
}
