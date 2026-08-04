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
import { AcademyReviewForm } from "@/components/academy/reviews/AcademyReviewForm";
import { AcademyReviewList } from "@/components/academy/reviews/AcademyReviewList";
import { AcademyReviewSummary } from "@/components/academy/reviews/AcademyReviewSummary";
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
import {
  getCourseReviews,
  getReviewEligibility,
} from "@/lib/academy/reviews/reviewService";
import { languageAlternates, localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";

type CoursePageProps = {
  params: Promise<{ courseSlug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  try {
    const [course, locale] = await Promise.all([
      getAcademyCourse((await params).courseSlug),
      getRequestLocale(),
    ]);
    const canonical = localizeHref(`/academy/courses/${course.slug}`, locale);
    return {
      title: course.seoTitle,
      description: course.seoDescription,
      alternates: {
        canonical,
        languages: languageAlternates(`/academy/courses/${course.slug}`),
      },
      openGraph: {
        title: `${course.seoTitle} | DayTradingPost`,
        description: course.seoDescription,
        type: "website",
        url: canonical,
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
  const [{ courseSlug }, locale] = await Promise.all([
    params,
    getRequestLocale(),
  ]);
  const spanish = locale === "es";
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
      if (legacyCourse)
        redirect(localizeHref(`/academy/courses/${legacyCourse.slug}`, locale));
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
  const reviewData = await getCourseReviews(course.id).catch(() => ({
    aggregate: { averageRating: null, publishedCount: 0 },
    replies: [],
    reviews: [],
  }));
  const reviewEligibility = access.user
    ? await getReviewEligibility(course.slug)
    : null;

  return (
    <>
      {access.user ? (
        <AcademyViewEvent courseId={course.id} name="academy_course_viewed" />
      ) : null}
      <section className="academy-course-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="container">
          <nav aria-label={spanish ? "Ruta de navegación" : "Breadcrumb"}>
            <Link href={localizeHref("/academy", locale)}>
              {spanish ? "Academia" : "Academy"}
            </Link>
            <span aria-hidden="true">/</span>
            <Link href={localizeHref("/academy/courses", locale)}>
              {spanish ? "Cursos" : "Courses"}
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{course.title}</span>
          </nav>
          <div className="academy-course-hero-grid">
            <div>
              <span className={`academy-access-badge ${course.accessLevel}`}>
                {course.accessLevel === "premium" ? (
                  <Crown size={12} aria-hidden="true" />
                ) : null}
                {course.accessLevel === "premium"
                  ? "Premium"
                  : spanish
                    ? "Gratis"
                    : "Free"}{" "}
                {spanish ? "curso" : "course"}
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
                  {course.modules.length} {spanish ? "módulos" : "modules"}
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
                  {enrollment
                    ? spanish
                      ? "Tu curso"
                      : "Your course"
                    : spanish
                      ? "Empieza este curso"
                      : "Start this course"}
                </strong>
                <p>
                  {enrollment
                    ? `${Math.round(enrollment.progressPercent)}% ${spanish ? "completado" : "complete"}`
                    : spanish
                      ? "La inscripción guarda de forma privada tu progreso, evaluaciones, marcadores y notas."
                      : "Enrollment saves lesson, assessment, bookmark and note progress to your private account."}
                </p>
                {requiresUpgrade ? (
                  <Link
                    href={localizeHref("/premium", locale)}
                    className="button academy-primary-action"
                  >
                    {spanish
                      ? "Mejorar a Premium"
                      : "Upgrade for Premium access"}
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
                    locale={locale}
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
            <span className="section-kicker">
              {spanish ? "Resumen del curso" : "Course overview"}
            </span>
            {spanish ? (
              <p className="academy-source-language-note">
                El contenido editorial del curso se conserva en su idioma
                original; la navegación y los controles están disponibles en
                español.
              </p>
            ) : null}
            <AcademyPortableText value={course.description} />
            {course.learningObjectives.length ? (
              <section className="academy-objectives">
                <h2>{spanish ? "Lo que aprenderás" : "What you will learn"}</h2>
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
                <h2>
                  {spanish
                    ? "Para quién es este curso"
                    : "Who this course is for"}
                </h2>
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
                <h2>{spanish ? "Requisitos previos" : "Prerequisites"}</h2>
                <p>
                  {spanish
                    ? "Este curso requiere completar "
                    : "This course requires completion of "}
                  {course.prerequisiteCourseIds.length} prerequisite{" "}
                  {course.prerequisiteCourseIds.length === 1
                    ? spanish
                      ? "curso previo"
                      : "course"
                    : spanish
                      ? "cursos previos"
                      : "courses"}
                  {spanish
                    ? ". Tu cuenta se comprueba antes de la inscripción."
                    : ". Your account is checked before enrollment."}
                </p>
              </section>
            ) : null}
          </article>
          <aside className="academy-course-details">
            <h2>{spanish ? "Detalles del curso" : "Course details"}</h2>
            <dl>
              <div>
                <dt>{spanish ? "Dificultad" : "Difficulty"}</dt>
                <dd>{course.difficulty}</dd>
              </div>
              <div>
                <dt>{spanish ? "Duración" : "Duration"}</dt>
                <dd>{formatAcademyDuration(course.durationMinutes)}</dd>
              </div>
              <div>
                <dt>{spanish ? "Acceso" : "Access"}</dt>
                <dd>{course.accessLevel}</dd>
              </div>
              <div>
                <dt>{spanish ? "Certificado" : "Certificate"}</dt>
                <dd>
                  {course.certificateEnabled
                    ? spanish
                      ? "Disponible"
                      : "Eligible"
                    : spanish
                      ? "No incluido"
                      : "Not included"}
                </dd>
              </div>
            </dl>
            {course.certificateEnabled ? (
              <p>
                <Award size={17} aria-hidden="true" />
                {spanish
                  ? "La disponibilidad del certificado depende de la finalización verificada del curso."
                  : "Certificate eligibility is based on verified course completion."}
              </p>
            ) : null}
          </aside>
        </div>
      </section>
      <section className="academy-section academy-curriculum-section">
        <div className="container">
          <div className="academy-section-heading">
            <div>
              <span className="section-kicker">
                {spanish ? "Programa" : "Curriculum"}
              </span>
              <h2>
                {spanish ? "Módulos y lecciones" : "Course modules and lessons"}
              </h2>
            </div>
            <p>
              {spanish
                ? "El contenido de las lecciones permanece protegido hasta superar las comprobaciones de inscripción y acceso."
                : "Lesson bodies remain protected until enrollment and access checks pass."}
            </p>
          </div>
          <CourseCurriculum course={course} locale={locale} />
        </div>
      </section>
      <section className="academy-section academy-reviews-section">
        <div className="container">
          <div className="academy-section-heading">
            <div>
              <span className="section-kicker">
                {spanish ? "Estudiantes verificados" : "Verified learners"}
              </span>
              <h2>{spanish ? "Reseñas del curso" : "Course reviews"}</h2>
            </div>
            <AcademyReviewSummary aggregate={reviewData.aggregate} />
          </div>
          <AcademyReviewList
            replies={reviewData.replies}
            reviews={reviewData.reviews}
          />
          {reviewEligibility ? (
            <AcademyReviewForm
              courseId={course.id}
              courseSlug={course.slug}
              eligible={reviewEligibility.eligible}
              initial={reviewEligibility.review}
              minimumProgressPercent={reviewEligibility.minimumProgressPercent}
            />
          ) : (
            <p>
              <Link
                href={localizeHref(
                  `/login?next=/academy/courses/${course.slug}`,
                  locale,
                )}
              >
                {spanish ? "Inicia sesión" : "Sign in"}
              </Link>{" "}
              {spanish
                ? "para reseñar un curso en el que estés inscrito."
                : "to review a course you are enrolled in."}
            </p>
          )}
        </div>
      </section>
      {relatedCourses.length ? (
        <section className="academy-section academy-related-courses">
          <div className="container">
            <div className="academy-section-heading">
              <div>
                <span className="section-kicker">
                  {spanish ? "Sigue aprendiendo" : "Continue learning"}
                </span>
                <h2>
                  {spanish ? "Cursos relacionados" : "Related Academy courses"}
                </h2>
              </div>
            </div>
            <AcademyCatalogGrid courses={relatedCourses} locale={locale} />
          </div>
        </section>
      ) : null}
      <section className="academy-disclaimer">
        <div className="container">
          <strong>
            {spanish ? "Aviso educativo de riesgo" : "Educational risk notice"}
          </strong>
          <p>
            {spanish
              ? "Este curso es contenido educativo, no asesoramiento de inversión personalizado. El trading puede generar pérdidas sustanciales."
              : "This course is educational content, not personalized investment advice. Trading can result in substantial losses."}
          </p>
        </div>
      </section>
    </>
  );
}
