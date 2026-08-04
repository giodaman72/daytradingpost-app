import Link from "next/link";
import type { AcademyCatalogFilters as CatalogFilters } from "@/lib/academy/academyCatalog";
import { localizeHref, type Locale } from "@/lib/i18n/config";

type AcademyCatalogFiltersProps = {
  action?: string;
  categories?: Array<{ slug: string; title: string }>;
  filters: CatalogFilters;
  instructors?: Array<{ name: string; slug: string }>;
  locale?: Locale;
};

export function AcademyCatalogFilters({
  action = "/academy/courses",
  categories = [],
  filters,
  instructors = [],
  locale = "en",
}: AcademyCatalogFiltersProps) {
  const spanish = locale === "es";
  const localizedAction = localizeHref(action, locale);
  return (
    <form className="academy-catalog-filters" action={localizedAction}>
      <div className="academy-search-field">
        <label htmlFor="academy-query">
          {spanish ? "Buscar cursos" : "Search courses"}
        </label>
        <input
          id="academy-query"
          name="query"
          type="search"
          defaultValue={filters.query}
          placeholder={
            spanish
              ? "Buscar temas, instructores o habilidades"
              : "Search topics, instructors, or skills"
          }
        />
      </div>
      <div>
        <label htmlFor="academy-difficulty">
          {spanish ? "Dificultad" : "Difficulty"}
        </label>
        <select
          id="academy-difficulty"
          name="difficulty"
          defaultValue={filters.difficulty}
        >
          <option value="all">
            {spanish ? "Todos los niveles" : "All levels"}
          </option>
          <option value="beginner">
            {spanish ? "Principiante" : "Beginner"}
          </option>
          <option value="intermediate">
            {spanish ? "Intermedio" : "Intermediate"}
          </option>
          <option value="advanced">{spanish ? "Avanzado" : "Advanced"}</option>
        </select>
      </div>
      <div>
        <label htmlFor="academy-access">{spanish ? "Acceso" : "Access"}</label>
        <select id="academy-access" name="access" defaultValue={filters.access}>
          <option value="all">
            {spanish ? "Todos los accesos" : "All access"}
          </option>
          <option value="free">{spanish ? "Gratis" : "Free"}</option>
          <option value="premium">Premium</option>
        </select>
      </div>
      <div>
        <label htmlFor="academy-category">
          {spanish ? "Categoría" : "Category"}
        </label>
        <select
          id="academy-category"
          name="category"
          defaultValue={filters.category}
        >
          <option value="all">
            {spanish ? "Todas las categorías" : "All categories"}
          </option>
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
          <option value="all">
            {spanish ? "Todos los instructores" : "All instructors"}
          </option>
          {instructors.map((instructor) => (
            <option key={instructor.slug} value={instructor.slug}>
              {instructor.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="academy-duration">
          {spanish ? "Duración" : "Duration"}
        </label>
        <select
          id="academy-duration"
          name="duration"
          defaultValue={filters.duration}
        >
          <option value="all">
            {spanish ? "Cualquier duración" : "Any duration"}
          </option>
          <option value="under-60">
            {spanish ? "Menos de 1 hora" : "Under 1 hour"}
          </option>
          <option value="60-180">{spanish ? "1–3 horas" : "1–3 hours"}</option>
          <option value="over-180">
            {spanish ? "Más de 3 horas" : "Over 3 hours"}
          </option>
        </select>
      </div>
      <div>
        <label htmlFor="academy-sort">{spanish ? "Ordenar" : "Sort"}</label>
        <select id="academy-sort" name="sort" defaultValue={filters.sort}>
          <option value="recommended">
            {spanish ? "Recomendados" : "Recommended"}
          </option>
          <option value="newest">{spanish ? "Más recientes" : "Newest"}</option>
          <option value="title">{spanish ? "Título" : "Title"}</option>
          <option value="shortest">
            {spanish ? "Menor duración" : "Shortest duration"}
          </option>
          <option value="longest">
            {spanish ? "Mayor duración" : "Longest duration"}
          </option>
          <option value="difficulty">
            {spanish ? "Dificultad" : "Difficulty"}
          </option>
        </select>
      </div>
      <button className="button" type="submit">
        {spanish ? "Aplicar filtros" : "Apply filters"}
      </button>
      <Link href={localizedAction} className="academy-clear-filters">
        {spanish ? "Limpiar filtros" : "Clear filters"}
      </Link>
    </form>
  );
}
