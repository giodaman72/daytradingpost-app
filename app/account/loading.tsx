export default function AccountLoading() {
  return (
    <main className="account-page" aria-busy="true" aria-label="Loading account">
      <div className="auth-loading-header" />
      <section className="account-shell">
        <div className="container account-layout">
          <div className="account-loading-sidebar" />
          <div className="account-loading-content" />
        </div>
      </section>
    </main>
  );
}
