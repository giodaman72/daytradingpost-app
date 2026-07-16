import { LoadingSkeleton } from "@/components/economic/LoadingSkeleton";

export default function EconomicCalendarLoading() {
  return (
    <main className="economic-page">
      <section className="economic-library">
        <div className="container">
          <LoadingSkeleton />
        </div>
      </section>
    </main>
  );
}
