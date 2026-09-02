import Link from "next/link";
import { getInstrument } from "@/constants/instruments";
import { getAuthenticatedUser } from "@/lib/auth";
import { getRequestLocale } from "@/lib/i18n/server";
import { localizeHref } from "@/lib/i18n/config";
import { translateInstrumentName } from "@/lib/i18n/spanish";
export async function MarketQuickActions({
  instrument: value,
}: {
  instrument: string;
}) {
  const instrument = getInstrument(value);
  if (!instrument) return null;
  const [user, locale] = await Promise.all([
    getAuthenticatedUser(),
    getRequestLocale(),
  ]);
  const spanish = locale === "es";
  const instrumentName = spanish
    ? translateInstrumentName(instrument.name)
    : instrument.name;
  const next = `/alerts/new?instrument=${instrument.slug}`;
  return (
    <aside
      className="market-quick-actions"
      aria-label={`${instrumentName} ${spanish ? "acciones para miembros" : "member actions"}`}
    >
      <strong>
        {spanish ? `Seguir ${instrumentName}` : `Track ${instrumentName}`}
      </strong>
      <div>
        <Link href={localizeHref(`/charts/${instrument.slug}`, locale)}>
          {spanish ? "Abrir gráfico avanzado" : "Open advanced chart"}
        </Link>
        {user ? (
          <>
            <Link href={localizeHref("/watchlists", locale)}>
              {spanish ? "Añadir a la lista" : "Add to watchlist"}
            </Link>
            <Link href={localizeHref(`${next}&type=price_above`, locale)}>
              {spanish ? "Crear alerta de precio" : "Create price alert"}
            </Link>
            <Link
              href={localizeHref(`${next}&type=market_bias_changed`, locale)}
            >
              {spanish ? "Alerta de cambio de sesgo" : "Bias-change alert"}
            </Link>
            <Link
              href={localizeHref(`${next}&type=new_market_analysis`, locale)}
            >
              {spanish ? "Alerta de nuevo análisis" : "New-analysis alert"}
            </Link>
          </>
        ) : (
          <Link
            href={localizeHref(
              `/login?next=${encodeURIComponent(next)}`,
              locale,
            )}
          >
            {spanish
              ? "Inicia sesión para crear listas y alertas"
              : "Sign in to create watchlists and alerts"}
          </Link>
        )}
      </div>
    </aside>
  );
}
