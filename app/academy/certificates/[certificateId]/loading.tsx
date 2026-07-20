import { CertificateSkeleton } from "@/components/academy/certificates/CertificateSkeleton";

export default function CertificateLoading() {
  return (
    <section className="certificate-route-loading container">
      <span className="section-kicker">Academy certificate</span>
      <h1>Preparing your certificate…</h1>
      <CertificateSkeleton count={1} />
    </section>
  );
}
