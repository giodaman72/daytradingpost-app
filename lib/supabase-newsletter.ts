import "server-only";

type SupabaseErrorPayload = {
  code?: string;
  message?: string;
};

export type NewsletterInsertResult = "created" | "duplicate";

function getSupabaseConfig() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!rawUrl || !serviceRoleKey) {
    throw new Error("Newsletter storage is not configured.");
  }

  const url = new URL(rawUrl);
  const isLocalSupabase =
    url.hostname === "localhost" || url.hostname === "127.0.0.1";

  if (url.protocol !== "https:" && !(isLocalSupabase && url.protocol === "http:")) {
    throw new Error("The Supabase URL must use HTTPS.");
  }

  return {
    baseUrl: url.toString().replace(/\/$/, ""),
    serviceRoleKey,
  };
}

async function readSupabaseError(response: Response) {
  try {
    return (await response.json()) as SupabaseErrorPayload;
  } catch {
    return {};
  }
}

export async function insertNewsletterSubscriber(
  email: string,
): Promise<NewsletterInsertResult> {
  const { baseUrl, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${baseUrl}/rest/v1/newsletter_subscribers`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      email,
      consent: true,
      source: "homepage",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });

  if (response.ok) {
    return "created";
  }

  const error = await readSupabaseError(response);

  if (response.status === 409 && error.code === "23505") {
    return "duplicate";
  }

  throw new Error(
    `Supabase newsletter insert failed (${response.status}, ${error.code ?? "unknown"}).`,
  );
}
