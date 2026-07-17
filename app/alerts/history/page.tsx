import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AlertHistoryTable } from "@/components/alerts/AlertHistoryTable";
import { getMembershipAccess } from "@/lib/membership/access";
import { getAlertHistory } from "@/lib/alerts";
export default async function AlertHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; notice?: string }>;
}) {
  const access = await getMembershipAccess();
  if (!access.user) redirect("/login?next=/alerts/history");
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const events = await getAlertHistory(25, (page - 1) * 25);
  return (
    <main className="smart-page">
      <Header />
      <section className="smart-hero compact">
        <div className="container">
          <span className="section-kicker">Audit trail</span>
          <h1>Alert history</h1>
          <p>Trigger context and dashboard/email delivery outcomes.</p>
        </div>
      </section>
      <section className="smart-content">
        <div className="container">
          {query.notice ? (
            <p className="smart-message success" role="status">
              {query.notice}
            </p>
          ) : null}
          <AlertHistoryTable events={events} />
          <nav className="smart-pagination" aria-label="Alert history pages">
            {page > 1 ? (
              <Link href={`/alerts/history?page=${page - 1}`}>Previous</Link>
            ) : (
              <span>Previous</span>
            )}
            <span>Page {page}</span>
            {events.length === 25 ? (
              <Link href={`/alerts/history?page=${page + 1}`}>Next</Link>
            ) : (
              <span>Next</span>
            )}
          </nav>
        </div>
      </section>
      <Footer />
    </main>
  );
}
