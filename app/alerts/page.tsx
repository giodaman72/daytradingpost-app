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
import { localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: locale === "es" ? "Alertas inteligentes" : "Smart Alerts",
    robots: { index: false, follow: false },
  };
}
export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const locale = await getRequestLocale();
  const spanish = locale === "es";
  const access = await getMembershipAccess();
  if (!access.user)
    redirect(
      `${localizeHref("/login", locale)}?next=${encodeURIComponent(
        localizeHref("/alerts", locale),
      )}`,
    );
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
          <span className="section-kicker">
            {spanish
              ? "Seguimiento evaluado en el servidor"
              : "Server-evaluated monitoring"}
          </span>
          <h1>{spanish ? "Alertas inteligentes" : "Smart alerts"}</h1>
          <p>
            {spanish
              ? "Revisa condiciones de mercado, editoriales, de análisis y eventos económicos sin tratar datos ausentes o simulados como activadores."
              : "Review market, editorial, analysis, and economic-event conditions without treating missing or simulated data as a trigger."}
          </p>
          <div className="smart-actions">
            <Link className="button" href={localizeHref("/alerts/new", locale)}>
              {spanish ? "Crear alerta" : "Create alert"}
            </Link>
            <Link href={localizeHref("/alerts/history", locale)}>
              {spanish ? "Historial de alertas" : "Alert history"}
            </Link>
          </div>
        </div>
      </section>
      <section className="smart-content">
        <div className="container">
          <form className="smart-filters" method="get">
            <label>
              {spanish ? "Estado" : "Status"}
              <select name="status" defaultValue={query.status ?? ""}>
                <option value="">{spanish ? "Todas" : "All"}</option>
                <option value="active">{spanish ? "Activa" : "Active"}</option>
                <option value="paused">{spanish ? "Pausada" : "Paused"}</option>
                <option value="triggered">
                  {spanish ? "Activada" : "Triggered"}
                </option>
                <option value="expired">
                  {spanish ? "Caducada" : "Expired"}
                </option>
              </select>
            </label>
            <label>
              {spanish ? "Canal" : "Channel"}
              <select name="channel" defaultValue={query.channel ?? ""}>
                <option value="">{spanish ? "Todos" : "All"}</option>
                <option value="dashboard">Dashboard</option>
                <option value="email">Email</option>
              </select>
            </label>
            <label>
              {spanish ? "Instrumento" : "Instrument"}
              <select name="instrument" defaultValue={query.instrument ?? ""}>
                <option value="">{spanish ? "Todos" : "All"}</option>
                {INSTRUMENTS.map((instrument) => (
                  <option key={instrument.slug} value={instrument.slug}>
                    {instrument.symbol} — {instrument.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {spanish ? "Tipo de alerta" : "Alert type"}
              <select name="type" defaultValue={query.type ?? ""}>
                <option value="">{spanish ? "Todos" : "All"}</option>
                {ALERT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {spanish ? "Activada el" : "Triggered on"}
              <input
                defaultValue={query.triggeredDate ?? ""}
                name="triggeredDate"
                type="date"
              />
            </label>
            <button type="submit">
              {spanish ? "Aplicar filtros" : "Apply filters"}
            </button>
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
