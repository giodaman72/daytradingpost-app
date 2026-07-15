import Link from "next/link";
export default function NotFound() {
  return (
    <main className="smart-page">
      <section className="smart-content">
        <div className="container smart-empty">
          <h1>Alert not found</h1>
          <p>It may have been removed or belongs to another member.</p>
          <Link href="/alerts">Return to alerts</Link>
        </div>
      </section>
    </main>
  );
}
