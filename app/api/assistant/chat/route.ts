import { normalizeAssistantError } from "@/lib/ai/assistantErrors";
import { getAssistantConfig } from "@/lib/ai/assistantConfig";
import { streamAssistantResponse } from "@/lib/ai/assistantService";
import { parseAssistantRequest } from "@/lib/ai/assistantValidation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();
const event = (value: unknown) =>
  encoder.encode(`data: ${JSON.stringify(value)}\n\n`);

export async function POST(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site")
    return Response.json(
      { code: "FORBIDDEN", message: "Request not allowed." },
      { status: 403 },
    );
  if (!request.headers.get("content-type")?.includes("application/json"))
    return Response.json(
      { code: "INVALID_REQUEST", message: "Send JSON." },
      { status: 415 },
    );
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > 12_000)
    return Response.json(
      { code: "INVALID_REQUEST", message: "Request body is too large." },
      { status: 413 },
    );
  let parsed: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 12_000)
      return Response.json(
        { code: "INVALID_REQUEST", message: "Request body is too large." },
        { status: 413 },
      );
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return Response.json(
      { code: "INVALID_REQUEST", message: "Invalid JSON." },
      { status: 400 },
    );
  }
  let input;
  try {
    input = parseAssistantRequest(
      parsed,
      getAssistantConfig().maximumInputCharacters,
    );
  } catch (error) {
    const normalized = normalizeAssistantError(error);
    return Response.json(
      { code: normalized.code, message: normalized.message },
      { status: normalized.status },
    );
  }
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const item of streamAssistantResponse(input, request.signal))
          controller.enqueue(event(item));
      } catch (error) {
        const normalized = normalizeAssistantError(error);
        controller.enqueue(
          event({
            type: "error",
            code: normalized.code,
            message: normalized.message,
          }),
        );
      } finally {
        controller.close();
      }
    },
    cancel() {
      // The Route Handler signal is forwarded to the provider call.
    },
  });
  return new Response(stream, {
    headers: {
      "Cache-Control": "no-store, no-transform",
      "Content-Type": "text/event-stream; charset=utf-8",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
