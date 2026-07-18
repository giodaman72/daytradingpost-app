import { normalizeAcademyError } from "./academyErrors";
import { parseJsonObject } from "./academyValidation";

export function academyErrorResponse(error: unknown) {
  const normalized = normalizeAcademyError(error);
  const retryAfter = normalized.context.retryAfter;
  return Response.json(
    { code: normalized.code, message: normalized.message },
    {
      headers:
        typeof retryAfter === "number"
          ? { "Retry-After": String(retryAfter) }
          : undefined,
      status: normalized.status,
    },
  );
}

export async function readAcademyJson(request: Request, maximum = 20_000) {
  if (request.headers.get("sec-fetch-site") === "cross-site")
    throw new Error("Cross-site request rejected.");
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new Error("JSON is required.");
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maximum)
    throw new Error("Request body is too large.");
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maximum)
    throw new Error("Request body is too large.");
  return parseJsonObject(JSON.parse(raw) as unknown);
}
