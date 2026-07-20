import { Download } from "lucide-react";

export function CertificateDownloadButton({
  certificateId,
}: {
  certificateId: string;
}) {
  return (
    <a
      className="button certificate-download"
      href={`/api/academy/certificates/${encodeURIComponent(
        certificateId,
      )}/download`}
    >
      <Download size={17} aria-hidden="true" />
      Download PDF
    </a>
  );
}
