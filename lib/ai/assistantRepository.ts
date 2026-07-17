import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AssistantCitation } from "@/types/ai-citation";
import type { AssistantContextMode } from "@/types/ai-context";
import type { AssistantConversation } from "@/types/ai-assistant";
import type { AssistantMessage, AssistantRole } from "@/types/ai-message";
import { AssistantError } from "./assistantErrors";

const mapConversation = (
  row: Record<string, unknown>,
): AssistantConversation => ({
  id: String(row.id),
  userId: String(row.user_id),
  title: String(row.title),
  status: row.status as AssistantConversation["status"],
  contextMode: row.context_mode as AssistantContextMode,
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at),
  archivedAt: row.archived_at ? String(row.archived_at) : null,
});

const mapMessage = (row: Record<string, unknown>): AssistantMessage => ({
  id: String(row.id),
  conversationId: String(row.conversation_id),
  userId: String(row.user_id),
  role: row.role as AssistantRole,
  content: String(row.content),
  citations: (row.citations ?? []) as AssistantCitation[],
  contextMode:
    ((row.source_context as Record<string, unknown> | null)
      ?.contextMode as AssistantContextMode) ?? "general_education",
  model: row.model ? String(row.model) : null,
  provider: row.provider ? String(row.provider) : null,
  safetyFlags: Array.isArray(row.safety_flags)
    ? row.safety_flags.map(String)
    : [],
  createdAt: String(row.created_at),
});

export async function createConversation(
  userId: string,
  title: string,
  contextMode: AssistantContextMode,
) {
  const { data, error } = await getSupabaseAdmin()
    .from("ai_conversations")
    .insert({ user_id: userId, title, context_mode: contextMode })
    .select()
    .single();
  if (error)
    throw new AssistantError(
      "INTERNAL_ERROR",
      "Could not start a conversation.",
      500,
    );
  return mapConversation(data);
}

export async function getConversation(userId: string, id: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("ai_conversations")
    .select()
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data)
    throw new AssistantError("NOT_FOUND", "Conversation not found.", 404);
  return mapConversation(data);
}

export async function listConversations(userId: string, page = 1, limit = 20) {
  const from = Math.max(0, page - 1) * limit;
  const { data, error } = await getSupabaseAdmin()
    .from("ai_conversations")
    .select()
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .range(from, from + limit - 1);
  if (error)
    throw new AssistantError(
      "INTERNAL_ERROR",
      "Conversation history is unavailable.",
      500,
    );
  return (data ?? []).map(mapConversation);
}

export async function listMessages(
  userId: string,
  conversationId: string,
  limit = 50,
) {
  await getConversation(userId, conversationId);
  const { data, error } = await getSupabaseAdmin()
    .from("ai_messages")
    .select()
    .eq("user_id", userId)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error)
    throw new AssistantError(
      "INTERNAL_ERROR",
      "Messages are unavailable.",
      500,
    );
  return (data ?? []).map(mapMessage).reverse();
}

export async function getMessageByRequest(
  userId: string,
  requestId: string,
  role: AssistantRole,
) {
  const { data, error } = await getSupabaseAdmin()
    .from("ai_messages")
    .select()
    .eq("user_id", userId)
    .eq("request_id", requestId)
    .eq("role", role)
    .maybeSingle();
  if (error) return null;
  return data ? mapMessage(data) : null;
}

export async function insertMessage(input: {
  userId: string;
  conversationId: string;
  role: AssistantRole;
  content: string;
  citations?: AssistantCitation[];
  contextMode: AssistantContextMode;
  model?: string | null;
  provider?: string | null;
  tokenUsage?: { inputTokens: number; outputTokens: number };
  safetyFlags?: string[];
  requestId: string;
}) {
  await getConversation(input.userId, input.conversationId);
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("ai_messages")
    .insert({
      user_id: input.userId,
      conversation_id: input.conversationId,
      role: input.role,
      content: input.content,
      citations: input.citations ?? [],
      source_context: { contextMode: input.contextMode },
      model: input.model ?? null,
      provider: input.provider ?? null,
      token_usage: input.tokenUsage ?? {},
      safety_flags: input.safetyFlags ?? [],
      request_id: input.requestId,
    })
    .select()
    .single();
  if (!error && data) return mapMessage(data);
  if (error?.code === "23505") {
    const duplicate = await db
      .from("ai_messages")
      .select()
      .eq("user_id", input.userId)
      .eq("request_id", input.requestId)
      .eq("role", input.role)
      .maybeSingle();
    if (duplicate.data) return mapMessage(duplicate.data);
  }
  throw new AssistantError(
    "INTERNAL_ERROR",
    "Could not save the message.",
    500,
  );
}

export async function updateConversation(
  userId: string,
  id: string,
  patch: { title?: string; status?: "active" | "archived" },
) {
  const values: Record<string, unknown> = { ...patch };
  if (patch.status)
    values.archived_at =
      patch.status === "archived" ? new Date().toISOString() : null;
  const { data, error } = await getSupabaseAdmin()
    .from("ai_conversations")
    .update(values)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .maybeSingle();
  if (error || !data)
    throw new AssistantError("NOT_FOUND", "Conversation not found.", 404);
  return mapConversation(data);
}

export async function deleteConversation(userId: string, id: string) {
  await getConversation(userId, id);
  const { error } = await getSupabaseAdmin()
    .from("ai_conversations")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error)
    throw new AssistantError(
      "INTERNAL_ERROR",
      "Could not delete the conversation.",
      500,
    );
}

export async function saveFeedback(input: {
  userId: string;
  conversationId: string;
  messageId: string;
  rating: string;
  reason: string;
  comment: string | null;
}) {
  await getConversation(input.userId, input.conversationId);
  const { data: message } = await getSupabaseAdmin()
    .from("ai_messages")
    .select("id")
    .eq("id", input.messageId)
    .eq("conversation_id", input.conversationId)
    .eq("user_id", input.userId)
    .eq("role", "assistant")
    .maybeSingle();
  if (!message)
    throw new AssistantError("NOT_FOUND", "Assistant message not found.", 404);
  const { error } = await getSupabaseAdmin().from("ai_feedback").upsert(
    {
      user_id: input.userId,
      conversation_id: input.conversationId,
      message_id: input.messageId,
      rating: input.rating,
      reason: input.reason,
      comment: input.comment,
    },
    { onConflict: "user_id,message_id" },
  );
  if (error)
    throw new AssistantError("INTERNAL_ERROR", "Could not save feedback.", 500);
}
