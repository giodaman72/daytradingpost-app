import type { AcademyCertificate } from "@/types/academy";
import { CertificateCard } from "./CertificateCard";
import { CertificateEmptyState } from "./CertificateEmptyState";

export function CertificateWallet({
  certificates,
  verificationUrls,
}: {
  certificates: AcademyCertificate[];
  verificationUrls: Record<string, string>;
}) {
  if (!certificates.length) return <CertificateEmptyState />;
  return (
    <div className="certificate-grid">
      {certificates.map((certificate) => (
        <CertificateCard
          certificate={certificate}
          key={certificate.id}
          verificationUrl={verificationUrls[certificate.id]}
        />
      ))}
    </div>
  );
}
