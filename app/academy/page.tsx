import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  BookOpenCheck,
  CircleCheckBig,
  Search,
  ShieldCheck,
} from "lucide-react";
import { AcademyCatalogGrid } from "@/components/academy/AcademyCatalogGrid";
import { AcademyViewEvent } from "@/components/academy/AcademyViewEvent";
import {
  listAcademyCourses,
  listUserEnrollments,
} from "@/lib/academy/academyService";
import { getCurrentUser } from "@/lib/supabase/auth";
import { languageAlternates, localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const spanish = locale === "es";
  const description = spanish
    ? "Desarrolla habilidades prácticas de trading con cursos, lecciones, evaluaciones y seguimiento del progreso de DayTradingPost."
    : "Build practical trading skills with structured DayTradingPost courses, lessons, assessments and progress tracking.";
  const canonical = localizeHref("/academy", locale);
  return {
    title: spanish ? "Academia de trading" : "Trading Academy",
    description,
    alternates: {
      canonical,
      languages: languageAlternates("/academy"),
    },
    openGraph: {
      title: spanish
        ? "Academia de trading | DayTradingPost"
        : "Trading Academy | DayTradingPost",
      description,
      type: "website",
      url: canonical,
    },
  };
}

export default async function AcademyPage() {
  const [locale, courses] = await Promise.all([
    getRequestLocale(),
    listAcademyCourses(100, 0).catch(() => []),
  ]);
  const spanish = locale === "es";
  const featured = courses.filter((course) => course.featured);
  const displayed = featured.length ? featured : courses.slice(0, 3);
  const beginnerCourses = courses
    .filter((course) => course.difficulty === "beginner")
    .slice(0, 3);
  const recentlyAdded = courses
    .toSorted(
      (left, right) =>
        Date.parse(right.publishedAt ?? "") -
        Date.parse(left.publishedAt ?? ""),
    )
    .slice(0, 3);
  const categories = Array.from(
    new Map(
      courses
        .filter((course) => course.category)
        .map((course) => [
          course.category!.slug,
          {
            slug: course.category!.slug,
            title: course.category!.title,
          },
        ]),
    ).values(),
  ).slice(0, 6);
  const currentUser = await getCurrentUser().catch(() => null);
  const enrollments = currentUser
    ? await listUserEnrollments(20, 0).catch(() => [])
    : [];
  const activeEnrollment = enrollments
    .filter((enrollment) =>
      ["enrolled", "in_progress"].includes(enrollment.status),
    )
    .toSorted(
      (left, right) =>
        Date.parse(right.lastAccessedAt ?? right.enrolledAt) -
        Date.parse(left.lastAccessedAt ?? left.enrolledAt),
    )[0];
  const activeCourse = activeEnrollment
    ? courses.find((course) => course.id === activeEnrollment.courseId)
    : null;
  return (
    <>
      {currentUser ? <AcademyViewEvent name="academy_landing_viewed" /> : null}
      <section className="academy-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-glow hero-glow-one" aria-hidden="true" />
        <div className="container academy-hero-layout">
          <div>
            <span className="section-kicker">Academia de trading 2.0</span>
            <h1>
              {spanish
                ? "Desarrolla tus habilidades con un proceso de aprendizaje estructurado."
                : "Build trading skill through a structured learning process."}
            </h1>
            <p>
              {spanish
                ? "Sigue cursos prácticos, completa lecciones específicas, evalúa tu comprensión y consulta el progreso en un espacio privado."
                : "Follow practical courses, complete focused lessons, test your understanding and track progress in one private learner workspace."}
            </p>
            <div className="academy-hero-actions">
              <Link
                href={localizeHref("/academy/courses", locale)}
                className="button"
              >
                {spanish ? "Explorar cursos" : "Browse courses"}
              </Link>
              <Link
                href={localizeHref("/academy/learning-paths", locale)}
                className="button button-secondary"
              >
                {spanish ? "Explorar itinerarios" : "Explore learning paths"}
              </Link>
              <Link href="/dashboard" className="button button-secondary">
                {spanish ? "Abrir panel del trader" : "Open trader dashboard"}
              </Link>
            </div>
            <form
              className="academy-hero-search"
              action={localizeHref("/academy/search", locale)}
            >
              <label htmlFor="academy-landing-search">
                {spanish
                  ? "Buscar cursos de la Academia"
                  : "Search Academy courses"}
              </label>
              <div>
                <Search size={18} aria-hidden="true" />
                <input
                  id="academy-landing-search"
                  name="query"
                  type="search"
                  placeholder={
                    spanish
                      ? "Buscar riesgo, gráficos, psicología…"
                      : "Search risk, charts, psychology…"
                  }
                />
                <button type="submit">{spanish ? "Buscar" : "Search"}</button>
              </div>
            </form>
          </div>
          <div className="academy-hero-panel">
            <span>
              {spanish ? "Marco de aprendizaje" : "Learning framework"}
            </span>
            <ul>
              <li>
                <BookOpenCheck aria-hidden="true" />
                {spanish
                  ? "Módulos y lecciones estructurados"
                  : "Structured modules and lessons"}
              </li>
              <li>
                <BarChart3 aria-hidden="true" />
                {spanish
                  ? "Contexto práctico de mercado"
                  : "Practical market context"}
              </li>
              <li>
                <CircleCheckBig aria-hidden="true" />
                {spanish
                  ? "Evaluaciones y progreso"
                  : "Assessments and progress"}
              </li>
              <li>
                <ShieldCheck aria-hidden="true" />
                {spanish
                  ? "Formación centrada en el riesgo"
                  : "Risk-first educational guidance"}
              </li>
            </ul>
          </div>
        </div>
      </section>
      {activeEnrollment && activeCourse ? (
        <section className="academy-continue-section">
          <div className="container academy-continue-card">
            <div>
              <span className="section-kicker">
                {spanish ? "Continuar aprendiendo" : "Continue learning"}
              </span>
              <h2>{activeCourse.title}</h2>
              <p>
                {Math.round(activeEnrollment.progressPercent)}%{" "}
                {spanish
                  ? "completado · Tu progreso guardado es privado."
                  : "complete · Your saved lesson progress is private."}
              </p>
            </div>
            <Link
              href={localizeHref(
                `/academy/courses/${activeCourse.slug}/learn`,
                locale,
              )}
              className="button"
            >
              {spanish ? "Continuar curso" : "Resume learning"}
            </Link>
          </div>
        </section>
      ) : null}
      <section className="academy-section">
        <div className="container">
          <div className="academy-section-heading">
            <div>
              <span className="section-kicker">
                {spanish ? "Empieza a aprender" : "Start learning"}
              </span>
              <h2>
                {spanish
                  ? "Cursos destacados de la Academia"
                  : "Featured Academy courses"}
              </h2>
            </div>
            <Link
              href={localizeHref("/academy/courses", locale)}
              className="text-link"
            >
              {spanish ? "Ver catálogo completo" : "View full catalog"}{" "}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <AcademyCatalogGrid courses={displayed} locale={locale} />
        </div>
      </section>
      {categories.length ? (
        <section className="academy-category-section">
          <div className="container">
            <div className="academy-section-heading">
              <div>
                <span className="section-kicker">
                  {spanish
                    ? "Categorías de aprendizaje"
                    : "Learning categories"}
                </span>
                <h2>
                  {spanish
                    ? "Explora por habilidad de trading"
                    : "Explore by trading skill"}
                </h2>
              </div>
            </div>
            <nav
              className="academy-category-links"
              aria-label={
                spanish ? "Categorías de cursos" : "Course categories"
              }
            >
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={localizeHref(
                    `/academy/courses?category=${encodeURIComponent(category.slug)}`,
                    locale,
                  )}
                >
                  {category.title}
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </nav>
          </div>
        </section>
      ) : null}
      {beginnerCourses.length ? (
        <section className="academy-section academy-starting-point">
          <div className="container">
            <div className="academy-section-heading">
              <div>
                <span className="section-kicker">
                  {spanish
                    ? "Punto de partida para principiantes"
                    : "Beginner starting point"}
                </span>
                <h2>
                  {spanish
                    ? "Empieza con una base sólida"
                    : "Start with a strong foundation"}
                </h2>
              </div>
              <Link
                href={localizeHref(
                  "/academy/courses?difficulty=beginner",
                  locale,
                )}
                className="text-link"
              >
                {spanish
                  ? "Ver cursos para principiantes"
                  : "View beginner courses"}{" "}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
            <AcademyCatalogGrid courses={beginnerCourses} locale={locale} />
          </div>
        </section>
      ) : null}
      {recentlyAdded.length ? (
        <section className="academy-section academy-recent-courses">
          <div className="container">
            <div className="academy-section-heading">
              <div>
                <span className="section-kicker">
                  {spanish ? "Añadidos recientemente" : "Recently added"}
                </span>
                <h2>
                  {spanish
                    ? "Nuevos cursos de la Academia"
                    : "New Academy courses"}
                </h2>
              </div>
            </div>
            <AcademyCatalogGrid courses={recentlyAdded} locale={locale} />
          </div>
        </section>
      ) : null}
      <section className="academy-principles">
        <div className="container">
          <div>
            <span>01</span>
            <h2>{spanish ? "Aprende el marco" : "Learn the framework"}</h2>
            <p>
              {spanish
                ? "Comprende los conceptos antes de aplicarlos a una decisión real."
                : "Understand the concepts before applying them to a live decision."}
            </p>
          </div>
          <div>
            <span>02</span>
            <h2>
              {spanish
                ? "Practica de forma deliberada"
                : "Practice deliberately"}
            </h2>
            <p>
              {spanish
                ? "Utiliza ejercicios repetibles, puntos de control y ejemplos conscientes del riesgo."
                : "Use repeatable exercises, checkpoints and risk-aware examples."}
            </p>
          </div>
          <div>
            <span>03</span>
            <h2>{spanish ? "Evalúa tu comprensión" : "Test understanding"}</h2>
            <p>
              {spanish
                ? "Las evaluaciones refuerzan el proceso sin prometer resultados."
                : "Assessments reinforce the process without promising outcomes."}
            </p>
          </div>
        </div>
      </section>
      <section className="academy-disclaimer">
        <div className="container">
          <strong>
            {spanish ? "Aviso educativo de riesgo" : "Educational risk notice"}
          </strong>
          <p>
            {spanish
              ? "El contenido de la Academia es únicamente educativo e informativo. No proporciona asesoramiento de inversión personalizado, garantiza resultados ni elimina el riesgo de pérdida."
              : "Academy content is for education and information only. It does not provide personalized investment advice, guarantee trading results, or remove the risk of loss."}
          </p>
        </div>
      </section>
    </>
  );
}
