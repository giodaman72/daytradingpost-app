import type { Metadata } from "next";
import { headers } from "next/headers";
import { CertificateVerification } from "@/components/academy/certificates/CertificateVerification";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AcademyError } from "@/lib/academy/academyErrors";
import { verifyCertificate } from "@/lib/academy/certificates/certificateService";

export const metadata: Metadata = {
  title: "Verify Academy Certificate",
  description:
    "Verify the current status of a DayTradingPost Academy course completion certificate.",
  robots: { follow: false, index: false },
};

export const dynamic = "force-dynamic";

export default async function PublicCertificateVerificationPage({
  params,
}: {
  params: Promise<{ verificationCode: string }>;
}) {
  const { verificationCode } = await params;
  const requestHeaders = await headers();
  const rateLimitRequest = new Request(
    "https://certificate-verification.local",
    {
      headers: {
        "user-agent": requestHeaders.get("user-agent") || "unknown",
        "x-forwarded-for": requestHeaders.get("x-forwarded-for") || "",
        "x-real-ip": requestHeaders.get("x-real-ip") || "",
      },
    },
  );
  let verification = null;
  let rateLimited = false;
  try {
    verification = await verifyCertificate(verificationCode, rateLimitRequest);
  } catch (error) {
    if (error instanceof AcademyError) {
      if (error.code === "ACADEMY_RATE_LIMITED") rateLimited = true;
      else if (error.code !== "ACADEMY_VALIDATION_FAILED") throw error;
    } else throw error;
  }

  return (
    <main className="certificate-public-page">
      <Header />
      <div className="container">
        {rateLimited ? (
          <section className="certificate-verification invalid" role="status">
            <span className="section-kicker">Verification paused</span>
            <h1>Too many verification attempts</h1>
            <p>Please wait a minute before trying again.</p>
          </section>
        ) : (
          <CertificateVerification verification={verification} />
        )}
        <aside className="certificate-education-note">
          <strong>Educational completion record</strong>
          <p>
            Certificates confirm completion of DayTradingPost course content.
            They do not represent accreditation, a professional license, or a
            guarantee of trading outcomes.
          </p>
        </aside>
      </div>
      <Footer />
    </main>
  );
}
