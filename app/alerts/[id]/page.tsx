import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AlertStatusBadge } from "@/components/alerts/AlertStatusBadge";
import { AlertTriggerSummary } from "@/components/alerts/AlertTriggerSummary";
import { ConfirmSubmitButton } from "@/components/ui/ConfirmSubmitButton";
import { getMembershipAccess } from "@/lib/membership/access";
import { getAlertById } from "@/lib/alerts";
import {
  deleteAlertAction,
  pauseAlertAction,
  resumeAlertAction,
} from "../actions";
export default async function AlertPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const access = await getMembershipAccess();
  const { id } = await params;
  if (!access.user) redirect(`/login?next=/alerts/${id}`);
  const [alert, query] = await Promise.all([getAlertById(id), searchParams]);
  if (!alert) notFound();
  return (
    <main className="smart-page">
      <Header />
      <section className="smart-hero compact">
        <div className="container">
          <AlertStatusBadge status={alert.status} />
          <h1>{alert.name}</h1>
          <p>
            Created{" "}
            <time dateTime={alert.createdAt}>
              {new Date(alert.createdAt).toLocaleDateString("en-US")}
            </time>
          </p>
        </div>
      </section>
      <section className="smart-content">
        <div className="container narrow">
          {query.notice ? (
            <p className="smart-message success" role="status">
              {query.notice}
            </p>
          ) : null}
          <AlertTriggerSummary alert={alert} />
          <div className="smart-actions">
            <Link href={`/alerts/${id}/edit`}>Edit alert</Link>
            {alert.status === "active" ? (
              <form action={pauseAlertAction}>
                <input type="hidden" name="id" value={id} />
                <button type="submit">Pause</button>
              </form>
            ) : (
              <form action={resumeAlertAction}>
                <input type="hidden" name="id" value={id} />
                <button type="submit">Resume</button>
              </form>
            )}
            <form action={deleteAlertAction}>
              <input type="hidden" name="id" value={id} />
              <ConfirmSubmitButton
                className="danger-link"
                message="Delete this alert and its history?"
              >
                Delete
              </ConfirmSubmitButton>
            </form>
          </div>
          <p className="smart-disclosure">
            Evaluation occurs on the server. Delayed source data is disclosed,
            stale values are rejected, and simulated values cannot trigger
            production alerts.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
