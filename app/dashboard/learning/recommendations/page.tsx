import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AcademyViewEvent } from "@/components/academy/AcademyViewEvent";
import { LearningPathRecommendation } from "@/components/academy/personalization/LearningPathRecommendation";
import { NextLessonRecommendation } from "@/components/academy/personalization/NextLessonRecommendation";
import { RecommendationEmptyState } from "@/components/academy/personalization/RecommendationEmptyState";
import { RecommendedCourseCard } from "@/components/academy/personalization/RecommendedCourseCard";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AcademyError } from "@/lib/academy/academyErrors";
import { getAcademyRecommendations } from "@/lib/academy/personalization/recommendationService";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Recommended Learning",
  description:
    "Explainable Academy recommendations based on verified learning progress.",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AcademyRecommendationsPage() {
  if (!isSupabaseAuthConfigured())
    redirect("/login?next=/dashboard/learning/recommendations");
  let data;
  try {
    data = await getAcademyRecommendations();
  } catch (error) {
    if (
      error instanceof AcademyError &&
      error.code === "ACADEMY_UNAUTHENTICATED"
    )
      redirect("/login?next=/dashboard/learning/recommendations");
    throw error;
  }
  return (
    <main className="dashboard-page">
      <Header />
      <div className="dashboard-shell">
        <DashboardSidebar />
        <div className="dashboard-main academy-recommendations-page">
          <AcademyViewEvent name="academy_recommendation_viewed" />
          <header className="dashboard-welcome">
            <div>
              <span className="section-kicker">Personalized Academy</span>
              <h1>Recommended learning</h1>
              <p>
                Deterministic suggestions based only on your learning activity
                and interests. Every suggestion explains why it appears.
              </p>
            </div>
          </header>
          {data.continueLearning ? (
            data.continueLearning.type === "learning-path" ? (
              <LearningPathRecommendation
                recommendation={data.continueLearning}
              />
            ) : (
              <NextLessonRecommendation
                recommendation={data.continueLearning}
              />
            )
          ) : null}
          {data.courseRecommendations.length ? (
            <section aria-labelledby="course-recommendations-title">
              <h2 id="course-recommendations-title">
                Courses to consider next
              </h2>
              <div className="academy-recommendation-grid">
                {data.courseRecommendations.map((item) => (
                  <RecommendedCourseCard key={item.course.id} {...item} />
                ))}
              </div>
            </section>
          ) : data.continueLearning ? null : (
            <RecommendationEmptyState />
          )}
          <p className="academy-personalization-note">
            Recommendations are educational navigation, not trading or financial
            suitability advice.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
