import { MEMBERSHIP_PLANS } from "@/constants/membership";
import type { MembershipPlan } from "@/types/membership";

export type PurchaseConfirmationContentInput = {
  accountUrl: string;
  buyerName: string | null;
  currentPeriodEnd: string | null;
  providerReference: string;
  plan: MembershipPlan;
  verifiedAt: string;
};

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] || character,
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatPrice(plan: MembershipPlan) {
  const details = MEMBERSHIP_PLANS[plan];
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: details.currency,
  }).format(details.amount);
}

export function buildPurchaseConfirmationContent(
  input: PurchaseConfirmationContentInput,
) {
  const plan = MEMBERSHIP_PLANS[input.plan];
  const buyerName = input.buyerName?.trim() || "DayTradingPost member";
  const price = formatPrice(input.plan);
  const verifiedDate = formatDate(input.verifiedAt);
  const accessEnd = input.currentPeriodEnd
    ? formatDate(input.currentPeriodEnd)
    : null;
  const accountUrl = escapeHtml(input.accountUrl);
  const safeName = escapeHtml(buyerName);
  const safeReference = escapeHtml(input.providerReference);

  const text = [
    `Hello ${buyerName},`,
    "",
    "Your Revolut payment has been verified and your DayTradingPost Premium access is now active.",
    "",
    `Plan: ${plan.label}`,
    `Amount: ${price}`,
    "Payment method: Revolut",
    `Payment confirmed: ${verifiedDate}`,
    ...(accessEnd ? [`Access through: ${accessEnd}`] : []),
    `Revolut reference: ${input.providerReference}`,
    "",
    `Manage your membership: ${input.accountUrl}`,
    "",
    "This confirms your DayTradingPost purchase and access activation. Your Revolut transaction record remains the payment-provider receipt. Contact hello@daytradingpost.com if you need help or a separate invoice.",
  ].join("\n");

  const accessEndRow = accessEnd
    ? `<tr><td style="padding:8px 0;color:#777">Access through</td><td style="padding:8px 0;text-align:right;font-weight:600">${escapeHtml(accessEnd)}</td></tr>`
    : "";

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f1e8;color:#171717;font-family:Arial,sans-serif">
    <div style="display:none;max-height:0;overflow:hidden">Your DayTradingPost Premium access is active.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f1e8;padding:32px 16px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border:1px solid #ded8c8;border-radius:14px;overflow:hidden">
            <tr>
              <td style="background:#111827;color:#fff;padding:28px 32px">
                <div style="color:#d8b45c;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">DayTradingPost Premium</div>
                <h1 style="font-size:28px;line-height:1.2;margin:10px 0 0">Payment confirmed</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px">
                <p style="font-size:16px;line-height:1.6;margin:0 0 18px">Hello ${safeName},</p>
                <p style="font-size:16px;line-height:1.6;margin:0 0 24px">Your Revolut payment has been verified and your DayTradingPost Premium access is now active.</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e5e1d7;border-bottom:1px solid #e5e1d7;margin:0 0 28px">
                  <tr><td style="padding:16px 0 8px;color:#777">Plan</td><td style="padding:16px 0 8px;text-align:right;font-weight:600">${escapeHtml(plan.label)}</td></tr>
                  <tr><td style="padding:8px 0;color:#777">Amount</td><td style="padding:8px 0;text-align:right;font-weight:600">${escapeHtml(price)}</td></tr>
                  <tr><td style="padding:8px 0;color:#777">Payment method</td><td style="padding:8px 0;text-align:right;font-weight:600">Revolut</td></tr>
                  <tr><td style="padding:8px 0;color:#777">Confirmed</td><td style="padding:8px 0;text-align:right;font-weight:600">${escapeHtml(verifiedDate)}</td></tr>
                  ${accessEndRow}
                  <tr><td style="padding:8px 0 16px;color:#777">Revolut reference</td><td style="padding:8px 0 16px;text-align:right;font-family:monospace;font-size:12px">${safeReference}</td></tr>
                </table>
                <p style="margin:0 0 28px"><a href="${accountUrl}" style="display:inline-block;background:#b68a2c;color:#fff;text-decoration:none;font-weight:700;padding:13px 20px;border-radius:8px">View membership</a></p>
                <p style="color:#666;font-size:13px;line-height:1.6;margin:0">This confirms your DayTradingPost purchase and access activation. Your Revolut transaction record remains the payment-provider receipt. Contact <a href="mailto:hello@daytradingpost.com" style="color:#8b671c">hello@daytradingpost.com</a> if you need help or a separate invoice.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    html,
    subject: `Payment confirmed — ${plan.label}`,
    text,
  };
}
