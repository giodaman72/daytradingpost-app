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
import { ChartWidget } from "@/components/dashboard/ChartWidget";
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
import { localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: locale === "es" ? "Panel de trading" : "Trader Dashboard",
    description:
      locale === "es"
        ? "Tu panel privado de mercados, análisis, listas, formación y membresía."
        : "Your private DayTradingPost market outlook, research, watchlist, education and membership dashboard.",
    robots: { index: false, follow: false },
  };
}

function marketDate(spanish: boolean) {
  return new Intl.DateTimeFormat(spanish ? "es-ES" : "en-US", {
    dateStyle: "full",
    timeZone: "America/New_York",
  }).format(new Date());
}

export default async function DashboardPage() {
  const locale = await getRequestLocale();
  const spanish = locale === "es";
  const dashboardPath = localizeHref("/dashboard", locale);
  if (!isSupabaseAuthConfigured())
    redirect(
      `${localizeHref("/login", locale)}?next=${encodeURIComponent(dashboardPath)}`,
    );

  const access = await getMembershipAccess();
  const { hasPremiumAccess, profile, user } = access;

  if (!user)
    redirect(
      `${localizeHref("/login", locale)}?next=${encodeURIComponent(dashboardPath)}`,
    );

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
        <DashboardSidebar locale={locale} />

        <div className="dashboard-main">
          <header className="dashboard-welcome">
            <div>
              <span className="section-kicker">
                {spanish
                  ? "Espacio privado de trading"
                  : "Private trader workspace"}
              </span>
              <h1>
                {spanish ? "Nos alegra verte" : "Good to see you"},{" "}
                {displayName}.
              </h1>
              <p>
                {marketDate(spanish)} ·{" "}
                {spanish ? "Hora de Nueva York" : "New York market time"}
              </p>
            </div>
            <div className="dashboard-session-status" role="status">
              <span aria-hidden="true" />
              {spanish ? "Panel conectado" : "Dashboard connected"}
            </div>
          </header>

          <div className="dashboard-grid">
            <ChartWidget
              instrument={watchlistInstruments[0] ?? null}
              quote={watchlistQuotes[0] ?? null}
              locale={locale}
            />
            <AIAssistantWidget
              usage={assistantUsage}
              premium={hasPremiumAccess}
              locale={locale}
            />
            <MarketOutlook
              outlooks={marketIntelligence}
              quotes={marketQuotes}
              locale={locale}
            />
            <LatestAnalysis articles={articles} locale={locale} />
            <EconomicCalendar locale={locale} />
            <WebinarWidget locale={locale} />
            <Watchlist
              watchlist={defaultWatchlist}
              quotes={watchlistQuotes}
              locale={locale}
            />
            <SmartAlerts alerts={alerts} locale={locale} />
            <AcademyProgress
              courseTitle={academyCourse?.title}
              enrollment={academyEnrollment}
              locale={locale}
            />
            <MembershipCard
              hasPremiumAccess={hasPremiumAccess}
              profile={profile}
              locale={locale}
            />
            <Notifications
              notifications={notifications}
              unreadCount={unreadCount}
              locale={locale}
            />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
