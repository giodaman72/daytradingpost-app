import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MembershipCheckoutForm } from "@/components/membership/MembershipCheckoutForm";
import { MEMBERSHIP_PLANS, PREMIUM_BENEFITS } from "@/constants/membership";
import { getMembershipAccess } from "@/lib/payments";
import { getPaymentProviderMode } from "@/lib/membership/config";

export const metadata: Metadata = {
  title: "Premium membership",
  description:
    "Choose a monthly or annual DayTradingPost premium membership secured by Revolut.",
};

export default async function PremiumPage() {
  const { user, hasPremiumAccess } = await getMembershipAccess();
  const mode = getPaymentProviderMode();
  const isPaymentLinks = mode === "revolut_payment_links";

  return (
    <main className="membership-page">
      <Header />
      <section className="membership-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-glow hero-glow-one" aria-hidden="true" />
        <div className="container membership-heading">
          <span className="section-kicker">DayTradingPost Premium</span>
          <h1>Deeper market context. A more disciplined plan.</h1>
          <p>
            Unlock complete premium briefings while keeping payment and account
            status secured through Revolut and Supabase.
          </p>
          {hasPremiumAccess ? (
            <div className="membership-callout success" role="status">
              Your premium membership is active.{" "}
              <Link href="/account/billing">Manage billing</Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="membership-plan-grid">
            {(["monthly", "annual"] as const).map((plan) => (
              <article className="membership-plan-card" key={plan}>
                <span className="pricing-label">
                  {MEMBERSHIP_PLANS[plan].label}
                </span>
                <h2>{MEMBERSHIP_PLANS[plan].name}</h2>
                <p className="membership-price-note">
                  Final price and currency are shown securely by Revolut.
                </p>
                <ul className="premium-list">
                  {PREMIUM_BENEFITS.map((benefit) => (
                    <li key={benefit}>
                      <span aria-hidden="true">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
                {!hasPremiumAccess ? (
                  user ? (
                    <MembershipCheckoutForm plan={plan} />
                  ) : (
                    <Link
                      className="button button-full"
                      href={`/login?next=${encodeURIComponent("/premium")}`}
                    >
                      Sign in to choose {plan}
                    </Link>
                  )
                ) : null}
              </article>
            ))}
          </div>

          <div className="membership-callout" role="note">
            <strong>
              {isPaymentLinks
                ? "Payment-link verification"
                : "Revolut Merchant checkout"}
            </strong>
            <p>
              {isPaymentLinks
                ? "A pending membership request is created before checkout. Payment does not grant access automatically; an administrator verifies it first. Keep your payment reference."
                : "Revolut handles checkout. Membership access changes only after a signed webhook confirms the subscription state."}
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
