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
export const metadata: Metadata = {
  title: "Watchlists",
  robots: { index: false, follow: false },
};
export default async function WatchlistsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const access = await getMembershipAccess();
  if (!access.user) redirect("/login?next=/watchlists");
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
          <span className="section-kicker">Private market workspace</span>
          <h1>Watchlists</h1>
          <p>
            Keep verified market data and editorial intelligence separate while
            following the instruments that matter to you.
          </p>
        </div>
      </section>
      <section className="smart-content">
        <div className="container smart-layout">
          <div>
            <div className="smart-heading">
              <div>
                <h2>Your watchlists</h2>
                <p>
                  {watchlists.length} of {limits.watchlists} available
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
            <h2>Create watchlist</h2>
            <CreateWatchlistForm />
            {!access.hasPremiumAccess ? (
              <p className="smart-upgrade">
                Free members can create one watchlist with five instruments.{" "}
                <Link href="/premium">Upgrade for higher limits.</Link>
              </p>
            ) : null}
          </aside>
        </div>
      </section>
      <Footer />
    </main>
  );
}
