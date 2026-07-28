import { requireAssistantAccess } from "@/lib/ai/assistantAuthorization";
import { normalizeAssistantError } from "@/lib/ai/assistantErrors";
import { saveFeedback } from "@/lib/ai/assistantRepository";
import { parseAssistantFeedback } from "@/lib/ai/assistantValidation";
import { enforceMutationRateLimit } from "@/lib/mutationRateLimit";

export async function POST(request: Request) {
  try {
    if (request.headers.get("sec-fetch-site") === "cross-site")
      return Response.json(
        { message: "Request not allowed." },
        { status: 403 },
      );
    const access = await requireAssistantAccess();
    enforceMutationRateLimit(access.userId, "assistant-feedback", 20);
    const feedback = parseAssistantFeedback(await request.json());
    await saveFeedback({ userId: access.userId, ...feedback });
    return Response.json({ ok: true });
  } catch (error) {
    const normalized = normalizeAssistantError(error);
    return Response.json(
      { code: normalized.code, message: normalized.message },
      { status: normalized.status },
    );
  }
}
