import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export function MembershipStatusPage({
  kicker,
  title,
  description,
  reference,
  tone = "pending",
}: {
  kicker: string;
  title: string;
  description: string;
  reference?: string | null;
  tone?: "success" | "pending" | "cancelled";
}) {
  return (
    <main className="membership-page">
      <Header />
      <section className="membership-result-shell">
        <div className="hero-grid" aria-hidden="true" />
        <div className={`membership-result-card ${tone}`}>
          <span className="section-kicker">{kicker}</span>
          <h1>{title}</h1>
          <p>{description}</p>
          {reference ? (
            <div className="payment-reference">
              <span>Payment reference</span>
              <code>{reference}</code>
            </div>
          ) : null}
          <div className="membership-result-actions">
            <Link href="/account/billing" className="button">
              View billing status
            </Link>
            <Link href="/analysis" className="text-link">
              Browse analysis →
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
