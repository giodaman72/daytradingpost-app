import { afterEach, describe, expect, it, vi } from "vitest";
import { sendTransactionalEmail } from "./resend";

const input = {
  html: "<p>Confirmed</p>",
  idempotencyKey: "purchase-confirmation-request-id",
  subject: "Payment confirmed",
  text: "Confirmed",
  to: "buyer@example.com",
};

describe("sendTransactionalEmail", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("sends through Resend with a deterministic idempotency key", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv(
      "PURCHASE_EMAIL_FROM",
      "DayTradingPost <hello@daytradingpost.com>",
    );
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "email_123" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendTransactionalEmail(input)).resolves.toBe("email_123");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Idempotency-Key": input.idempotencyKey,
        }),
        method: "POST",
      }),
    );
  });

  it("fails closed when server email configuration is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("PURCHASE_EMAIL_FROM", "");

    await expect(sendTransactionalEmail(input)).rejects.toThrow(
      "RESEND_API_KEY",
    );
  });

  it("does not accept an invalid recipient", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv(
      "PURCHASE_EMAIL_FROM",
      "DayTradingPost <hello@daytradingpost.com>",
    );

    await expect(
      sendTransactionalEmail({ ...input, to: "invalid" }),
    ).rejects.toThrow("recipient");
  });
});
