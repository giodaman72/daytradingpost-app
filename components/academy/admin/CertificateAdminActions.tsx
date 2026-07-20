"use client";

import { useState } from "react";

export function CertificateAdminActions({
  certificateId,
  status,
}: {
  certificateId: string;
  status: string;
}) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  if (status !== "issued") return <span>No lifecycle action available</span>;

  async function revoke(formData: FormData) {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(
        `/api/admin/academy/certificates/${certificateId}/revoke`,
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
          ? "Certificate revoked. Refresh to view the updated status."
          : (payload.message ?? "Revocation was rejected."),
      );
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <details>
      <summary>Revoke</summary>
      <form action={revoke} className="academy-enrollment-admin-form">
        <label>
          Reason
          <input maxLength={500} name="reason" required />
        </label>
        <label>
          Confirmation
          <input name="confirmation" placeholder="REVOKE" required />
        </label>
        <button disabled={pending} type="submit">
          {pending ? "Revoking…" : "Revoke certificate"}
        </button>
        <p aria-live="polite" role="status">
          {message}
        </p>
      </form>
    </details>
  );
}
