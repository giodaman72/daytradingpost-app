import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MEMBERSHIP_PLANS } from "@/constants/membership";
import { requireAdmin } from "@/lib/auth/adminAuthorization";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { formatDate, formatDisplayLabel } from "@/lib/utils";
import type { MembershipPlan, PaymentProviderMode } from "@/types/membership";
import { confirmMembershipPayment, retryPurchaseConfirmation } from "./actions";

export const metadata: Metadata = {
  title: "Membership payments",
  description: "Verify Revolut purchases and manage buyer confirmations.",
  robots: { index: false, follow: false },
};

type AdminRequest = {
  confirmation_email_sent_at: string | null;
  created_at: string;
  id: string;
  membership_plan: MembershipPlan;
  payment_reference: string;
  provider_mode: PaymentProviderMode;
  provider_transaction_reference: string | null;
  status: string;
  user_id: string;
};

type BuyerProfile = {
  email: string;
  full_name: string | null;
  id: string;
};

const statusMessages: Record<string, string> = {
  "confirmed-email-failed":
    "Access was activated, but the email could not be sent. Check the email configuration and use Retry email.",
  "confirmed-email-sent":
    "Payment verified, membership activated, and confirmation email accepted for delivery.",
  "email-already-sent": "This purchase already has a confirmation email.",
  "email-failed":
    "The confirmation could not be sent. Check the server logs and email configuration.",
  "email-sent": "The purchase confirmation was accepted for delivery.",
  "invalid-transaction-reference":
    "Enter the Revolut transaction reference before confirming.",
  "request-not-found": "The membership request no longer exists.",
  "request-not-pending":
    "Only pending Revolut payment-link requests can be confirmed.",
  "verification-failed":
    "The membership could not be verified. Confirm the migration is installed and the reference is unique.",
};

export default async function MembershipPaymentsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const admin = getSupabaseAdmin();
  const [{ data, error }, query] = await Promise.all([
    admin
      .from("membership_requests")
      .select(
        "id,user_id,membership_plan,provider_mode,status,payment_reference,provider_transaction_reference,created_at,confirmation_email_sent_at",
      )
      .in("status", ["pending", "verified"])
      .order("created_at", { ascending: false })
      .limit(100),
    searchParams,
  ]);

  const requests = (data || []) as AdminRequest[];
  const userIds = [...new Set(requests.map((request) => request.user_id))];
  const { data: profileData } = userIds.length
    ? await admin
        .from("profiles")
        .select("id,email,full_name")
        .in("id", userIds)
    : { data: [] };
  const profiles = new Map(
    ((profileData || []) as BuyerProfile[]).map((profile) => [
      profile.id,
      profile,
    ]),
  );

  return (
    <main className="mi-admin-page">
      <Header />
      <section className="container mi-admin-shell">
        <header className="mi-admin-heading">
          <div>
            <span className="section-kicker">Payment operations</span>
            <h1>Membership payments</h1>
            <p>
              Match pending requests to completed Revolut Pro sales, activate
              access, and send the buyer confirmation.
            </p>
          </div>
        </header>

        {query.status && statusMessages[query.status] ? (
          <p className="form-status" role="status">
            {statusMessages[query.status]}
          </p>
        ) : null}

        {error ? (
          <p className="form-status" role="alert">
            The payment queue could not be loaded. Run the purchase-confirmation
            Supabase migration first.
          </p>
        ) : requests.length ? (
          <div className="mi-admin-table-wrap">
            <table className="mi-admin-table membership-admin-table">
              <caption className="sr-only">
                Pending and verified membership purchases
              </caption>
              <thead>
                <tr>
                  <th>Buyer</th>
                  <th>Plan</th>
                  <th>Request</th>
                  <th>Status</th>
                  <th>Confirmation</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => {
                  const buyer = profiles.get(request.user_id);
                  const plan = MEMBERSHIP_PLANS[request.membership_plan];
                  return (
                    <tr key={request.id}>
                      <td>
                        <strong>{buyer?.full_name || "Member"}</strong>
                        <span>{buyer?.email || "Email unavailable"}</span>
                      </td>
                      <td>
                        <strong>{plan.priceLabel}</strong>
                        <span>{plan.label}</span>
                      </td>
                      <td>
                        {formatDate(request.created_at)}
                        <span className="membership-admin-reference">
                          {request.provider_transaction_reference ||
                            request.payment_reference}
                        </span>
                      </td>
                      <td>
                        {formatDisplayLabel(request.status)}
                        <span>{formatDisplayLabel(request.provider_mode)}</span>
                      </td>
                      <td>
                        {request.confirmation_email_sent_at
                          ? `Accepted ${formatDate(
                              request.confirmation_email_sent_at,
                            )}`
                          : "Not sent"}
                      </td>
                      <td>
                        {request.status === "pending" &&
                        request.provider_mode === "revolut_payment_links" ? (
                          <form
                            action={confirmMembershipPayment.bind(
                              null,
                              request.id,
                            )}
                            className="membership-admin-form"
                          >
                            <label>
                              <span className="sr-only">
                                Revolut transaction reference
                              </span>
                              <input
                                aria-label="Revolut transaction reference"
                                autoComplete="off"
                                name="transactionReference"
                                placeholder="Revolut transaction reference"
                                required
                              />
                            </label>
                            <button className="text-button" type="submit">
                              Confirm &amp; email
                            </button>
                          </form>
                        ) : request.status === "verified" &&
                          !request.confirmation_email_sent_at ? (
                          <form
                            action={retryPurchaseConfirmation.bind(
                              null,
                              request.id,
                            )}
                          >
                            <button className="text-button" type="submit">
                              Retry email
                            </button>
                          </form>
                        ) : (
                          <span>Complete</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mi-empty">
            <h2>No purchases need attention</h2>
            <p>New Revolut payment-link requests will appear here.</p>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
