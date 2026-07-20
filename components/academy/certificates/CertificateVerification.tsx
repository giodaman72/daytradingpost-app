import { BadgeCheck, BadgeX, ShieldCheck } from "lucide-react";
import type { AcademyCertificateVerification as Verification } from "@/types/academy";
import { CertificateStatusBadge } from "./CertificateStatusBadge";

function date(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function CertificateVerification({
  verification,
}: {
  verification: Verification | null;
}) {
  if (!verification) {
    return (
      <section className="certificate-verification invalid" role="status">
        <BadgeX size={42} aria-hidden="true" />
        <span className="section-kicker">Verification result</span>
        <h1>Certificate not verified</h1>
        <p>
          This verification code is invalid or does not match an issued
          DayTradingPost Academy certificate.
        </p>
      </section>
    );
  }

  const Icon = verification.valid ? BadgeCheck : BadgeX;
  return (
    <section
      className={`certificate-verification ${
        verification.valid ? "valid" : "invalid"
      }`}
      role="status"
    >
      <Icon size={42} aria-hidden="true" />
      <span className="section-kicker">Verification result</span>
      <h1>
        {verification.valid
          ? "Certificate verified"
          : `Certificate ${verification.status}`}
      </h1>
      <CertificateStatusBadge status={verification.status} />
      <dl>
        <div>
          <dt>Learner</dt>
          <dd>{verification.learnerDisplayName}</dd>
        </div>
        <div>
          <dt>Course</dt>
          <dd>{verification.courseTitle}</dd>
        </div>
        <div>
          <dt>Completed</dt>
          <dd>{date(verification.completionDate)}</dd>
        </div>
        <div>
          <dt>Issued</dt>
          <dd>{date(verification.issuedAt)}</dd>
        </div>
        <div>
          <dt>Certificate number</dt>
          <dd>{verification.certificateNumber}</dd>
        </div>
        {verification.instructorName ? (
          <div>
            <dt>Instructor</dt>
            <dd>{verification.instructorName}</dd>
          </div>
        ) : null}
      </dl>
      <p className="certificate-verification-privacy">
        <ShieldCheck size={17} aria-hidden="true" />
        This public record includes completion information only. No account,
        assessment-response, payment, or contact data is displayed.
      </p>
    </section>
  );
}
