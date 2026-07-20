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

export const metadata: Metadata = {
  title: "Trading Academy",
  description:
    "Build practical trading skills with structured DayTradingPost courses, lessons, assessments and progress tracking.",
  alternates: { canonical: "/academy" },
  openGraph: {
    title: "Trading Academy | DayTradingPost",
    description:
      "Structured, risk-aware trading education for developing active traders.",
    type: "website",
    url: "/academy",
  },
};

export default async function AcademyPage() {
  const courses = await listAcademyCourses(100, 0).catch(() => []);
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
            <span className="section-kicker">Trading Academy 2.0</span>
            <h1>Build trading skill through a structured learning process.</h1>
            <p>
              Follow practical courses, complete focused lessons, test your
              understanding and track progress in one private learner workspace.
            </p>
            <div className="academy-hero-actions">
              <Link href="/academy/courses" className="button">
                Browse courses
              </Link>
              <Link href="/dashboard" className="button button-secondary">
                Open trader dashboard
              </Link>
            </div>
            <form className="academy-hero-search" action="/academy/search">
              <label htmlFor="academy-landing-search">
                Search Academy courses
              </label>
              <div>
                <Search size={18} aria-hidden="true" />
                <input
                  id="academy-landing-search"
                  name="query"
                  type="search"
                  placeholder="Search risk, charts, psychology…"
                />
                <button type="submit">Search</button>
              </div>
            </form>
          </div>
          <div className="academy-hero-panel">
            <span>Learning framework</span>
            <ul>
              <li>
                <BookOpenCheck aria-hidden="true" />
                Structured modules and lessons
              </li>
              <li>
                <BarChart3 aria-hidden="true" />
                Practical market context
              </li>
              <li>
                <CircleCheckBig aria-hidden="true" />
                Assessments and progress
              </li>
              <li>
                <ShieldCheck aria-hidden="true" />
                Risk-first educational guidance
              </li>
            </ul>
          </div>
        </div>
      </section>
      {activeEnrollment && activeCourse ? (
        <section className="academy-continue-section">
          <div className="container academy-continue-card">
            <div>
              <span className="section-kicker">Continue learning</span>
              <h2>{activeCourse.title}</h2>
              <p>
                {Math.round(activeEnrollment.progressPercent)}% complete · Your
                saved lesson progress is private.
              </p>
            </div>
            <Link
              href={`/academy/courses/${activeCourse.slug}/learn`}
              className="button"
            >
              Resume learning
            </Link>
          </div>
        </section>
      ) : null}
      <section className="academy-section">
        <div className="container">
          <div className="academy-section-heading">
            <div>
              <span className="section-kicker">Start learning</span>
              <h2>Featured Academy courses</h2>
            </div>
            <Link href="/academy/courses" className="text-link">
              View full catalog <span aria-hidden="true">→</span>
            </Link>
          </div>
          <AcademyCatalogGrid courses={displayed} />
        </div>
      </section>
      {categories.length ? (
        <section className="academy-category-section">
          <div className="container">
            <div className="academy-section-heading">
              <div>
                <span className="section-kicker">Learning categories</span>
                <h2>Explore by trading skill</h2>
              </div>
            </div>
            <nav
              className="academy-category-links"
              aria-label="Course categories"
            >
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/academy/courses?category=${encodeURIComponent(category.slug)}`}
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
                <span className="section-kicker">Beginner starting point</span>
                <h2>Start with a strong foundation</h2>
              </div>
              <Link
                href="/academy/courses?difficulty=beginner"
                className="text-link"
              >
                View beginner courses <span aria-hidden="true">→</span>
              </Link>
            </div>
            <AcademyCatalogGrid courses={beginnerCourses} />
          </div>
        </section>
      ) : null}
      {recentlyAdded.length ? (
        <section className="academy-section academy-recent-courses">
          <div className="container">
            <div className="academy-section-heading">
              <div>
                <span className="section-kicker">Recently added</span>
                <h2>New Academy courses</h2>
              </div>
            </div>
            <AcademyCatalogGrid courses={recentlyAdded} />
          </div>
        </section>
      ) : null}
      <section className="academy-principles">
        <div className="container">
          <div>
            <span>01</span>
            <h2>Learn the framework</h2>
            <p>
              Understand the concepts before applying them to a live decision.
            </p>
          </div>
          <div>
            <span>02</span>
            <h2>Practice deliberately</h2>
            <p>
              Use repeatable exercises, checkpoints and risk-aware examples.
            </p>
          </div>
          <div>
            <span>03</span>
            <h2>Test understanding</h2>
            <p>Assessments reinforce the process without promising outcomes.</p>
          </div>
        </div>
      </section>
      <section className="academy-disclaimer">
        <div className="container">
          <strong>Educational risk notice</strong>
          <p>
            Academy content is for education and information only. It does not
            provide personalized investment advice, guarantee trading results,
            or remove the risk of loss.
          </p>
        </div>
      </section>
    </>
  );
}
