import "server-only";

type SendEmailInput = {
  html: string;
  idempotencyKey: string;
  subject: string;
  text: string;
  to: string;
};

type ResendResponse = {
  id?: string;
  message?: string;
  name?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FROM_PATTERN = /^.{1,80}\s<([^\s<>@]+@[^\s<>@]+\.[^\s<>@]+)>$/;

export async function sendTransactionalEmail(input: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");
  if (!EMAIL_PATTERN.test(input.to))
    throw new Error("The purchase confirmation recipient is invalid.");

  const from = process.env.PURCHASE_EMAIL_FROM?.trim();
  if (!from || !FROM_PATTERN.test(from))
    throw new Error(
      "PURCHASE_EMAIL_FROM must use the format Name <email@example.com>.",
    );

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey,
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: "hello@daytradingpost.com",
      tags: [{ name: "category", value: "purchase_confirmation" }],
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  const result = (await response.json().catch(() => ({}))) as ResendResponse;
  if (!response.ok || !result.id) {
    throw new Error(
      `Resend rejected the purchase confirmation (${response.status}): ${
        result.message || result.name || "Unknown email error"
      }`,
    );
  }

  return result.id;
}
