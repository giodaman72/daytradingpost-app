import { Header } from "@/components/layout/Header";

export default function MembershipPaymentsLoading() {
  return (
    <main className="mi-admin-page">
      <Header />
      <section className="container mi-admin-shell">
        <p role="status">Loading membership payments…</p>
      </section>
    </main>
  );
}
