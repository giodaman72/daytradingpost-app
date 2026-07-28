import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CertificateIssueButton } from "@/components/academy/certificates/CertificateIssueButton";
import { CertificateWallet } from "@/components/academy/certificates/CertificateWallet";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AcademyError } from "@/lib/academy/academyErrors";
import {
  getCertificateVerificationUrl,
  getCertificateWallet,
} from "@/lib/academy/certificates/certificateService";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Certificate Wallet",
  description:
    "Review, download, share and publicly verify your DayTradingPost Academy course completion certificates.",
  robots: { follow: false, index: false },
};

export const dynamic = "force-dynamic";

function pageNumber(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

async function requestOrigin() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ||
    (host?.startsWith("localhost") ? "http" : "https");
  return host ? `${protocol}://${host}` : undefined;
}

export default async function CertificateWalletPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  if (!isSupabaseAuthConfigured())
    redirect("/login?next=/dashboard/learning/certificates");
  const page = pageNumber((await searchParams).page);
  const limit = 12;
  let wallet;
  try {
    wallet = await getCertificateWallet(limit, (page - 1) * limit);
  } catch (error) {
    if (
      error instanceof AcademyError &&
      error.code === "ACADEMY_UNAUTHENTICATED"
    )
      redirect("/login?next=/dashboard/learning/certificates");
    throw error;
  }
  const origin = await requestOrigin();
  const verificationUrls = Object.fromEntries(
    wallet.certificates.map((certificate) => [
      certificate.id,
      getCertificateVerificationUrl(certificate, origin),
    ]),
  );
  const totalPages = Math.max(1, Math.ceil(wallet.total / limit));

  return (
    <main className="dashboard-page certificate-wallet-page">
      <Header />
      <div className="dashboard-shell">
        <DashboardSidebar />
        <div className="dashboard-main">
          <header className="dashboard-welcome">
            <div>
              <span className="section-kicker">Academy credentials</span>
              <h1>Certificate wallet</h1>
              <p>
                Your private collection of educational course-completion
                certificates, with secure public verification.
              </p>
            </div>
            <Link className="button button-secondary" href="/academy/courses">
              Continue learning
            </Link>
          </header>

          {wallet.opportunities.length ? (
            <section
              className="certificate-opportunities dashboard-panel"
              aria-labelledby="certificate-ready-title"
            >
              <div>
                <span className="section-kicker">Completion verified</span>
                <h2 id="certificate-ready-title">
                  Certificates ready to issue
                </h2>
                <p>
                  Eligibility is checked again on the server before any
                  certificate is created.
                </p>
              </div>
              <ul>
                {wallet.opportunities.map((opportunity) => (
                  <li key={opportunity.enrollmentId}>
                    <strong>{opportunity.courseTitle}</strong>
                    <CertificateIssueButton
                      enrollmentId={opportunity.enrollmentId}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="certificate-wallet-title">
            <div className="academy-section-heading">
              <div>
                <span className="section-kicker">Issued credentials</span>
                <h2 id="certificate-wallet-title">Your certificates</h2>
              </div>
              <p>
                Revoked and superseded records remain visible for an accurate
                history.
              </p>
            </div>
            <CertificateWallet
              certificates={wallet.certificates}
              verificationUrls={verificationUrls}
            />
          </section>

          {totalPages > 1 ? (
            <nav className="academy-pagination" aria-label="Certificate pages">
              {page > 1 ? (
                <Link href={`?page=${page - 1}`}>Previous</Link>
              ) : (
                <span aria-disabled="true">Previous</span>
              )}
              <span>
                Page {Math.min(page, totalPages)} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={`?page=${page + 1}`}>Next</Link>
              ) : (
                <span aria-disabled="true">Next</span>
              )}
            </nav>
          ) : null}
        </div>
      </div>
      <Footer />
    </main>
  );
}
