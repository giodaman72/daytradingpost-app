"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CertificateAdminActions({
  certificateId,
  status,
}: {
  certificateId: string;
  status: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  if (status !== "issued" && status !== "revoked")
    return <span>No lifecycle action available</span>;

  async function submitAction(
    action: "reissue" | "revoke",
    formData: FormData,
  ) {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(
        `/api/admin/academy/certificates/${certificateId}/${action}`,
        {
          body: JSON.stringify({
            confirmation: formData.get("confirmation"),
            reason: formData.get("reason"),
            requestId: crypto.randomUUID(),
          }),
          headers: { "content-type": "application/json" },
          method: "POST",
        },
      );
      const payload = (await response.json()) as { message?: string };
      setMessage(
        response.ok
          ? `Certificate ${action === "revoke" ? "revoked" : "reissued"}.`
          : (payload.message ??
              `Certificate ${action === "revoke" ? "revocation" : "reissue"} was rejected.`),
      );
      if (response.ok) router.refresh();
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const action = status === "issued" ? "revoke" : "reissue";
  const confirmation = action === "revoke" ? "REVOKE" : "REISSUE";
  const label = action === "revoke" ? "Revoke" : "Reissue";

  return (
    <details>
      <summary>{label}</summary>
      <form
        action={(formData) => submitAction(action, formData)}
        className="academy-enrollment-admin-form"
      >
        <label>
          Reason
          <input maxLength={500} name="reason" required />
        </label>
        <label>
          Confirmation
          <input name="confirmation" placeholder={confirmation} required />
        </label>
        <button disabled={pending} type="submit">
          {pending ? `${label.slice(0, -1)}ing…` : `${label} certificate`}
        </button>
        <p aria-live="polite" role="status">
          {message}
        </p>
      </form>
    </details>
  );
}
