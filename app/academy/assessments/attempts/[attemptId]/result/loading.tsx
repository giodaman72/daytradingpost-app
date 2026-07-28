export default function AssessmentResultLoading() {
  return (
    <section className="academy-assessment-page" aria-busy="true">
      <div className="container academy-loading-shell">
        <span className="academy-skeleton academy-skeleton-kicker" />
        <span className="academy-skeleton academy-skeleton-title" />
        <span className="academy-skeleton academy-skeleton-card" />
      </div>
    </section>
  );
}
