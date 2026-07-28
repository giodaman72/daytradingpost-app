import { requireAssistantAccess } from "@/lib/ai/assistantAuthorization";
import { normalizeAssistantError } from "@/lib/ai/assistantErrors";
import { getAssistantUsage } from "@/lib/ai/assistantUsage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const access = await requireAssistantAccess();
    return Response.json({
      data: await getAssistantUsage(access.userId, access.hasPremiumAccess),
    });
  } catch (error) {
    const normalized = normalizeAssistantError(error);
    return Response.json(
      { code: normalized.code, message: normalized.message },
      { status: normalized.status },
    );
  }
}
