import { AlertSkeleton } from "@/components/alerts/AlertSkeleton";
export default function Loading() {
  return (
    <main className="smart-page">
      <section className="smart-content">
        <div className="container">
          <AlertSkeleton />
        </div>
      </section>
    </main>
  );
}
