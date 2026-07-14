import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AcademyProgress } from "@/components/dashboard/AcademyProgress";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { EconomicCalendar } from "@/components/dashboard/EconomicCalendar";
import { LatestAnalysis } from "@/components/dashboard/LatestAnalysis";
import { MarketOutlook } from "@/components/dashboard/MarketOutlook";
import { MembershipCard } from "@/components/dashboard/MembershipCard";
import { Notifications } from "@/components/dashboard/Notifications";
import { Watchlist } from "@/components/dashboard/Watchlist";
import { WebinarWidget } from "@/components/dashboard/WebinarWidget";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getMembershipAccess } from "@/lib/membership/access";
import { getLatestArticles } from "@/lib/sanity/client";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Trader Dashboard",
  description: "Your private DayTradingPost market outlook, research, watchlist, education and membership dashboard.",
  robots: { index: false, follow: false },
};

function marketDate() {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeZone: "America/New_York",
  }).format(new Date());
}

export default async function DashboardPage() {
  if (!isSupabaseAuthConfigured()) redirect("/login?next=/dashboard");

  const [access, articles] = await Promise.all([
    getMembershipAccess(),
    getLatestArticles(5),
  ]);
  const { hasPremiumAccess, profile, user } = access;

  if (!user) redirect("/login?next=/dashboard");

  const displayName =
    profile?.full_name ||
    user.user_metadata.full_name ||
    user.email?.split("@")[0] ||
    "Trader";
  const membershipStatus = profile?.membership_status || "free";

  return (
    <main className="dashboard-page">
      <Header />
      <div className="dashboard-shell">
        <DashboardSidebar />

        <div className="dashboard-main">
          <header className="dashboard-welcome">
            <div>
              <span className="section-kicker">Private trader workspace</span>
              <h1>Good to see you, {displayName}.</h1>
              <p>{marketDate()} · New York market time</p>
            </div>
            <div className="dashboard-session-status" role="status">
              <span aria-hidden="true" />
              Dashboard connected
            </div>
          </header>

          <div className="dashboard-grid">
            <MarketOutlook articles={articles} />
            <LatestAnalysis articles={articles} />
            <EconomicCalendar />
            <WebinarWidget />
            <Watchlist />
            <AcademyProgress />
            <MembershipCard
              hasPremiumAccess={hasPremiumAccess}
              profile={profile}
            />
            <Notifications articleCount={articles.length} membershipStatus={membershipStatus} />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
