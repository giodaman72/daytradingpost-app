"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Award } from "lucide-react";

export function CertificateIssueButton({
  enrollmentId,
}: {
  enrollmentId: string;
}) {
  const router = useRouter();
  const idempotencyKey = useRef<string | null>(null);
  const [state, setState] = useState<
    { message: string; type: "error" | "success" } | undefined
  >();
  const [loading, setLoading] = useState(false);

  async function issue() {
    setLoading(true);
    setState(undefined);
    idempotencyKey.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/academy/certificates", {
        body: JSON.stringify({
          enrollmentId,
          idempotencyKey: idempotencyKey.current,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as {
        data?: { id: string };
        message?: string;
      };
      if (!response.ok || !result.data)
        throw new Error(result.message || "Certificate could not be issued.");
      setState({
        message: "Certificate issued. Opening your certificate…",
        type: "success",
      });
      router.push(`/academy/certificates/${result.data.id}`);
      router.refresh();
    } catch (error) {
      setState({
        message:
          error instanceof Error
            ? error.message
            : "Certificate could not be issued.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="certificate-issue-action">
      <button
        className="button"
        disabled={loading}
        onClick={issue}
        type="button"
      >
        <Award size={17} aria-hidden="true" />
        {loading ? "Checking eligibility…" : "Issue certificate"}
      </button>
      {state ? (
        <p className={`form-message ${state.type}`} role="status">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
