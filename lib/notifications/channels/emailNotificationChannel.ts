import "server-only";
import { formatAlertEmail, type AlertEmail } from "../alertEmail";
export const emailNotificationChannel = {
  id: "email",
  async deliver(input: AlertEmail) {
    if (
      process.env.NODE_ENV === "production" ||
      process.env.ALERT_EMAIL_PROVIDER !== "mock"
    )
      return {
        delivered: false,
        status: "skipped" as const,
        reason: "Email provider is not configured.",
      };
    formatAlertEmail(input);
    return { delivered: true, status: "delivered" as const };
  },
};
