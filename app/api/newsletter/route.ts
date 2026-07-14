import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  getNewsletterEmailError,
  normalizeNewsletterEmail,
} from "@/lib/validation/newsletter";
import { insertNewsletterSubscriber } from "@/lib/supabase-newsletter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 4_096;
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1_000;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type NewsletterRequestBody = {
  company?: unknown;
  consent?: unknown;
  email?: unknown;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function createJsonResponse(
  message: string,
  status: number,
  ok = false,
  headers?: HeadersInit,
) {
  return NextResponse.json(
    { ok, message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...headers,
      },
    },
  );
}

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0];
  const clientHint =
    forwardedFor?.trim() ||
    request.headers.get("x-real-ip") ||
    `${request.headers.get("user-agent") ?? "unknown"}:${request.headers.get("accept-language") ?? "unknown"}`;

  return createHash("sha256").update(clientHint).digest("hex");
}

function checkRateLimit(clientKey: string) {
  const now = Date.now();
  const current = rateLimitStore.get(clientKey);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(clientKey, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return null;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return Math.max(1, Math.ceil((current.resetAt - now) / 1_000));
  }

  current.count += 1;
  return null;
}

function pruneRateLimitStore() {
  if (rateLimitStore.size < 1_000) {
    return;
  }

  const now = Date.now();

  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export async function POST(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return createJsonResponse("This request is not allowed.", 403);
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return createJsonResponse("Send newsletter requests as JSON.", 415);
  }

  const declaredLength = Number(request.headers.get("content-length"));

  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    return createJsonResponse("This request is too large.", 413);
  }

  pruneRateLimitStore();
  const retryAfter = checkRateLimit(getClientKey(request));

  if (retryAfter) {
    return createJsonResponse(
      "Too many signup attempts. Please try again in a few minutes.",
      429,
      false,
      { "Retry-After": String(retryAfter) },
    );
  }

  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch {
    return createJsonResponse("We could not read this request.", 400);
  }

  if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
    return createJsonResponse("This request is too large.", 413);
  }

  let parsedBody: unknown;

  try {
    parsedBody = JSON.parse(rawBody) as unknown;
  } catch {
    return createJsonResponse("Send a valid newsletter signup request.", 400);
  }

  if (
    !parsedBody ||
    typeof parsedBody !== "object" ||
    Array.isArray(parsedBody)
  ) {
    return createJsonResponse("Send a valid newsletter signup request.", 400);
  }

  const body = parsedBody as NewsletterRequestBody;

  if (typeof body.company === "string" && body.company.trim()) {
    return createJsonResponse(
      "Thanks. Check your inbox for future DayTradingPost updates.",
      200,
      true,
    );
  }

  if (body.consent !== true) {
    return createJsonResponse(
      "Confirm that you agree to receive the newsletter.",
      400,
    );
  }

  if (typeof body.email !== "string") {
    return createJsonResponse("Enter your email address.", 400);
  }

  const email = normalizeNewsletterEmail(body.email);
  const emailError = getNewsletterEmailError(email);

  if (emailError) {
    return createJsonResponse(emailError, 400);
  }

  try {
    const result = await insertNewsletterSubscriber(email);

    if (result === "duplicate") {
      return createJsonResponse(
        "You’re already subscribed to the Daily Market Brief.",
        200,
        true,
      );
    }

    return createJsonResponse(
      "You’re subscribed. Watch your inbox for the Daily Market Brief.",
      201,
      true,
    );
  } catch (error) {
    console.error(
      "Newsletter signup failed:",
      error instanceof Error ? error.message : "Unknown server error",
    );

    return createJsonResponse(
      "We couldn’t complete your signup. Please try again shortly.",
      503,
    );
  }
}
