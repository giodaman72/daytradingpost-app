import Link from "next/link";
import { MAIN_NAVIGATION } from "@/constants/navigation";
import { localizeHref, type Locale } from "@/lib/i18n/config";

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
    <details className="relative ml-auto hidden max-[960px]:block">
      <summary
        aria-label={spanish ? "Abrir menú" : "Open menu"}
        className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-xl border border-white/15 bg-white/5 text-current"
      >
        <span aria-hidden="true" className="text-xl leading-none">
          ☰
        </span>
      </summary>
      <nav
        aria-label={spanish ? "Navegación móvil" : "Mobile navigation"}
        className="absolute right-0 top-[calc(100%+10px)] z-[1000] max-h-[calc(100vh-90px)] w-[min(86vw,320px)] overflow-y-auto rounded-2xl border border-white/15 bg-[#0b111c] p-2.5 shadow-2xl"
      >
        {MAIN_NAVIGATION.map((item) =>
          "authenticatedOnly" in item &&
          item.authenticatedOnly &&
          !signedIn ? null : (
            <Link
              className="block rounded-lg px-3 py-3 text-inherit no-underline hover:bg-white/10 focus-visible:bg-white/10"
              href={localizeHref(item.href, locale)}
              key={item.href}
            >
              {spanish
                ? (SPANISH_LABELS[item.label] ?? item.label)
                : item.label}
            </Link>
          ),
        )}
      </nav>
    </details>
  );
}
