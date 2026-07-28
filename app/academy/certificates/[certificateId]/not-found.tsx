import Link from "next/link";

export default function CertificateNotFound() {
  return (
    <section className="certificate-route-loading container">
      <span className="section-kicker">Certificate unavailable</span>
      <h1>This certificate could not be opened.</h1>
      <p>It may not belong to this account, or the address may be incorrect.</p>
      <Link className="button" href="/dashboard/learning/certificates">
        Open certificate wallet
      </Link>
    </section>
  );
}
