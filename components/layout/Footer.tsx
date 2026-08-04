import Link from "next/link";
import { FOOTER_NAVIGATION } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";

export async function Footer() {
  const locale = await getRequestLocale();
  const spanish = locale === "es";
  const groupLabels: Record<string, string> = {
    Markets: "Mercados",
    Learn: "Aprende",
    Company: "Empresa",
  };
  const linkLabels: Record<string, string> = {
    Gold: "Oro",
    Indices: "Índices",
    Forex: "Forex",
    Crypto: "Cripto",
    "Trading Academy": "Academia de trading",
    "Market Analysis": "Análisis de mercados",
    "Economic Calendar": "Calendario económico",
    Webinars: "Webinars",
    Premium: "Premium",
    About: "Quiénes somos",
    Contact: "Contacto",
    Privacy: "Privacidad",
    Terms: "Términos",
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand-column">
            <Link href={localizeHref(ROUTES.home, locale)} className="brand">
              <span className="brand-mark">DTP</span>
              <span className="brand-name">
                DayTrading<span>Post</span>
              </span>
            </Link>

            <p>
              {spanish
                ? "Inteligencia independiente de mercados y formación en trading para traders activos."
                : "Independent market intelligence and trading education for active traders."}
            </p>
          </div>

          <div className="footer-links">
            {FOOTER_NAVIGATION.map((group) => (
              <div key={group.title}>
                <h3>
                  {spanish
                    ? (groupLabels[group.title] ?? group.title)
                    : group.title}
                </h3>
                {group.links.map((link) => (
                  <Link href={localizeHref(link.href, locale)} key={link.href}>
                    {spanish
                      ? (linkLabels[link.label] ?? link.label)
                      : link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="risk-warning">
          <strong>
            {spanish ? "Advertencia de riesgo:" : "Risk warning:"}
          </strong>{" "}
          {spanish
            ? "Operar con productos financieros apalancados implica un riesgo considerable y puede no ser adecuado para todos los inversores. DayTradingPost ofrece únicamente contenido educativo e informativo y no proporciona asesoramiento de inversión personalizado."
            : "Trading leveraged financial products involves significant risk and may not be suitable for every investor. DayTradingPost provides educational and informational content only and does not provide personalized investment advice."}
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} DayTradingPost.{" "}
            {spanish
              ? "Todos los derechos reservados."
              : "All rights reserved."}
          </span>
          <span>
            {spanish
              ? "Inteligencia profesional de mercados para traders activos."
              : "Professional market intelligence for active traders."}
          </span>
        </div>
      </div>
    </footer>
  );
}
