export default function AcademyAdminLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading Academy administration"
      className="academy-admin-page"
    >
      <div className="container academy-admin-card-grid">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="academy-skeleton-card" key={index} />
        ))}
      </div>
    </main>
  );
}
