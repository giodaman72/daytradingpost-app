export default function AcademyLoading() {
  return (
    <section
      className="academy-loading"
      aria-busy="true"
      aria-label="Loading Academy"
    >
      <div className="container">
        <div className="academy-loading-line short" />
        <div className="academy-loading-line title" />
        <div className="academy-loading-line" />
        <div className="academy-loading-grid">
          <div />
          <div />
          <div />
        </div>
      </div>
    </section>
  );
}
