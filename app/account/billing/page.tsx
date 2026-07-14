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

export const metadata: Metadata = {
  title: "Billing and membership",
  description:
    "Review your DayTradingPost premium membership and Revolut payment status.",
  robots: { index: false, follow: false },
};

export default async function AccountBillingPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login?next=/account/billing");

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
    "DayTradingPost member";

  return (
    <main className="account-page">
      <Header />
      <section className="account-shell">
        <div className="hero-grid" aria-hidden="true" />
        <div className="container account-layout">
          <aside className="account-sidebar">
            <span className="section-kicker">Member area</span>
            <h1>{fullName}</h1>
            <p>{profile?.email || user.email}</p>
            <AccountNavigation current="billing" />
          </aside>

          <div className="account-content">
            <div className="account-heading">
              <div>
                <span className="section-kicker">Billing & membership</span>
                <h2>Your Revolut membership status.</h2>
              </div>
              <span
                className={`membership-status-badge status-${profile?.membership_status || "free"}`}
              >
                {formatDisplayLabel(profile?.membership_status || "free")}
              </span>
            </div>

            <div className="account-stat-grid">
              <article>
                <span>Current plan</span>
                <strong>
                  {formatDisplayLabel(profile?.membership_plan || "free")}
                </strong>
                <p>
                  Payment provider:{" "}
                  {formatDisplayLabel(profile?.payment_provider)}
                </p>
              </article>
              <article>
                <span>Current period ends</span>
                <strong>{formatDate(profile?.current_period_end)}</strong>
                <p>Verified: {formatDate(profile?.payment_verified_at)}</p>
              </article>
            </div>

            <section
              className="account-details"
              aria-labelledby="payment-details-title"
            >
              <h2 id="payment-details-title">Payment details</h2>
              <dl>
                <div>
                  <dt>Payment reference</dt>
                  <dd className="reference-value">
                    {profile?.payment_reference || "No payment started"}
                  </dd>
                </div>
                <div>
                  <dt>Subscription ID</dt>
                  <dd className="reference-value">
                    {profile?.payment_subscription_id ||
                      "Payment-link mode or not created"}
                  </dd>
                </div>
              </dl>
              {profile?.membership_status === "pending" ? (
                <div className="account-notice" role="status">
                  Your request is pending verification. Payment-link purchases
                  require an administrator to confirm payment before access is
                  granted.
                </div>
              ) : null}
            </section>

            <section
              className="billing-history"
              aria-labelledby="billing-history-title"
            >
              <div className="billing-history-heading">
                <h2 id="billing-history-title">Recent membership requests</h2>
                <Link href="/premium" className="text-link">
                  View plans →
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
                        <span>{formatDate(item.created_at)}</span>
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
                  No membership requests yet.
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
