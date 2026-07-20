import Link from "next/link";
import { Award } from "lucide-react";

export function CertificateEmptyState() {
  return (
    <section className="certificate-empty-state">
      <Award size={36} aria-hidden="true" />
      <h2>Your certificate wallet is ready</h2>
      <p>
        Complete an eligible Academy course and its required assessment to earn
        an educational completion certificate.
      </p>
      <Link className="button" href="/academy/courses">
        Browse courses
      </Link>
    </section>
  );
}
