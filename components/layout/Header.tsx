import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/auth";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="DayTradingPost homepage">
          <span className="brand-mark">DTP</span>
          <span className="brand-name">
            DayTrading<span>Post</span>
          </span>
        </Link>

        <nav className="desktop-navigation" aria-label="Main navigation">
          <Link href="/#markets">Markets</Link>
          <Link href="/analysis">Analysis</Link>
          {user ? <Link href="/dashboard">Dashboard</Link> : null}
          <Link href="/academy">Academy</Link>
          <Link href="/premium">Premium</Link>
          <Link href="/#newsletter">Newsletter</Link>
        </nav>

        <div className="header-actions">
          {user ? (
            <Link href="/account" className="account-link" aria-label={`Account for ${user.email ?? "signed-in member"}`}>
              <span className="account-indicator" aria-hidden="true" />
              <span className="account-email">{user.email}</span>
              <span>Account</span>
            </Link>
          ) : (
            <Link href="/login" className="login-link">
              Sign in
            </Link>
          )}
          <Link href="/premium" className="button button-small">
            Join Premium
          </Link>
        </div>
      </div>
    </header>
  );
}
