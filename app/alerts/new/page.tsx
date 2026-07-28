import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AlertForm } from "@/components/alerts/AlertForm";
import { getMembershipAccess } from "@/lib/membership/access";
export default async function NewAlertPage({
  searchParams,
}: {
  searchParams: Promise<{
    instrument?: string;
    event?: string;
    type?: string;
    minutes?: string;
    error?: string;
  }>;
}) {
  const access = await getMembershipAccess();
  if (!access.user) redirect("/login?next=/alerts/new");
  const query = await searchParams;
  return (
    <main className="smart-page">
      <Header />
      <section className="smart-hero compact">
        <div className="container">
          <span className="section-kicker">Server-authorized</span>
          <h1>Create smart alert</h1>
          <p>
            Only verified, sufficiently fresh source data can trigger an alert.
          </p>
        </div>
      </section>
      <section className="smart-content">
        <div className="container narrow">
          {query.error ? (
            <p className="smart-message error" role="alert">
              {query.error}
            </p>
          ) : null}
          <AlertForm
            emailAllowed={access.hasPremiumAccess}
            instrument={query.instrument}
            eventId={query.event}
            defaultType={query.type}
            threshold={query.minutes}
          />
        </div>
      </section>
      <Footer />
    </main>
  );
}
