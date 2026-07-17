import { requireAssistantAccess } from "@/lib/ai/assistantAuthorization";
import { normalizeAssistantError } from "@/lib/ai/assistantErrors";
import {
  deleteConversation,
  listMessages,
  updateConversation,
} from "@/lib/ai/assistantRepository";
import { enforceMutationRateLimit } from "@/lib/mutationRateLimit";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const access = await requireAssistantAccess();
    const { id } = await params;
    return Response.json({ data: await listMessages(access.userId, id, 50) });
  } catch (error) {
    const normalized = normalizeAssistantError(error);
    return Response.json(
      { code: normalized.code, message: normalized.message },
      { status: normalized.status },
    );
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    if (request.headers.get("sec-fetch-site") === "cross-site")
      return Response.json(
        { message: "Request not allowed." },
        { status: 403 },
      );
    const access = await requireAssistantAccess();
    enforceMutationRateLimit(access.userId, "assistant-conversations", 20);
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const title =
      typeof body.title === "string"
        ? body.title.replace(/\s+/g, " ").trim().slice(0, 120)
        : undefined;
    const status =
      body.status === "active" || body.status === "archived"
        ? body.status
        : undefined;
    if (!title && !status)
      return Response.json(
        { message: "No valid changes supplied." },
        { status: 400 },
      );
    return Response.json({
      data: await updateConversation(access.userId, id, { title, status }),
    });
  } catch (error) {
    const normalized = normalizeAssistantError(error);
    return Response.json(
      { code: normalized.code, message: normalized.message },
      { status: normalized.status },
    );
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    if (request.headers.get("sec-fetch-site") === "cross-site")
      return Response.json(
        { message: "Request not allowed." },
        { status: 403 },
      );
    const access = await requireAssistantAccess();
    enforceMutationRateLimit(access.userId, "assistant-conversations", 20);
    const { id } = await params;
    await deleteConversation(access.userId, id);
    return new Response(null, { status: 204 });
  } catch (error) {
    const normalized = normalizeAssistantError(error);
    return Response.json(
      { code: normalized.code, message: normalized.message },
      { status: normalized.status },
    );
  }
}
