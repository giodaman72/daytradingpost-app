import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountNavigation } from "@/components/account/AccountNavigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getAuthenticatedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDisplayLabel } from "@/lib/utils";
import type { MembershipRequest } from "@/types/membership";
import type { BillingProfile } from "@/types/profile";
import { localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title:
      locale === "es" ? "Facturación y membresía" : "Billing and membership",
    description:
      locale === "es"
        ? "Revisa tu membresía Premium y el estado de pago de Revolut."
        : "Review your DayTradingPost premium membership and Revolut payment status.",
    robots: { index: false, follow: false },
  };
}

export default async function AccountBillingPage() {
  const locale = await getRequestLocale();
  const spanish = locale === "es";
  const user = await getAuthenticatedUser();
  if (!user)
    redirect(
      `${localizeHref("/login", locale)}?next=${encodeURIComponent(
        localizeHref("/account/billing", locale),
      )}`,
    );

  const supabase = await createClient();
  const [{ data: profileData }, { data: requestData }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "email,full_name,membership_plan,membership_status,payment_customer_id,payment_provider,payment_reference,payment_subscription_id,current_period_end,payment_verified_at",
      )
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("membership_requests")
      .select(
        "id,created_at,membership_plan,payment_reference,payment_subscription_id,provider_mode,status,verified_at",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const profile = profileData as BillingProfile | null;
  const requests = (requestData || []) as MembershipRequest[];
  const fullName =
    profile?.full_name ||
    user.user_metadata.full_name ||
    (spanish ? "Miembro de DayTradingPost" : "DayTradingPost member");

  return (
    <main className="account-page">
      <Header />
      <section className="account-shell">
        <div className="hero-grid" aria-hidden="true" />
        <div className="container account-layout">
          <aside className="account-sidebar">
            <span className="section-kicker">
              {spanish ? "Área de miembros" : "Member area"}
            </span>
            <h1>{fullName}</h1>
            <p>{profile?.email || user.email}</p>
            <AccountNavigation current="billing" locale={locale} />
          </aside>

          <div className="account-content">
            <div className="account-heading">
              <div>
                <span className="section-kicker">
                  {spanish ? "Facturación y membresía" : "Billing & membership"}
                </span>
                <h2>
                  {spanish
                    ? "Estado de tu membresía de Revolut."
                    : "Your Revolut membership status."}
                </h2>
              </div>
              <span
                className={`membership-status-badge status-${profile?.membership_status || "free"}`}
              >
                {formatDisplayLabel(profile?.membership_status || "free")}
              </span>
            </div>

            <div className="account-stat-grid">
              <article>
                <span>{spanish ? "Plan actual" : "Current plan"}</span>
                <strong>
                  {formatDisplayLabel(profile?.membership_plan || "free")}
                </strong>
                <p>
                  {spanish ? "Proveedor de pago" : "Payment provider"}:{" "}
                  {formatDisplayLabel(profile?.payment_provider)}
                </p>
              </article>
              <article>
                <span>
                  {spanish ? "Fin del periodo actual" : "Current period ends"}
                </span>
                <strong>
                  {formatDate(profile?.current_period_end, {
                    locale: spanish ? "es-ES" : "en-US",
                  })}
                </strong>
                <p>
                  {spanish ? "Verificado" : "Verified"}:{" "}
                  {formatDate(profile?.payment_verified_at, {
                    locale: spanish ? "es-ES" : "en-US",
                  })}
                </p>
              </article>
            </div>

            <section
              className="account-details"
              aria-labelledby="payment-details-title"
            >
              <h2 id="payment-details-title">
                {spanish ? "Datos de pago" : "Payment details"}
              </h2>
              <dl>
                <div>
                  <dt>
                    {spanish ? "Referencia de pago" : "Payment reference"}
                  </dt>
                  <dd className="reference-value">
                    {profile?.payment_reference ||
                      (spanish
                        ? "No se ha iniciado ningún pago"
                        : "No payment started")}
                  </dd>
                </div>
                <div>
                  <dt>{spanish ? "ID de suscripción" : "Subscription ID"}</dt>
                  <dd className="reference-value">
                    {profile?.payment_subscription_id ||
                      (spanish
                        ? "Modo de enlace de pago o aún no creado"
                        : "Payment-link mode or not created")}
                  </dd>
                </div>
              </dl>
              {profile?.membership_status === "pending" ? (
                <div className="account-notice" role="status">
                  {spanish
                    ? "Tu solicitud está pendiente de verificación. Las compras mediante enlace de pago requieren que un administrador confirme el pago antes de conceder el acceso."
                    : "Your request is pending verification. Payment-link purchases require an administrator to confirm payment before access is granted."}
                </div>
              ) : null}
            </section>

            <section
              className="billing-history"
              aria-labelledby="billing-history-title"
            >
              <div className="billing-history-heading">
                <h2 id="billing-history-title">
                  {spanish
                    ? "Solicitudes recientes de membresía"
                    : "Recent membership requests"}
                </h2>
                <Link
                  href={localizeHref("/premium", locale)}
                  className="text-link"
                >
                  {spanish ? "Ver planes" : "View plans"} →
                </Link>
              </div>
              {requests.length ? (
                <ul>
                  {requests.map((item) => (
                    <li key={item.id}>
                      <div>
                        <strong>
                          {formatDisplayLabel(item.membership_plan)}
                        </strong>
                        <span>
                          {formatDate(item.created_at, {
                            locale: spanish ? "es-ES" : "en-US",
                          })}
                        </span>
                      </div>
                      <code>{item.payment_reference}</code>
                      <span
                        className={`membership-status-badge status-${item.status}`}
                      >
                        {formatDisplayLabel(item.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="account-empty-state">
                  {spanish
                    ? "Todavía no hay solicitudes de membresía."
                    : "No membership requests yet."}
                </p>
              )}
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
