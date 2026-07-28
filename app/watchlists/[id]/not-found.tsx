import Link from "next/link";
export default function NotFound() {
  return (
    <main className="smart-page">
      <section className="smart-content">
        <div className="container smart-empty">
          <h1>Watchlist not found</h1>
          <p>It may have been removed or belongs to another account.</p>
          <Link href="/watchlists">Return to watchlists</Link>
        </div>
      </section>
    </main>
  );
}
