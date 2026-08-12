import Link from "next/link";
import { MAIN_NAVIGATION } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { getAuthenticatedUser } from "@/lib/auth";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { isSpanishPublicPath, localizeHref } from "@/lib/i18n/config";
import { getRequestLocale, getVisiblePathname } from "@/lib/i18n/server";

export async function Header() {
  const [user, locale, pathname] = await Promise.all([
    getAuthenticatedUser(),
    getRequestLocale(),
    getVisiblePathname(),
  ]);
  const spanish = locale === "es";
  const navigationLabels: Record<string, string> = {
    Markets: "Mercados",
    Analysis: "Análisis",
    Charts: "Gráficos",
    Research: "Investigación",
    Calendar: "Calendario",
    Dashboard: "Panel",
    "AI Assistant": "Asistente con IA",
    Watchlists: "Listas",
    Academy: "Academia",
    Premium: "Premium",
    Newsletter: "Boletín",
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link
          href={localizeHref(ROUTES.home, locale)}
          className="brand"
          aria-label={
            spanish
              ? "Página principal de DayTradingPost"
              : "DayTradingPost homepage"
          }
        >
          <span className="brand-mark">DTP</span>
          <span className="brand-name">
            DayTrading<span>Post</span>
          </span>
        </Link>

        <nav
          className="desktop-navigation"
          aria-label={spanish ? "Navegación principal" : "Main navigation"}
        >
          {MAIN_NAVIGATION.map((item) =>
            "authenticatedOnly" in item &&
            item.authenticatedOnly &&
            !user ? null : (
              <Link href={localizeHref(item.href, locale)} key={item.href}>
                {spanish
                  ? (navigationLabels[item.label] ?? item.label)
                  : item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="header-actions">
          {isSpanishPublicPath(pathname) ? (
            <LanguageSwitcher locale={locale} pathname={pathname} />
          ) : null}
          {user ? (
            <>
              <NotificationBell />
              <Link
                href={localizeHref(ROUTES.account, locale)}
                className="account-link"
                aria-label={`Account for ${user.email ?? "signed-in member"}`}
              >
                <span className="account-indicator" aria-hidden="true" />
                <span className="account-email">{user.email}</span>
                <span>{spanish ? "Cuenta" : "Account"}</span>
              </Link>
            </>
          ) : (
            <Link
              href={localizeHref(ROUTES.auth.login, locale)}
              className="login-link"
            >
              {spanish ? "Iniciar sesión" : "Sign in"}
            </Link>
          )}
          <Link
            href={localizeHref(ROUTES.premium, locale)}
            className="button button-small"
          >
            {spanish ? "Hazte Premium" : "Join Premium"}
          </Link>
        </div>
      </div>
    </header>
  );
}
