import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountNavigation } from "@/components/account/AccountNavigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getAuthenticatedUser } from "@/lib/auth";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDisplayLabel } from "@/lib/utils";
import { localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import type { Profile } from "@/types/profile";
import type { AppRole } from "@/lib/auth/authorizationRoles";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: locale === "es" ? "Tu cuenta" : "Your account",
    description:
      locale === "es"
        ? "Gestiona tu cuenta y membresía de DayTradingPost."
        : "Manage your DayTradingPost account and membership.",
    robots: { index: false, follow: false },
  };
}

type AccountProfile = Pick<
  Profile,
  "created_at" | "email" | "full_name" | "membership_plan" | "membership_status"
> & { app_role: AppRole };

export default async function AccountPage() {
  const locale = await getRequestLocale();
  const spanish = locale === "es";
  if (!isSupabaseAuthConfigured()) {
    redirect(localizeHref("/login", locale));
  }

  const user = await getAuthenticatedUser();
  if (!user) redirect(localizeHref("/login", locale));

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      "full_name, email, membership_status, membership_plan, created_at, app_role",
    )
    .eq("id", user.id)
    .maybeSingle<AccountProfile>();

  const fullName =
    data?.full_name ||
    user.user_metadata.full_name ||
    (spanish ? "Miembro de DayTradingPost" : "DayTradingPost member");
  const email =
    data?.email ||
    user.email ||
    (spanish ? "Correo no disponible" : "Email unavailable");

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
            <p>{email}</p>
            <AccountNavigation
              isAdmin={data?.app_role === "admin"}
              locale={locale}
            />
          </aside>

          <div className="account-content">
            <div className="account-heading">
              <div>
                <span className="section-kicker">
                  {spanish ? "Resumen de la cuenta" : "Account overview"}
                </span>
                <h2>
                  {spanish
                    ? "Tu espacio de membresía está listo."
                    : "Your membership foundation is ready."}
                </h2>
              </div>
              <span className="account-security-badge">
                {spanish ? "Sesión segura" : "Secure session"}
              </span>
            </div>

            <div className="account-stat-grid">
              <article>
                <span>
                  {spanish ? "Estado de membresía" : "Membership status"}
                </span>
                <strong>
                  {formatDisplayLabel(
                    data?.membership_status,
                    spanish ? "Gratis" : "Free",
                  )}
                </strong>
                <p>
                  {spanish
                    ? "El acceso se comprueba de forma segura en el servidor."
                    : "Access is checked securely on the server."}
                </p>
              </article>
              <article>
                <span>{spanish ? "Plan de membresía" : "Membership plan"}</span>
                <strong>
                  {formatDisplayLabel(
                    data?.membership_plan,
                    spanish ? "Gratis" : "Free",
                  )}
                </strong>
                <p>
                  {spanish
                    ? "Gestiona el estado del pago de Revolut desde la página de facturación."
                    : "Manage Revolut payment status from your billing page."}
                </p>
              </article>
            </div>

            <section
              className="account-details"
              aria-labelledby="account-details-title"
            >
              <h2 id="account-details-title">
                {spanish ? "Datos de la cuenta" : "Account details"}
              </h2>
              <dl>
                <div>
                  <dt>{spanish ? "Nombre completo" : "Full name"}</dt>
                  <dd>{fullName}</dd>
                </div>
                <div>
                  <dt>{spanish ? "Correo electrónico" : "Email"}</dt>
                  <dd>{email}</dd>
                </div>
                <div>
                  <dt>{spanish ? "Miembro desde" : "Member since"}</dt>
                  <dd>
                    {formatDate(data?.created_at, {
                      fallback: spanish
                        ? "Configuración del perfil pendiente"
                        : "Profile setup pending",
                      locale: spanish ? "es-ES" : "en-US",
                    })}
                  </dd>
                </div>
              </dl>
            </section>

            {!data ? (
              <div className="account-notice" role="status">
                {spanish
                  ? "Ejecuta el SQL de perfiles de Supabase para terminar de conectar los datos de membresía."
                  : "Run the Supabase profile SQL to finish connecting membership data."}
              </div>
            ) : null}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
