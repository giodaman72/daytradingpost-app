"use client";

import Link from "next/link";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="dashboard-error-state">
      <div>
        <span className="section-kicker">Dashboard unavailable</span>
        <h1>We couldn’t load your trader workspace.</h1>
        <p>
          Your account is safe. Try loading the dashboard again or return to
          your account.
        </p>
        <div>
          <button className="button" type="button" onClick={reset}>
            Try again
          </button>
          <Link href="/account" className="button button-secondary">
            Go to account
          </Link>
        </div>
      </div>
    </main>
  );
}
