import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CertificateDocument } from "@/components/academy/certificates/CertificateDocument";
import { CertificateDownloadButton } from "@/components/academy/certificates/CertificateDownloadButton";
import { CertificateShareDialog } from "@/components/academy/certificates/CertificateShareDialog";
import { AcademyError } from "@/lib/academy/academyErrors";
import {
  getCertificateVerificationUrl,
  getOwnedCertificate,
} from "@/lib/academy/certificates/certificateService";
import { createCertificateQrDataUrl } from "@/lib/academy/certificates/certificatePdf";
import { buildCertificateShareLinks } from "@/lib/academy/certificates/certificateShare";

export const metadata: Metadata = {
  title: "Academy Certificate",
  description: "View a private DayTradingPost Academy completion certificate.",
  robots: { follow: false, index: false },
};

export const dynamic = "force-dynamic";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const { certificateId } = await params;
  let certificate;
  try {
    certificate = await getOwnedCertificate(certificateId);
  } catch (error) {
    if (
      error instanceof AcademyError &&
      error.code === "ACADEMY_UNAUTHENTICATED"
    )
      redirect(
        `/login?next=${encodeURIComponent(
          `/academy/certificates/${certificateId}`,
        )}`,
      );
    if (
      error instanceof AcademyError &&
      (error.code === "ACADEMY_FORBIDDEN" ||
        error.code === "ACADEMY_VALIDATION_FAILED")
    )
      notFound();
    throw error;
  }
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ||
    (host?.startsWith("localhost") ? "http" : "https");
  const verificationUrl = getCertificateVerificationUrl(
    certificate,
    host ? `${protocol}://${host}` : undefined,
  );
  const [qrDataUrl, shareLinks] = await Promise.all([
    createCertificateQrDataUrl(verificationUrl),
    Promise.resolve(buildCertificateShareLinks(verificationUrl)),
  ]);

  return (
    <div className="certificate-detail-page">
      <header className="certificate-detail-header container">
        <div>
          <span className="section-kicker">Private certificate view</span>
          <h2>{certificate.courseTitleSnapshot}</h2>
        </div>
        <div>
          <Link
            className="button button-secondary"
            href="/dashboard/learning/certificates"
          >
            Back to wallet
          </Link>
          <CertificateDownloadButton certificateId={certificate.id} />
          <CertificateShareDialog
            linkedinUrl={shareLinks.linkedin}
            verificationUrl={verificationUrl}
            xUrl={shareLinks.x}
          />
        </div>
      </header>
      <div className="container">
        <CertificateDocument
          certificate={certificate}
          qrDataUrl={qrDataUrl}
          verificationUrl={verificationUrl}
        />
      </div>
    </div>
  );
}
