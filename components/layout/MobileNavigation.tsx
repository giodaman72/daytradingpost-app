import Link from "next/link";
import { MAIN_NAVIGATION } from "@/constants/navigation";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import styles from "./MobileNavigation.module.css";

type MobileNavigationProps = {
  locale: Locale;
  signedIn: boolean;
};

const SPANISH_LABELS: Record<string, string> = {
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

export function MobileNavigation({ locale, signedIn }: MobileNavigationProps) {
  const spanish = locale === "es";

  return (
    <details className={styles.mobileNavigation}>
      <summary aria-label={spanish ? "Abrir menú" : "Open menu"}>
        <span className={styles.menuIcon} aria-hidden="true" />
      </summary>
      <nav
        className={styles.menuPanel}
        aria-label={spanish ? "Navegación móvil" : "Mobile navigation"}
      >
        {MAIN_NAVIGATION.map((item) =>
          "authenticatedOnly" in item && item.authenticatedOnly && !signedIn ? null : (
            <Link href={localizeHref(item.href, locale)} key={item.href}>
              {spanish ? (SPANISH_LABELS[item.label] ?? item.label) : item.label}
            </Link>
          ),
        )}
      </nav>
    </details>
  );
}
