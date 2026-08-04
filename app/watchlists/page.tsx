import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CreateWatchlistForm } from "@/components/watchlists/CreateWatchlistForm";
import { WatchlistGrid } from "@/components/watchlists/WatchlistGrid";
import { getMembershipAccess } from "@/lib/membership/access";
import { getUserWatchlists } from "@/lib/watchlists";
import { getSmartFeatureLimits } from "@/constants/smart-alerts";
import { localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: locale === "es" ? "Listas de seguimiento" : "Watchlists",
    robots: { index: false, follow: false },
  };
}
export default async function WatchlistsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const locale = await getRequestLocale();
  const spanish = locale === "es";
  const access = await getMembershipAccess();
  if (!access.user)
    redirect(
      `${localizeHref("/login", locale)}?next=${encodeURIComponent(
        localizeHref("/watchlists", locale),
      )}`,
    );
  const [watchlists, query] = await Promise.all([
    getUserWatchlists(),
    searchParams,
  ]);
  const limits = getSmartFeatureLimits(access.hasPremiumAccess);
  return (
    <main className="smart-page">
      <Header />
      <section className="smart-hero">
        <div className="container">
          <span className="section-kicker">
            {spanish
              ? "Espacio privado de mercados"
              : "Private market workspace"}
          </span>
          <h1>{spanish ? "Listas de seguimiento" : "Watchlists"}</h1>
          <p>
            {spanish
              ? "Mantén separados los datos verificados y la inteligencia editorial mientras sigues los instrumentos que te importan."
              : "Keep verified market data and editorial intelligence separate while following the instruments that matter to you."}
          </p>
        </div>
      </section>
      <section className="smart-content">
        <div className="container smart-layout">
          <div>
            <div className="smart-heading">
              <div>
                <h2>{spanish ? "Tus listas" : "Your watchlists"}</h2>
                <p>
                  {watchlists.length} {spanish ? "de" : "of"}{" "}
                  {limits.watchlists} {spanish ? "disponibles" : "available"}
                </p>
              </div>
            </div>
            {query.notice ? (
              <p className="smart-message success" role="status">
                {query.notice}
              </p>
            ) : null}
            {query.error ? (
              <p className="smart-message error" role="alert">
                {query.error}
              </p>
            ) : null}
            <WatchlistGrid watchlists={watchlists} />
          </div>
          <aside className="smart-aside">
            <h2>{spanish ? "Crear lista" : "Create watchlist"}</h2>
            <CreateWatchlistForm />
            {!access.hasPremiumAccess ? (
              <p className="smart-upgrade">
                {spanish
                  ? "Los miembros gratuitos pueden crear una lista con cinco instrumentos. "
                  : "Free members can create one watchlist with five instruments. "}
                <Link href={localizeHref("/premium", locale)}>
                  {spanish
                    ? "Mejora tu plan para obtener límites mayores."
                    : "Upgrade for higher limits."}
                </Link>
              </p>
            ) : null}
          </aside>
        </div>
      </section>
      <Footer />
    </main>
  );
}
