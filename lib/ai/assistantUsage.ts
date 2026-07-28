import "server-only";
import { ASSISTANT_LIMITS } from "@/constants/ai-assistant";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AssistantUsageSummary } from "@/types/ai-usage";
import { AssistantError } from "./assistantErrors";
import { estimateAssistantCost } from "./assistantConfig";

const limit = (premium: boolean) => {
  const env = Number(
    premium
      ? process.env.AI_PREMIUM_DAILY_LIMIT
      : process.env.AI_FREE_DAILY_LIMIT,
  );
  return Number.isInteger(env) && env > 0
    ? env
    : premium
      ? ASSISTANT_LIMITS.premium.dailyRequests
      : ASSISTANT_LIMITS.free.dailyRequests;
};

export async function getAssistantUsage(
  userId: string,
  premium: boolean,
): Promise<AssistantUsageSummary> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await getSupabaseAdmin()
    .from("ai_usage")
    .select(
      "usage_date,request_count,input_tokens,output_tokens,estimated_cost",
    )
    .eq("user_id", userId)
    .eq("usage_date", today)
    .maybeSingle();
  if (error)
    throw new AssistantError(
      "INTERNAL_ERROR",
      "Usage information is unavailable.",
      500,
    );
  const dailyLimit = limit(premium);
  const requestCount = Number(data?.request_count ?? 0);
  return {
    usageDate: today,
    requestCount,
    inputTokens: Number(data?.input_tokens ?? 0),
    outputTokens: Number(data?.output_tokens ?? 0),
    estimatedCost:
      data?.estimated_cost == null ? null : String(data.estimated_cost),
    dailyLimit,
    remaining: Math.max(0, dailyLimit - requestCount),
  };
}

export async function enforceAssistantUsage(userId: string, premium: boolean) {
  const usage = await getAssistantUsage(userId, premium);
  if (usage.remaining <= 0)
    throw new AssistantError(
      "LIMIT_REACHED",
      premium
        ? "You have reached today’s assistant limit. Please try again tomorrow."
        : "You have reached today’s free assistant limit. Upgrade for a higher daily allowance.",
      429,
    );
  const { data: claimed, error } = await getSupabaseAdmin().rpc(
    "claim_ai_request",
    { p_user_id: userId, p_daily_limit: usage.dailyLimit },
  );
  if (error)
    throw new AssistantError(
      "INTERNAL_ERROR",
      "Usage limits could not be verified.",
      503,
    );
  if (!claimed)
    throw new AssistantError(
      "LIMIT_REACHED",
      premium
        ? "You have reached today’s assistant limit. Please try again tomorrow."
        : "You have reached today’s free assistant limit. Upgrade for a higher daily allowance.",
      429,
    );
  return {
    ...usage,
    requestCount: usage.requestCount + 1,
    remaining: usage.remaining - 1,
  };
}

export async function recordAssistantUsage(
  userId: string,
  inputTokens: number,
  outputTokens: number,
) {
  const cost = estimateAssistantCost(inputTokens, outputTokens);
  const { error } = await getSupabaseAdmin().rpc("record_ai_token_usage", {
    p_user_id: userId,
    p_input_tokens: inputTokens,
    p_output_tokens: outputTokens,
    p_estimated_cost: cost,
  });
  if (error) console.error("AI usage aggregation failed:", error.code);
}
