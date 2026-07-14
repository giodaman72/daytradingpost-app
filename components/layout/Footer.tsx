import Link from "next/link";
import { FOOTER_NAVIGATION } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand-column">
            <Link href={ROUTES.home} className="brand">
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
            {FOOTER_NAVIGATION.map((group) => (
              <div key={group.title}>
                <h3>{group.title}</h3>
                {group.links.map((link) => (
                  <Link href={link.href} key={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="risk-warning">
          <strong>Risk warning:</strong> Trading leveraged financial products
          involves significant risk and may not be suitable for every investor.
          DayTradingPost provides educational and informational content only and
          does not provide personalized investment advice.
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
