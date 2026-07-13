export default function AnalysisLoading() {
  return (
    <main className="analysis-page" aria-busy="true" aria-label="Loading analysis">
      <div className="analysis-loading-header" />
      <section className="analysis-loading-shell">
        <div className="container">
          <div className="analysis-loading-line short" />
          <div className="analysis-loading-line title" />
          <div className="analysis-loading-line" />
          <div className="analysis-loading-grid">
            <div className="analysis-loading-card" />
            <div className="analysis-loading-card" />
          </div>
        </div>
      </section>
    </main>
  );
}
