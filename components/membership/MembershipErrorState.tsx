"use client";

import Link from "next/link";

export function MembershipErrorState({ reset }: { reset: () => void }) {
  return (
    <main className="membership-page">
      <section className="membership-result-shell">
        <div className="hero-grid" aria-hidden="true" />
        <div className="membership-result-card cancelled">
          <span className="section-kicker">Membership unavailable</span>
          <h1>We could not load your membership.</h1>
          <p>
            Your account and payment status have not been changed. Try loading
            the page again or return to your account.
          </p>
          <div className="membership-result-actions">
            <button className="button" type="button" onClick={reset}>
              Try again
            </button>
            <Link href="/account" className="text-link">
              Return to account →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
