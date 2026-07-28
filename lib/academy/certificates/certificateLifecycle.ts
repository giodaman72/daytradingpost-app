import type { AcademyCertificateStatus } from "@/types/academy";

export function canRevokeCertificate(input: {
  actorCanManageCertificates: boolean;
  confirmation: string;
  reason: string;
  status: AcademyCertificateStatus;
}) {
  const reasons: string[] = [];
  if (!input.actorCanManageCertificates) reasons.push("permission-required");
  if (input.confirmation !== "REVOKE") reasons.push("confirmation-required");
  if (input.reason.trim().length < 10) reasons.push("reason-required");
  if (input.status !== "issued") reasons.push("certificate-not-active");
  return { allowed: reasons.length === 0, reasons };
}

export function canReissueCertificate(input: {
  actorCanManageCertificates: boolean;
  confirmation: string;
  reason: string;
  status: AcademyCertificateStatus;
}) {
  const reasons: string[] = [];
  if (!input.actorCanManageCertificates) reasons.push("permission-required");
  if (input.confirmation !== "REISSUE") reasons.push("confirmation-required");
  if (input.reason.trim().length < 10) reasons.push("reason-required");
  if (input.status !== "revoked") reasons.push("certificate-not-revoked");
  return { allowed: reasons.length === 0, reasons };
}

export function publicCertificateStatus(
  status: AcademyCertificateStatus,
): "valid" | "revoked" | "superseded" {
  if (status === "issued") return "valid";
  return status;
}
