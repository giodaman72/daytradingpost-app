import type { Metadata } from "next";
import Link from "next/link";
import { LearningPathEmptyState } from "@/components/academy/learning-paths/LearningPathEmptyState";
import { LearningPathGrid } from "@/components/academy/learning-paths/LearningPathGrid";
import { listAcademyLearningPaths } from "@/lib/academy/learningPaths/learningPathService";
import type { AcademyAccessLevel, AcademyDifficulty } from "@/types/academy";

type LearningPathsPageProps = {
  searchParams: Promise<{
    access?: string | string[];
    category?: string | string[];
    difficulty?: string | string[];
    query?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "Academy Learning Paths",
  description:
    "Follow guided DayTradingPost Academy course sequences with clear prerequisites, completion rules and verified progress.",
  alternates: { canonical: "/academy/learning-paths" },
};

const difficultyValues = new Set<AcademyDifficulty>([
  "beginner",
  "intermediate",
  "advanced",
]);
const accessValues = new Set<AcademyAccessLevel>(["free", "premium"]);

export default async function LearningPathsPage({
  searchParams,
}: LearningPathsPageProps) {
  const raw = await searchParams;
  const firstValue = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;
  const rawQuery = firstValue(raw.query);
  const rawDifficulty = firstValue(raw.difficulty);
  const rawAccess = firstValue(raw.access);
  const rawCategory = firstValue(raw.category);
  const query = rawQuery?.trim().toLowerCase().slice(0, 80) ?? "";
  const difficulty = difficultyValues.has(rawDifficulty as AcademyDifficulty)
    ? (rawDifficulty as AcademyDifficulty)
    : null;
  const access = accessValues.has(rawAccess as AcademyAccessLevel)
    ? (rawAccess as AcademyAccessLevel)
    : null;
  const category = rawCategory?.trim().toLowerCase().slice(0, 96) ?? "";
  const paths = await listAcademyLearningPaths(100, 0).catch(() => []);
  const categories = Array.from(
    new Map(
      paths
        .filter((path) => path.category)
        .map((path) => [path.category!.slug, path.category!.title]),
    ),
  );
  const filtered = paths.filter((path) => {
    if (difficulty && path.difficulty !== difficulty) return false;
    if (access && path.accessLevel !== access) return false;
    if (category && path.category?.slug !== category) return false;
    if (
      query &&
      !`${path.title} ${path.targetAudience.join(" ")}`
        .toLowerCase()
        .includes(query)
    )
      return false;
    return true;
  });

  return (
    <>
      <section className="academy-catalog-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="container">
          <nav aria-label="Breadcrumb">
            <Link href="/academy">Academy</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Learning paths</span>
          </nav>
          <span className="section-kicker">Guided progression</span>
          <h1>Turn individual courses into a clear learning journey.</h1>
          <p>
            Choose a published path, understand what unlocks next, and track
            required and optional courses from one server-verified plan.
          </p>
        </div>
      </section>
      <section className="academy-section">
        <div className="container">
          <form className="academy-catalog-filters" method="get">
            <div>
              <label htmlFor="path-query">Search learning paths</label>
              <input
                id="path-query"
                name="query"
                type="search"
                defaultValue={rawQuery}
                placeholder="Search by title or audience"
              />
            </div>
            <div>
              <label htmlFor="path-category">Category</label>
              <select
                id="path-category"
                name="category"
                defaultValue={category}
              >
                <option value="">All categories</option>
                {categories.map(([slug, title]) => (
                  <option key={slug} value={slug}>
                    {title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="path-difficulty">Difficulty</label>
              <select
                id="path-difficulty"
                name="difficulty"
                defaultValue={difficulty ?? ""}
              >
                <option value="">All levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label htmlFor="path-access">Access</label>
              <select
                id="path-access"
                name="access"
                defaultValue={access ?? ""}
              >
                <option value="">All access</option>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <button className="button" type="submit">
              Apply filters
            </button>
          </form>
          <p className="academy-catalog-count" role="status">
            {filtered.length} published learning{" "}
            {filtered.length === 1 ? "path" : "paths"}
          </p>
          {filtered.length ? (
            <LearningPathGrid paths={filtered} />
          ) : (
            <LearningPathEmptyState />
          )}
        </div>
      </section>
      <section className="academy-disclaimer">
        <div className="container">
          <strong>Educational risk notice</strong>
          <p>
            Learning paths organize educational content. They are not
            personalized investment advice and do not predict or guarantee
            trading results.
          </p>
        </div>
      </section>
    </>
  );
}
