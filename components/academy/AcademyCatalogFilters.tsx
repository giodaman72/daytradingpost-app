import Link from "next/link";
import type { AcademyCatalogFilters as CatalogFilters } from "@/lib/academy/academyCatalog";

type AcademyCatalogFiltersProps = {
  action?: string;
  categories?: Array<{ slug: string; title: string }>;
  filters: CatalogFilters;
  instructors?: Array<{ name: string; slug: string }>;
};

export function AcademyCatalogFilters({
  action = "/academy/courses",
  categories = [],
  filters,
  instructors = [],
}: AcademyCatalogFiltersProps) {
  return (
    <form className="academy-catalog-filters" action={action}>
      <div className="academy-search-field">
        <label htmlFor="academy-query">Search courses</label>
        <input
          id="academy-query"
          name="query"
          type="search"
          defaultValue={filters.query}
          placeholder="Search topics, instructors, or skills"
        />
      </div>
      <div>
        <label htmlFor="academy-difficulty">Difficulty</label>
        <select
          id="academy-difficulty"
          name="difficulty"
          defaultValue={filters.difficulty}
        >
          <option value="all">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <div>
        <label htmlFor="academy-access">Access</label>
        <select id="academy-access" name="access" defaultValue={filters.access}>
          <option value="all">All access</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>
      </div>
      <div>
        <label htmlFor="academy-category">Category</label>
        <select
          id="academy-category"
          name="category"
          defaultValue={filters.category}
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="academy-instructor">Instructor</label>
        <select
          id="academy-instructor"
          name="instructor"
          defaultValue={filters.instructor}
        >
          <option value="all">All instructors</option>
          {instructors.map((instructor) => (
            <option key={instructor.slug} value={instructor.slug}>
              {instructor.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="academy-duration">Duration</label>
        <select
          id="academy-duration"
          name="duration"
          defaultValue={filters.duration}
        >
          <option value="all">Any duration</option>
          <option value="under-60">Under 1 hour</option>
          <option value="60-180">1–3 hours</option>
          <option value="over-180">Over 3 hours</option>
        </select>
      </div>
      <div>
        <label htmlFor="academy-sort">Sort</label>
        <select id="academy-sort" name="sort" defaultValue={filters.sort}>
          <option value="recommended">Recommended</option>
          <option value="newest">Newest</option>
          <option value="title">Title</option>
          <option value="shortest">Shortest duration</option>
          <option value="longest">Longest duration</option>
          <option value="difficulty">Difficulty</option>
        </select>
      </div>
      <button className="button" type="submit">
        Apply filters
      </button>
      <Link href={action} className="academy-clear-filters">
        Clear filters
      </Link>
    </form>
  );
}
