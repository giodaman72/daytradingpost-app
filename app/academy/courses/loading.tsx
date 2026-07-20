export default function CoursesLoading() {
  return (
    <section className="academy-section" aria-busy="true">
      <div className="container academy-loading-shell">
        <span className="academy-skeleton academy-skeleton-kicker" />
        <span className="academy-skeleton academy-skeleton-title" />
        <div className="academy-loading-grid" aria-label="Loading courses">
          <span className="academy-skeleton academy-skeleton-card" />
          <span className="academy-skeleton academy-skeleton-card" />
          <span className="academy-skeleton academy-skeleton-card" />
        </div>
      </div>
    </section>
  );
}
