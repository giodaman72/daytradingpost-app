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
import { SmartAlerts } from "@/components/dashboard/SmartAlerts";
import { WebinarWidget } from "@/components/dashboard/WebinarWidget";
import { AIAssistantWidget } from "@/components/dashboard/AIAssistantWidget";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getLatestArticles } from "@/lib/cms";
import { getDashboardMarketIntelligence } from "@/lib/market/marketIntelligenceService";
import { getDashboardQuotes } from "@/lib/market-data/marketDataService";
import { getMarketQuotes } from "@/lib/market-data/marketDataService";
import { getUserWatchlists } from "@/lib/watchlists";
import { getUserAlerts } from "@/lib/alerts";
import {
  getUserNotifications,
  getUnreadNotificationCount,
} from "@/lib/notifications";
import { getInstrument } from "@/constants/instruments";
import { getMembershipAccess } from "@/lib/payments";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";
import { getAssistantUsage } from "@/lib/ai/assistantUsage";
import {
  getAcademyCourse,
  listUserEnrollments,
} from "@/lib/academy/academyService";

export const metadata: Metadata = {
  title: "Trader Dashboard",
  description:
    "Your private DayTradingPost market outlook, research, watchlist, education and membership dashboard.",
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

  const access = await getMembershipAccess();
  const { hasPremiumAccess, profile, user } = access;

  if (!user) redirect("/login?next=/dashboard");

  const [
    articles,
    watchlists,
    alerts,
    notifications,
    unreadCount,
    assistantUsage,
    academyEnrollments,
  ] = await Promise.all([
    getLatestArticles(5),
    getUserWatchlists().catch(() => []),
    getUserAlerts(20).catch(() => []),
    getUserNotifications(5).catch(() => []),
    getUnreadNotificationCount().catch(() => 0),
    getAssistantUsage(user.id, hasPremiumAccess).catch(() => null),
    listUserEnrollments(20, 0).catch(() => []),
  ]);
  const academyEnrollment =
    academyEnrollments.find((item) => item.status === "in_progress") ??
    academyEnrollments.find((item) => item.status === "enrolled") ??
    academyEnrollments[0] ??
    null;
  const academyCourse = academyEnrollment
    ? await getAcademyCourse(academyEnrollment.courseSlug).catch(() => null)
    : null;
  const defaultWatchlist =
    watchlists.find((item) => item.isDefault) ?? watchlists[0] ?? null;
  const watchlistInstruments =
    defaultWatchlist?.items
      .map((item) => getInstrument(item.instrumentSlug))
      .filter((item): item is NonNullable<typeof item> => Boolean(item)) ?? [];
  const [marketIntelligence, marketQuotes, watchlistQuotes] = await Promise.all(
    [
      getDashboardMarketIntelligence(
        watchlistInstruments.map((item) => item.symbol),
      ),
      getDashboardQuotes(),
      getMarketQuotes(watchlistInstruments),
    ],
  );

  const displayName =
    profile?.full_name ||
    user.user_metadata.full_name ||
    user.email?.split("@")[0] ||
    "Trader";
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
            <AIAssistantWidget
              usage={assistantUsage}
              premium={hasPremiumAccess}
            />
            <MarketOutlook
              outlooks={marketIntelligence}
              quotes={marketQuotes}
            />
            <LatestAnalysis articles={articles} />
            <EconomicCalendar />
            <WebinarWidget />
            <Watchlist watchlist={defaultWatchlist} quotes={watchlistQuotes} />
            <SmartAlerts alerts={alerts} />
            <AcademyProgress
              courseTitle={academyCourse?.title}
              enrollment={academyEnrollment}
            />
            <MembershipCard
              hasPremiumAccess={hasPremiumAccess}
              profile={profile}
            />
            <Notifications
              notifications={notifications}
              unreadCount={unreadCount}
            />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
