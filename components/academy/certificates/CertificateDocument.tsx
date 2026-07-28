import Image from "next/image";
import type { AcademyCertificate } from "@/types/academy";
import { CertificateStatusBadge } from "./CertificateStatusBadge";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function CertificateDocument({
  certificate,
  qrDataUrl,
  verificationUrl,
}: {
  certificate: AcademyCertificate;
  qrDataUrl: string;
  verificationUrl: string;
}) {
  return (
    <article className="certificate-document">
      <div className="certificate-document-frame">
        <div className="certificate-document-brand" aria-label="DayTradingPost">
          <span>DTP</span>
          <strong>DayTradingPost Academy</strong>
        </div>
        <CertificateStatusBadge status={certificate.status} />
        <p className="certificate-overline">Certificate of course completion</p>
        <p className="certificate-presented">
          This certificate is presented to
        </p>
        <h1>{certificate.learnerDisplayName}</h1>
        <p className="certificate-completed">for verified completion of</p>
        <h2>{certificate.courseTitleSnapshot}</h2>
        <dl className="certificate-facts">
          <div>
            <dt>Completed</dt>
            <dd>{formatDate(certificate.completionDate)}</dd>
          </div>
          <div>
            <dt>Issued</dt>
            <dd>{formatDate(certificate.issuedAt)}</dd>
          </div>
          <div>
            <dt>Certificate number</dt>
            <dd>{certificate.certificateNumber}</dd>
          </div>
          {certificate.instructorNameSnapshot ? (
            <div>
              <dt>Instructor</dt>
              <dd>{certificate.instructorNameSnapshot}</dd>
            </div>
          ) : null}
        </dl>
        <div className="certificate-verification-block">
          <Image
            alt="QR code linking to the public certificate verification page"
            height={128}
            src={qrDataUrl}
            unoptimized
            width={128}
          />
          <div>
            <strong>Public verification</strong>
            <p>Scan the code or use the text link.</p>
            <a href={verificationUrl}>{verificationUrl}</a>
          </div>
        </div>
        {certificate.status === "revoked" ? (
          <p className="certificate-revocation-notice" role="status">
            This certificate was revoked. The public verification record
            reflects its current status.
          </p>
        ) : null}
        <p className="certificate-disclaimer">
          This confirms completion of DayTradingPost educational content only.
          It is not an accredited qualification, professional license, or
          financial advice.
        </p>
      </div>
    </article>
  );
}
