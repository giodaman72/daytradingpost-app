import Link from "next/link";
import { MAIN_NAVIGATION } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { getAuthenticatedUser } from "@/lib/auth";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export async function Header() {
  const user = await getAuthenticatedUser();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link
          href={ROUTES.home}
          className="brand"
          aria-label="DayTradingPost homepage"
        >
          <span className="brand-mark">DTP</span>
          <span className="brand-name">
            DayTrading<span>Post</span>
          </span>
        </Link>

        <nav className="desktop-navigation" aria-label="Main navigation">
          {MAIN_NAVIGATION.map((item) =>
            "authenticatedOnly" in item &&
            item.authenticatedOnly &&
            !user ? null : (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <NotificationBell />
              <Link
                href={ROUTES.account}
                className="account-link"
                aria-label={`Account for ${user.email ?? "signed-in member"}`}
              >
                <span className="account-indicator" aria-hidden="true" />
                <span className="account-email">{user.email}</span>
                <span>Account</span>
              </Link>
            </>
          ) : (
            <Link href={ROUTES.auth.login} className="login-link">
              Sign in
            </Link>
          )}
          <Link href={ROUTES.premium} className="button button-small">
            Join Premium
          </Link>
        </div>
      </div>
    </header>
  );
}
