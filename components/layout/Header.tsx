import Link from "next/link";

export function Header() {
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
          <Link href="/academy">Academy</Link>
          <Link href="/premium">Premium</Link>
          <Link href="/#newsletter">Newsletter</Link>
        </nav>

        <div className="header-actions">
          <Link href="/login" className="login-link">
            Sign in
          </Link>
          <Link href="/premium" className="button button-small">
            Join Premium
          </Link>
        </div>
      </div>
    </header>
  );
}
