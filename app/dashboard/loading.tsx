const panels = Array.from(
  { length: 8 },
  (_, index) => `dashboard-loading-${index}`,
);

export default function DashboardLoading() {
  return (
    <main
      className="dashboard-page dashboard-loading"
      aria-busy="true"
      aria-label="Loading trader dashboard"
    >
      <div className="dashboard-loading-header" />
      <div className="dashboard-shell">
        <aside className="dashboard-loading-sidebar" aria-hidden="true" />
        <div className="dashboard-main">
          <div className="dashboard-loading-welcome" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="dashboard-grid" aria-hidden="true">
            {panels.map((panel) => (
              <div className="dashboard-loading-panel" key={panel}>
                <i />
                <i />
                <i />
              </div>
            ))}
          </div>
          <p className="sr-only" role="status">
            Loading your market dashboard…
          </p>
        </div>
      </div>
    </main>
  );
}
