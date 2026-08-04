import Link from "next/link";
import { logoutAction } from "@/app/(auth)/actions";
import { ACCOUNT_NAVIGATION } from "@/constants/navigation";
import { localizeHref, type Locale } from "@/lib/i18n/config";

const spanishLabels: Record<string, string> = {
  "Trader dashboard": "Panel de trading",
  "AI Assistant": "Asistente con IA",
  "Advanced charts": "Gráficos avanzados",
  "Account overview": "Resumen de la cuenta",
  "Billing & membership": "Facturación y membresía",
  Watchlists: "Listas de seguimiento",
  "Smart alerts": "Alertas inteligentes",
  "Premium plans": "Planes Premium",
  "Market analysis": "Análisis de mercados",
};

export function AccountNavigation({
  current = "overview",
  isAdmin = false,
  locale = "en",
}: {
  current?: "overview" | "billing";
  isAdmin?: boolean;
  locale?: Locale;
}) {
  const spanish = locale === "es";
  return (
    <nav
      className="account-navigation"
      aria-label={spanish ? "Navegación de la cuenta" : "Account navigation"}
    >
      {ACCOUNT_NAVIGATION.map((item) => (
        <Link
          aria-current={item.section === current ? "page" : undefined}
          href={localizeHref(item.href, locale)}
          key={item.href}
        >
          {spanish ? (spanishLabels[item.label] ?? item.label) : item.label}
        </Link>
      ))}
      {isAdmin ? (
        <Link href="/admin/memberships">
          {spanish ? "Administración de pagos" : "Payment administration"}
        </Link>
      ) : null}
      <form action={logoutAction}>
        <input type="hidden" name="locale" value={locale} />
        <button type="submit">{spanish ? "Cerrar sesión" : "Sign out"}</button>
      </form>
    </nav>
  );
}
