export default function VerificationLoading() {
  return (
    <main className="certificate-route-loading" aria-busy="true">
      <span className="section-kicker">Certificate verification</span>
      <h1>Checking certificate status…</h1>
      <p role="status">Loading the public completion record.</p>
    </main>
  );
}
