export default function RecommendationsLoading() {
  return (
    <main
      className="dashboard-page"
      aria-busy="true"
      aria-label="Loading recommendations"
    >
      <div className="container academy-recommendation-grid">
        {Array.from({ length: 3 }, (_, index) => (
          <div className="academy-skeleton-card" key={index} />
        ))}
      </div>
    </main>
  );
}
