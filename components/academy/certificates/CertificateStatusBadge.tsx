import type { AcademyCertificateStatus } from "@/types/academy";

const labels: Record<AcademyCertificateStatus, string> = {
  issued: "Verified",
  revoked: "Revoked",
  superseded: "Superseded",
};

export function CertificateStatusBadge({
  status,
}: {
  status: AcademyCertificateStatus;
}) {
  return (
    <span
      className={`certificate-status certificate-status-${status}`}
      aria-label={`Certificate status: ${labels[status]}`}
    >
      {labels[status]}
    </span>
  );
}
