import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LearningPathCard } from "@/components/academy/learning-paths/LearningPathCard";
import { LearningPathEmptyState } from "@/components/academy/learning-paths/LearningPathEmptyState";
import { LearningPathProgress } from "@/components/academy/learning-paths/LearningPathProgress";
import { LearningPathResumeButton } from "@/components/academy/learning-paths/LearningPathResumeButton";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { formatAcademyDuration } from "@/lib/academy/academyPresentation";
import { getUserLearningPathDashboard } from "@/lib/academy/learningPaths/learningPathService";
import { AcademyError } from "@/lib/academy/academyErrors";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "My Learning Paths",
  description:
    "Review your enrolled DayTradingPost Academy learning paths, verified progress and next recommended curriculum.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LearningPathDashboardPage() {
  if (!isSupabaseAuthConfigured())
    redirect("/login?next=/dashboard/learning/paths");
  let dashboard;
  try {
    dashboard = await getUserLearningPathDashboard();
  } catch (error) {
    if (
      error instanceof AcademyError &&
      error.code === "ACADEMY_UNAUTHENTICATED"
    )
      redirect("/login?next=/dashboard/learning/paths");
    throw error;
  }
  return (
    <main className="dashboard-page">
      <Header />
      <div className="dashboard-shell">
        <DashboardSidebar />
        <div className="dashboard-main learning-path-dashboard">
          <header className="dashboard-welcome">
            <div>
              <span className="section-kicker">Academy progression</span>
              <h1>My learning paths</h1>
              <p>
                Server-verified course completion, next steps and clear lock
                reasons in one private workspace.
              </p>
            </div>
            <Link href="/academy/learning-paths" className="button">
              Browse paths
            </Link>
          </header>
          {dashboard.views.length ? (
            <section aria-labelledby="active-paths-title">
              <div className="academy-section-heading">
                <div>
                  <span className="section-kicker">Active curricula</span>
                  <h2 id="active-paths-title">Your enrolled paths</h2>
                </div>
              </div>
              <div className="learning-path-dashboard-list">
                {dashboard.views.map((view) => (
                  <article key={view.path.id} className="dashboard-panel">
                    <div className="learning-path-dashboard-card-grid">
                      <div>
                        <span className="academy-access-badge">
                          {view.enrollment?.status.replace("_", " ")}
                        </span>
                        <h2>{view.path.title}</h2>
                        <p>
                          Next course:{" "}
                          {view.progress.nextCourse?.title ??
                            "No available course"}
                        </p>
                        <LearningPathResumeButton
                          learningPathId={view.path.id}
                          pathSlug={view.path.slug}
                        />
                      </div>
                      <LearningPathProgress
                        completed={view.progress.completedRequiredCourses}
                        historicalCompletion={
                          view.progress.historicalCompletion
                        }
                        optionalCompleted={
                          view.progress.completedOptionalCourses
                        }
                        percent={view.progress.progressPercent}
                        remainingLabel={formatAcademyDuration(
                          view.progress.remainingDurationMinutes,
                        )}
                        required={view.progress.requiredCourses}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <LearningPathEmptyState dashboard />
          )}
          {dashboard.recommendations.length ? (
            <section
              className="learning-path-recommendations"
              aria-labelledby="recommended-paths-title"
            >
              <div className="academy-section-heading">
                <div>
                  <span className="section-kicker">
                    Explainable suggestions
                  </span>
                  <h2 id="recommended-paths-title">Recommended next paths</h2>
                </div>
                <p>
                  Recommendations use only completed paths, current difficulty
                  and editorial featuring—not sensitive profile data.
                </p>
              </div>
              <div className="learning-path-grid">
                {dashboard.recommendations.map((recommendation) => (
                  <LearningPathCard
                    key={recommendation.path.id}
                    path={recommendation.path}
                    recommendationReason={recommendation.reason}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
      <Footer />
    </main>
  );
}
