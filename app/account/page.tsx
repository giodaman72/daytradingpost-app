import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountNavigation } from "@/components/account/AccountNavigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getAuthenticatedUser } from "@/lib/auth";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDisplayLabel } from "@/lib/utils";
import type { Profile } from "@/types/profile";

export const metadata: Metadata = {
  title: "Your account",
  description: "Manage your DayTradingPost account and membership.",
  robots: { index: false, follow: false },
};

type AccountProfile = Pick<
  Profile,
  "created_at" | "email" | "full_name" | "membership_plan" | "membership_status"
>;

export default async function AccountPage() {
  if (!isSupabaseAuthConfigured()) {
    redirect("/login");
  }

  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("full_name, email, membership_status, membership_plan, created_at")
    .eq("id", user.id)
    .maybeSingle<AccountProfile>();

  const fullName =
    data?.full_name || user.user_metadata.full_name || "DayTradingPost member";
  const email = data?.email || user.email || "Email unavailable";

  return (
    <main className="account-page">
      <Header />
      <section className="account-shell">
        <div className="hero-grid" aria-hidden="true" />
        <div className="container account-layout">
          <aside className="account-sidebar">
            <span className="section-kicker">Member area</span>
            <h1>{fullName}</h1>
            <p>{email}</p>
            <AccountNavigation />
          </aside>

          <div className="account-content">
            <div className="account-heading">
              <div>
                <span className="section-kicker">Account overview</span>
                <h2>Your membership foundation is ready.</h2>
              </div>
              <span className="account-security-badge">Secure session</span>
            </div>

            <div className="account-stat-grid">
              <article>
                <span>Membership status</span>
                <strong>
                  {formatDisplayLabel(data?.membership_status, "Free")}
                </strong>
                <p>Access is checked securely on the server.</p>
              </article>
              <article>
                <span>Membership plan</span>
                <strong>
                  {formatDisplayLabel(data?.membership_plan, "Free")}
                </strong>
                <p>Manage Revolut payment status from your billing page.</p>
              </article>
            </div>

            <section
              className="account-details"
              aria-labelledby="account-details-title"
            >
              <h2 id="account-details-title">Account details</h2>
              <dl>
                <div>
                  <dt>Full name</dt>
                  <dd>{fullName}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{email}</dd>
                </div>
                <div>
                  <dt>Member since</dt>
                  <dd>
                    {formatDate(data?.created_at, {
                      fallback: "Profile setup pending",
                    })}
                  </dd>
                </div>
              </dl>
            </section>

            {!data ? (
              <div className="account-notice" role="status">
                Run the Supabase profile SQL to finish connecting membership
                data.
              </div>
            ) : null}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
