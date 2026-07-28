import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AcademyNotificationPreferences } from "@/components/academy/personalization/AcademyNotificationPreferences";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { NotificationList } from "@/components/notifications/NotificationList";
import { getAcademyPreferences } from "@/lib/academy/personalization/preferencesService";
import { getUserNotifications } from "@/lib/notifications/notificationService";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Learning Notifications",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function LearningNotificationsPage() {
  if (!isSupabaseAuthConfigured())
    redirect("/login?next=/dashboard/learning/notifications");
  let preferences;
  let notifications;
  try {
    [preferences, notifications] = await Promise.all([
      getAcademyPreferences(),
      getUserNotifications(50, 0),
    ]);
  } catch {
    redirect("/login?next=/dashboard/learning/notifications");
  }
  const academyNotifications = notifications.filter((item) =>
    item.notificationType.startsWith("academy_"),
  );
  return (
    <main className="dashboard-page">
      <Header />
      <div className="dashboard-shell">
        <DashboardSidebar />
        <div className="dashboard-main academy-notifications-page">
          <header className="dashboard-welcome">
            <div>
              <span className="section-kicker">Learning updates</span>
              <h1>Academy notifications</h1>
              <p>
                Control respectful reminders and review your learning
                milestones.
              </p>
            </div>
          </header>
          <AcademyNotificationPreferences initial={preferences} />
          <section
            className="dashboard-panel"
            aria-labelledby="academy-notifications-title"
          >
            <h2 id="academy-notifications-title">Recent updates</h2>
            <NotificationList notifications={academyNotifications} />
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
