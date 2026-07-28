import { describe, expect, it } from "vitest";
import {
  calculateUnreadCount,
  escapeEmailText,
  safeNotificationLink,
} from "./notificationFormatter";
import { deliverAlertEmailWithRetry, formatAlertEmail } from "./alertEmail";
const email = {
  to: "a@example.com",
  alertName: "Gold",
  subject: "Alert",
  condition: "gt",
  triggerValue: "2",
  timestamp: "now",
  delayed: false,
  link: "https://example.com/alerts/1",
};
describe("notifications", () => {
  it("sanitizes links and email content", () => {
    expect(safeNotificationLink("//evil.example")).toBeNull();
    expect(escapeEmailText("<script>")).toBe("&lt;script&gt;");
    expect(
      formatAlertEmail({ ...email, alertName: "<Gold>", delayed: true }).html,
    ).toContain("&lt;Gold&gt;");
  });
  it("counts only unread, visible notifications", () => {
    expect(
      calculateUnreadCount([
        { readAt: null, dismissedAt: null },
        { readAt: "now", dismissedAt: null },
        { readAt: null, dismissedAt: "now" },
      ]),
    ).toBe(1);
  });
  it("records a disabled provider without delivery", async () => {
    expect(
      (
        await deliverAlertEmailWithRetry(email, async () => ({
          delivered: false,
          status: "skipped" as const,
        }))
      ).status,
    ).toBe("skipped");
  });
  it("retries transient email failures", async () => {
    let attempts = 0;
    const result = await deliverAlertEmailWithRetry(email, async () => {
      attempts += 1;
      if (attempts === 1) throw new Error("temporary");
      return { delivered: true, status: "delivered" as const };
    });
    expect(result.status).toBe("delivered");
    expect(attempts).toBe(2);
  });
});
