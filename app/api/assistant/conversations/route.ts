import { requireAssistantAccess } from "@/lib/ai/assistantAuthorization";
import { normalizeAssistantError } from "@/lib/ai/assistantErrors";
import { listConversations } from "@/lib/ai/assistantRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const access = await requireAssistantAccess();
    const page = Math.max(
      1,
      Number(new URL(request.url).searchParams.get("page")) || 1,
    );
    return Response.json({
      data: await listConversations(access.userId, page, 20),
      page,
    });
  } catch (error) {
    const normalized = normalizeAssistantError(error);
    return Response.json(
      { code: normalized.code, message: normalized.message },
      { status: normalized.status },
    );
  }
}
