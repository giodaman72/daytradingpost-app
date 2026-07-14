import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountNavigation } from "@/components/account/AccountNavigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/supabase/auth";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Your account",
  description: "Manage your DayTradingPost account and membership.",
  robots: { index: false, follow: false },
};

type Profile = {
  full_name: string | null;
  email: string;
  membership_status: string;
  membership_plan: string;
  created_at: string;
};

function displayMembership(value: string | null | undefined) {
  if (!value) return "Free";
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function AccountPage() {
  if (!isSupabaseAuthConfigured()) {
    redirect("/login");
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("full_name, email, membership_status, membership_plan, created_at")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const fullName = data?.full_name || user.user_metadata.full_name || "DayTradingPost member";
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
                <strong>{displayMembership(data?.membership_status)}</strong>
                <p>Access is checked securely on the server.</p>
              </article>
              <article>
                <span>Membership plan</span>
                <strong>{displayMembership(data?.membership_plan)}</strong>
                <p>Premium plan management will be added in a future sprint.</p>
              </article>
            </div>

            <section className="account-details" aria-labelledby="account-details-title">
              <h2 id="account-details-title">Account details</h2>
              <dl>
                <div><dt>Full name</dt><dd>{fullName}</dd></div>
                <div><dt>Email</dt><dd>{email}</dd></div>
                <div>
                  <dt>Member since</dt>
                  <dd>{data?.created_at ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(data.created_at)) : "Profile setup pending"}</dd>
                </div>
              </dl>
            </section>

            {!data ? (
              <div className="account-notice" role="status">
                Run the Supabase profile SQL to finish connecting membership data.
              </div>
            ) : null}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
