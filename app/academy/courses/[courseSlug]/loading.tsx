export default function CourseLoading() {
  return (
    <section className="academy-section" aria-busy="true">
      <div className="container academy-loading-shell">
        <span className="academy-skeleton academy-skeleton-kicker" />
        <span className="academy-skeleton academy-skeleton-title" />
        <span className="academy-skeleton academy-skeleton-copy" />
        <span className="academy-skeleton academy-skeleton-card" />
      </div>
    </section>
  );
}
