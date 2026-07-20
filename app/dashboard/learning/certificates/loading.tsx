import { CertificateSkeleton } from "@/components/academy/certificates/CertificateSkeleton";

export default function CertificateWalletLoading() {
  return (
    <main className="certificate-route-loading">
      <span className="section-kicker">Academy credentials</span>
      <h1>Loading certificate wallet…</h1>
      <CertificateSkeleton />
    </main>
  );
}
