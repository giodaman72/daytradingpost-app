import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { getAuthenticatedUser } from "@/lib/auth";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { isSpanishPublicPath, localizeHref } from "@/lib/i18n/config";
import { getRequestLocale, getVisiblePathname } from "@/lib/i18n/server";

export async function Header() {
  const [user, locale, pathname] = await Promise.all([
    getAuthenticatedUser(),
    getRequestLocale(),
    getVisiblePathname(),
  ]);
  const spanish = locale === "es";

  const publicNavigation = spanish
    ? [
        ["Inicio", "/"],
        ["Mercados", "/#markets"],
        ["Análisis", "/analysis"],
        ["Educación", "/academy"],
        ["Premium", "/premium"],
        ["Nosotros", "/about"],
      ]
    : [
        ["Home", "/"],
        ["Markets", "/#markets"],
        ["Analysis", "/analysis"],
        ["Education", "/academy"],
        ["Premium", "/premium"],
        ["About", "/about"],
      ];

  return (
    <header className="site-header reference-header">
      <div className="reference-shell reference-header-inner">
        <Link
          href={localizeHref(ROUTES.home, locale)}
          className="brand reference-brand"
          aria-label={
            spanish
              ? "Página principal de DayTradingPost"
              : "DayTradingPost homepage"
          }
        >
          <span className="brand-mark">DTP</span>
          <span className="reference-brand-copy">
            <span className="brand-name">
              DayTrading<span>Post</span>
            </span>
            <small>{spanish ? "INDEPENDIENTE. OBJETIVO. ACCIONABLE." : "INDEPENDENT. OBJECTIVE. ACTIONABLE."}</small>
          </span>
        </Link>

        <nav
          className="reference-desktop-navigation"
          aria-label={spanish ? "Navegación principal" : "Main navigation"}
        >
          {publicNavigation.map(([label, href]) => (
            <Link href={localizeHref(href, locale)} key={href}>
              {label}
            </Link>
          ))}
        </nav>

        <MobileNavigation locale={locale} signedIn={Boolean(user)} />

        <div className="header-actions reference-header-actions">
          {isSpanishPublicPath(pathname) ? (
            <LanguageSwitcher locale={locale} pathname={pathname} />
          ) : null}
          {user ? (
            <>
              <NotificationBell locale={locale} />
              <Link
                href={localizeHref(ROUTES.account, locale)}
                className="account-link"
                aria-label={`Account for ${user.email ?? "signed-in member"}`}
              >
                <span className="account-indicator" aria-hidden="true" />
                <span>{spanish ? "Cuenta" : "Account"}</span>
              </Link>
            </>
          ) : null}
          <Link
            href={localizeHref(ROUTES.premium, locale)}
            className="button button-small reference-header-premium"
          >
            <span aria-hidden="true">♛</span>
            {spanish ? "Hazte Premium" : "Join Premium"}
          </Link>
        </div>
      </div>
    </header>
  );
}
