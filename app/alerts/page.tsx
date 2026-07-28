import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AlertCard } from "@/components/alerts/AlertCard";
import { AlertEmptyState } from "@/components/alerts/AlertEmptyState";
import { INSTRUMENTS } from "@/constants/instruments";
import { getMembershipAccess } from "@/lib/membership/access";
import { getUserAlerts } from "@/lib/alerts";
import { ALERT_TYPES } from "@/types/alert";
export const metadata: Metadata = {
  title: "Smart Alerts",
  robots: { index: false, follow: false },
};
export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const access = await getMembershipAccess();
  if (!access.user) redirect("/login?next=/alerts");
  const query = await searchParams;
  const triggeredDate = query.triggeredDate
    ? new Date(`${query.triggeredDate}T00:00:00.000Z`)
    : null;
  const alerts = (await getUserAlerts()).filter(
    (alert) =>
      (!query.status || alert.status === query.status) &&
      (!query.instrument || alert.instrumentSlug === query.instrument) &&
      (!query.type || alert.alertType === query.type) &&
      (!query.channel ||
        alert.channels.includes(query.channel as "dashboard" | "email")) &&
      (!triggeredDate ||
        (!Number.isNaN(triggeredDate.getTime()) &&
          alert.lastTriggeredAt !== null &&
          new Date(alert.lastTriggeredAt) >= triggeredDate &&
          new Date(alert.lastTriggeredAt) <
            new Date(triggeredDate.getTime() + 86_400_000))),
  );
  return (
    <main className="smart-page">
      <Header />
      <section className="smart-hero">
        <div className="container">
          <span className="section-kicker">Server-evaluated monitoring</span>
          <h1>Smart alerts</h1>
          <p>
            Review market, editorial, analysis, and economic-event conditions
            without treating missing or simulated data as a trigger.
          </p>
          <div className="smart-actions">
            <Link className="button" href="/alerts/new">
              Create alert
            </Link>
            <Link href="/alerts/history">Alert history</Link>
          </div>
        </div>
      </section>
      <section className="smart-content">
        <div className="container">
          <form className="smart-filters" method="get">
            <label>
              Status
              <select name="status" defaultValue={query.status ?? ""}>
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="triggered">Triggered</option>
                <option value="expired">Expired</option>
              </select>
            </label>
            <label>
              Channel
              <select name="channel" defaultValue={query.channel ?? ""}>
                <option value="">All</option>
                <option value="dashboard">Dashboard</option>
                <option value="email">Email</option>
              </select>
            </label>
            <label>
              Instrument
              <select name="instrument" defaultValue={query.instrument ?? ""}>
                <option value="">All</option>
                {INSTRUMENTS.map((instrument) => (
                  <option key={instrument.slug} value={instrument.slug}>
                    {instrument.symbol} — {instrument.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Alert type
              <select name="type" defaultValue={query.type ?? ""}>
                <option value="">All</option>
                {ALERT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Triggered on
              <input
                defaultValue={query.triggeredDate ?? ""}
                name="triggeredDate"
                type="date"
              />
            </label>
            <button type="submit">Apply filters</button>
          </form>
          {query.notice ? (
            <p className="smart-message success" role="status">
              {query.notice}
            </p>
          ) : null}
          {query.error ? (
            <p className="smart-message error" role="alert">
              {query.error}
            </p>
          ) : null}
          {alerts.length ? (
            <div className="smart-grid">
              {alerts.map((alert) => (
                <AlertCard alert={alert} key={alert.id} />
              ))}
            </div>
          ) : (
            <AlertEmptyState />
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
