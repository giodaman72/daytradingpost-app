export default function AuthLoading() {
  return (
    <main
      className="auth-page"
      aria-busy="true"
      aria-label="Loading member access"
    >
      <div className="auth-loading-header" />
      <section className="auth-shell">
        <div className="container auth-layout">
          <div className="auth-loading-copy" />
          <div className="auth-loading-card" />
        </div>
      </section>
    </main>
  );
}
