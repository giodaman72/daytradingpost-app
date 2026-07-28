import Link from "next/link";
import { Award, ExternalLink } from "lucide-react";
import type { AcademyCertificate } from "@/types/academy";
import { CertificateDownloadButton } from "./CertificateDownloadButton";
import { CertificateStatusBadge } from "./CertificateStatusBadge";

export function CertificateCard({
  certificate,
  verificationUrl,
}: {
  certificate: AcademyCertificate;
  verificationUrl: string;
}) {
  return (
    <article className="certificate-card">
      <div className="certificate-card-icon" aria-hidden="true">
        <Award />
      </div>
      <div className="certificate-card-heading">
        <CertificateStatusBadge status={certificate.status} />
        <p>{certificate.certificateNumber}</p>
      </div>
      <h2>{certificate.courseTitleSnapshot}</h2>
      <p>
        Issued{" "}
        {new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeZone: "UTC",
        }).format(new Date(certificate.issuedAt))}
      </p>
      <div className="certificate-card-actions">
        <Link
          className="button button-secondary"
          href={`/academy/certificates/${certificate.id}`}
        >
          View certificate
        </Link>
        <CertificateDownloadButton certificateId={certificate.id} />
        <a
          className="text-link"
          href={verificationUrl}
          rel="noreferrer"
          target="_blank"
        >
          Verify publicly
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
