import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand-column">
            <Link href="/" className="brand">
              <span className="brand-mark">DTP</span>
              <span className="brand-name">
                DayTrading<span>Post</span>
              </span>
            </Link>

            <p>
              Independent market intelligence and trading education for active
              traders.
            </p>
          </div>

          <div className="footer-links">
            <div>
              <h3>Markets</h3>
              <Link href="/markets/gold">Gold</Link>
              <Link href="/markets/indices">Indices</Link>
              <Link href="/markets/forex">Forex</Link>
              <Link href="/markets/crypto">Crypto</Link>
            </div>

            <div>
              <h3>Learn</h3>
              <Link href="/academy">Trading Academy</Link>
              <Link href="/analysis">Market Analysis</Link>
              <Link href="/webinars">Webinars</Link>
              <Link href="/premium">Premium</Link>
            </div>

            <div>
              <h3>Company</h3>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
        </div>

        <div className="risk-warning">
          <strong>Risk warning:</strong> Trading leveraged financial products
          involves significant risk and may not be suitable for every investor.
          DayTradingPost provides educational and informational content only
          and does not provide personalized investment advice.
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} DayTradingPost. All rights reserved.
          </span>
          <span>Professional market intelligence for active traders.</span>
        </div>
      </div>
    </footer>
  );
}
