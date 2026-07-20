import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Award,
  BookOpenCheck,
  Clock3,
  Crown,
  Gauge,
  UserRound,
} from "lucide-react";
import { AcademyPortableText } from "@/components/academy/AcademyPortableText";
import { AcademyCatalogGrid } from "@/components/academy/AcademyCatalogGrid";
import { AcademyViewEvent } from "@/components/academy/AcademyViewEvent";
import { CourseCurriculum } from "@/components/academy/CourseCurriculum";
import { EnrollmentButton } from "@/components/academy/EnrollmentButton";
import { AcademyError } from "@/lib/academy/academyErrors";
import { formatAcademyDuration } from "@/lib/academy/academyPresentation";
import { listEnrollments } from "@/lib/academy/academyRepository";
import {
  getAcademyCourse,
  getAcademyCourseByLegacySlug,
  listAcademyCourses,
} from "@/lib/academy/academyService";
import { getMembershipAccess } from "@/lib/membership/access";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";

type CoursePageProps = {
  params: Promise<{ courseSlug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  try {
    const course = await getAcademyCourse((await params).courseSlug);
    return {
      title: course.seoTitle,
      description: course.seoDescription,
      alternates: { canonical: `/academy/courses/${course.slug}` },
      openGraph: {
        title: `${course.seoTitle} | DayTradingPost`,
        description: course.seoDescription,
        type: "website",
        url: `/academy/courses/${course.slug}`,
        images: course.seoImage?.url
          ? [{ url: course.seoImage.url, alt: course.seoImage.alt }]
          : undefined,
      },
    };
  } catch {
    return {
      title: "Academy course not found",
      robots: { index: false, follow: false },
    };
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseSlug } = await params;
  let course;
  try {
    course = await getAcademyCourse(courseSlug);
  } catch (error) {
    if (
      error instanceof AcademyError &&
      ["ACADEMY_COURSE_NOT_FOUND", "ACADEMY_VALIDATION_FAILED"].includes(
        error.code,
      )
    ) {
      const legacyCourse = await getAcademyCourseByLegacySlug(courseSlug).catch(
        () => null,
      );
      if (legacyCourse) redirect(`/academy/courses/${legacyCourse.slug}`);
      notFound();
    }
    throw error;
  }
  const access = isSupabaseAuthConfigured()
    ? await getMembershipAccess().catch(() => ({
        hasPremiumAccess: false,
        profile: null,
        user: null,
      }))
    : { hasPremiumAccess: false, profile: null, user: null };
  const enrollments = access.user
    ? await listEnrollments(access.user.id, 100, 0).catch(() => [])
    : [];
  const enrollment =
    enrollments.find((item) => item.courseId === course.id) ?? null;
  const completedCourseIds = new Set(
    enrollments
      .filter((item) => item.status === "completed")
      .map((item) => item.courseId),
  );
  const prerequisitesMet = course.prerequisiteCourseIds.every((id) =>
    completedCourseIds.has(id),
  );
  const requiresUpgrade =
    Boolean(access.user) &&
    course.accessLevel === "premium" &&
    !access.hasPremiumAccess;
  const relatedCourses = (await listAcademyCourses(100, 0).catch(() => []))
    .filter(
      (candidate) =>
        candidate.id !== course.id &&
        (candidate.category?.id === course.category?.id ||
          candidate.tags.some((tag) => course.tags.includes(tag))),
    )
    .slice(0, 3);

  return (
    <>
      {access.user ? (
        <AcademyViewEvent courseId={course.id} name="academy_course_viewed" />
      ) : null}
      <section className="academy-course-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="container">
          <nav aria-label="Breadcrumb">
            <Link href="/academy">Academy</Link>
            <span aria-hidden="true">/</span>
            <Link href="/academy/courses">Courses</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{course.title}</span>
          </nav>
          <div className="academy-course-hero-grid">
            <div>
              <span className={`academy-access-badge ${course.accessLevel}`}>
                {course.accessLevel === "premium" ? (
                  <Crown size={12} aria-hidden="true" />
                ) : null}
                {course.accessLevel} course
              </span>
              <h1>{course.title}</h1>
              <p>{course.excerpt}</p>
              <div className="academy-course-facts">
                <span>
                  <Gauge aria-hidden="true" />
                  {course.difficulty}
                </span>
                <span>
                  <Clock3 aria-hidden="true" />
                  {formatAcademyDuration(course.durationMinutes)}
                </span>
                <span>
                  <BookOpenCheck aria-hidden="true" />
                  {course.modules.length} modules
                </span>
                <span>
                  <UserRound aria-hidden="true" />
                  {course.instructor?.name ?? "DayTradingPost Academy"}
                </span>
              </div>
            </div>
            <aside className="academy-enrollment-card">
              {course.coverImage?.url ? (
                <div className="academy-enrollment-image">
                  <Image
                    src={course.coverImage.url}
                    alt={course.coverImage.alt || ""}
                    fill
                    sizes="(max-width: 900px) 100vw, 380px"
                    priority
                  />
                </div>
              ) : null}
              <div>
                <strong>
                  {enrollment ? "Your course" : "Start this course"}
                </strong>
                <p>
                  {enrollment
                    ? `${Math.round(enrollment.progressPercent)}% complete`
                    : "Enrollment saves lesson, assessment, bookmark and note progress to your private account."}
                </p>
                {requiresUpgrade ? (
                  <Link
                    href="/premium"
                    className="button academy-primary-action"
                  >
                    Upgrade for Premium access
                  </Link>
                ) : (
                  <EnrollmentButton
                    authenticated={Boolean(access.user)}
                    courseId={course.id}
                    courseSlug={course.slug}
                    disabledReason={
                      prerequisitesMet
                        ? null
                        : "Complete the prerequisite course before enrolling."
                    }
                    enrollment={enrollment}
                  />
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
      <section className="academy-course-overview">
        <div className="container academy-course-content-grid">
          <article>
            <span className="section-kicker">Course overview</span>
            <AcademyPortableText value={course.description} />
            {course.learningObjectives.length ? (
              <section className="academy-objectives">
                <h2>What you will learn</h2>
                <ul>
                  {course.learningObjectives.map((objective) => (
                    <li key={objective}>
                      <BookOpenCheck size={17} aria-hidden="true" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {course.targetAudience.length ? (
              <section className="academy-objectives">
                <h2>Who this course is for</h2>
                <ul>
                  {course.targetAudience.map((audience) => (
                    <li key={audience}>
                      <UserRound size={17} aria-hidden="true" />
                      {audience}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {course.prerequisiteCourseIds.length ? (
              <section className="academy-course-prerequisites">
                <h2>Prerequisites</h2>
                <p>
                  This course requires completion of{" "}
                  {course.prerequisiteCourseIds.length} prerequisite{" "}
                  {course.prerequisiteCourseIds.length === 1
                    ? "course"
                    : "courses"}
                  . Your account is checked before enrollment.
                </p>
              </section>
            ) : null}
          </article>
          <aside className="academy-course-details">
            <h2>Course details</h2>
            <dl>
              <div>
                <dt>Difficulty</dt>
                <dd>{course.difficulty}</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{formatAcademyDuration(course.durationMinutes)}</dd>
              </div>
              <div>
                <dt>Access</dt>
                <dd>{course.accessLevel}</dd>
              </div>
              <div>
                <dt>Certificate</dt>
                <dd>
                  {course.certificateEnabled ? "Eligible" : "Not included"}
                </dd>
              </div>
            </dl>
            {course.certificateEnabled ? (
              <p>
                <Award size={17} aria-hidden="true" />
                Certificate eligibility is based on verified course completion.
              </p>
            ) : null}
          </aside>
        </div>
      </section>
      <section className="academy-section academy-curriculum-section">
        <div className="container">
          <div className="academy-section-heading">
            <div>
              <span className="section-kicker">Curriculum</span>
              <h2>Course modules and lessons</h2>
            </div>
            <p>
              Lesson bodies remain protected until enrollment and access checks
              pass.
            </p>
          </div>
          <CourseCurriculum course={course} />
        </div>
      </section>
      {relatedCourses.length ? (
        <section className="academy-section academy-related-courses">
          <div className="container">
            <div className="academy-section-heading">
              <div>
                <span className="section-kicker">Continue learning</span>
                <h2>Related Academy courses</h2>
              </div>
            </div>
            <AcademyCatalogGrid courses={relatedCourses} />
          </div>
        </section>
      ) : null}
      <section className="academy-disclaimer">
        <div className="container">
          <strong>Educational risk notice</strong>
          <p>
            This course is educational content, not personalized investment
            advice. Trading can result in substantial losses.
          </p>
        </div>
      </section>
    </>
  );
}
