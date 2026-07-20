import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AcademyAnalyticsFilters } from "@/components/academy/admin/AcademyAnalyticsFilters";
import { AcademyMetricGrid } from "@/components/academy/admin/AcademyMetricGrid";
import { InstructorReplyForm } from "@/components/academy/admin/InstructorReplyForm";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import {
  getInstructorAcademyAnalytics,
  parseAcademyAnalyticsFilters,
} from "@/lib/academy/admin/academyAnalyticsService";
import { listAdminAcademyCourses } from "@/lib/academy/admin/academyAdminContent";
import { AcademyError } from "@/lib/academy/academyErrors";
import { listPublishedCourseReviews } from "@/lib/academy/reviews/reviewRepository";
import { listInstructorReplies } from "@/lib/academy/admin/academyInstructorReviewService";

export const metadata: Metadata = {
  title: "Academy Instructor Dashboard",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AcademyInstructorPage({
  searchParams,
}: {
  searchParams: Promise<{
    course?: string | string[];
    from?: string | string[];
    to?: string | string[];
  }>;
}) {
  const filters = parseAcademyAnalyticsFilters(await searchParams);
  let result;
  try {
    result = await getInstructorAcademyAnalytics(filters);
  } catch (error) {
    if (
      error instanceof AcademyError &&
      ["ACADEMY_UNAUTHENTICATED", "ACADEMY_FORBIDDEN"].includes(error.code)
    )
      redirect("/account?notice=instructor-assignment-required");
    throw error;
  }
  const assignmentIds = new Set(
    result.assignments.map((assignment) => assignment.courseId),
  );
  const courses = (await listAdminAcademyCourses()).filter((course) =>
    assignmentIds.has(course.id),
  );
  const [reviewGroups, instructorReplies] = await Promise.all([
    Promise.all(
      courses.map(async (course) => ({
        course,
        reviews: await listPublishedCourseReviews(course.id, 5),
      })),
    ),
    listInstructorReplies(result.instructorUserId),
  ]);
  return (
    <main className="academy-admin-page">
      <Header />
      <div className="container academy-instructor-shell">
        <header className="academy-admin-heading">
          <span className="section-kicker">Private instructor workspace</span>
          <h1>Academy instructor dashboard</h1>
          <p>
            Only explicitly assigned courses and privacy-conscious aggregates
            appear here. Learner emails, notes and individual assessment
            responses are excluded.
          </p>
        </header>
        <AcademyAnalyticsFilters courses={courses} defaultValues={filters} />
        <AcademyMetricGrid
          metrics={result.dashboard.metrics}
          privacyThreshold={result.dashboard.privacyThreshold}
        />
        <section className="academy-admin-panel">
          <h2>Assigned courses</h2>
          <div className="academy-admin-card-grid">
            {courses.map((course) => (
              <article className="academy-admin-card" key={course.id}>
                <span>
                  {course.status} · v{course.version}
                </span>
                <h3>{course.title}</h3>
                <p>
                  {course.modules.length} modules ·{" "}
                  {course.validationIssues.length} validation issues
                </p>
                <Link href={`/academy/courses/${course.slug}`}>
                  Preview course
                </Link>
              </article>
            ))}
          </div>
        </section>
        <section className="academy-admin-panel">
          <h2>Recent published reviews</h2>
          <div className="academy-instructor-reviews">
            {reviewGroups.flatMap(({ course, reviews }) =>
              reviews.map((review) => (
                <article key={review.id}>
                  <strong>
                    {course.title} · {review.rating}/5
                  </strong>
                  <h3>{review.title}</h3>
                  <p>{review.reviewText}</p>
                  <InstructorReplyForm
                    existing={
                      instructorReplies.find(
                        (reply) => reply.reviewId === review.id,
                      ) ?? null
                    }
                    reviewId={review.id}
                  />
                </article>
              )),
            )}
          </div>
          {!reviewGroups.some((group) => group.reviews.length) ? (
            <p>No published reviews for assigned courses.</p>
          ) : null}
        </section>
      </div>
      <Footer />
    </main>
  );
}
