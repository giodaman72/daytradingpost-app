import { escapeEmailText } from "./notificationFormatter";
export type AlertEmail = {
  to: string;
  alertName: string;
  subject: string;
  condition: string;
  triggerValue: string;
  timestamp: string;
  delayed: boolean;
  link: string;
};
export function formatAlertEmail(input: AlertEmail) {
  return {
    subject: `[DayTradingPost] ${input.subject}`,
    html: `<h1>${escapeEmailText(input.alertName)}</h1><p>${escapeEmailText(input.condition)}</p><p>Trigger: ${escapeEmailText(input.triggerValue)}</p><p>Time: ${escapeEmailText(input.timestamp)}</p>${input.delayed ? "<p>Market data was delayed.</p>" : ""}<p><a href="${escapeEmailText(input.link)}">Review alert</a> · <a href="${escapeEmailText(input.link.replace(/\/alerts.*/, "/account"))}">Manage preferences</a></p><p>Educational information only; not investment advice.</p>`,
  };
}
export async function deliverAlertEmailWithRetry(
  input: AlertEmail,
  deliver: (
    value: AlertEmail,
  ) => Promise<{ delivered: boolean; status: "delivered" | "skipped" }>,
  attempts = 2,
) {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await deliver(input);
    } catch (error) {
      lastError = error;
    }
  }
  return {
    delivered: false,
    status: "skipped" as const,
    reason:
      lastError instanceof Error ? lastError.message : "Email delivery failed.",
  };
}
