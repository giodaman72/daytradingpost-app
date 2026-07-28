import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AlertForm } from "@/components/alerts/AlertForm";
import { getMembershipAccess } from "@/lib/membership/access";
import { getAlertById } from "@/lib/alerts";
export default async function EditAlertPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const access = await getMembershipAccess();
  const { id } = await params;
  if (!access.user) redirect(`/login?next=/alerts/${id}/edit`);
  const [alert, query] = await Promise.all([getAlertById(id), searchParams]);
  if (!alert) notFound();
  return (
    <main className="smart-page">
      <Header />
      <section className="smart-hero compact">
        <div className="container">
          <span className="section-kicker">Alert settings</span>
          <h1>Edit {alert.name}</h1>
        </div>
      </section>
      <section className="smart-content">
        <div className="container narrow">
          {query.error ? (
            <p className="smart-message error" role="alert">
              {query.error}
            </p>
          ) : null}
          <AlertForm alert={alert} emailAllowed={access.hasPremiumAccess} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
