import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_TIMESTAMP_AGE_MS = 5 * 60 * 1000;

export function verifyRevolutWebhook(input: {
  rawBody: string;
  signature: string | null;
  timestamp: string | null;
  secret: string;
}) {
  if (!input.signature || !input.timestamp || !/^\d+$/.test(input.timestamp)) {
    return false;
  }

  const timestamp = Number(input.timestamp);
  if (!Number.isSafeInteger(timestamp) || Math.abs(Date.now() - timestamp) > MAX_TIMESTAMP_AGE_MS) {
    return false;
  }

  const digest = createHmac("sha256", input.secret)
    .update(`v1.${input.timestamp}.${input.rawBody}`)
    .digest("hex");
  const expected = Buffer.from(`v1=${digest}`);

  return input.signature.split(",").some((value) => {
    const received = Buffer.from(value.trim());
    return received.length === expected.length && timingSafeEqual(received, expected);
  });
}
