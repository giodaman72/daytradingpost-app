import { WatchlistSkeleton } from "@/components/watchlists/WatchlistSkeleton";
export default function Loading() {
  return (
    <main className="smart-page">
      <section className="smart-content">
        <div className="container">
          <WatchlistSkeleton />
        </div>
      </section>
    </main>
  );
}
