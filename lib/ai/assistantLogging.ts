import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type Metadata = Record<string, string | number | boolean | null>;

export function logAssistantEvent(event: string, metadata: Metadata = {}) {
  console.warn(
    JSON.stringify({
      scope: "ai_assistant",
      event,
      occurredAt: new Date().toISOString(),
      ...metadata,
    }),
  );
}

export function logAssistantError(
  event: string,
  requestId: string,
  code: string,
) {
  console.error(
    JSON.stringify({
      scope: "ai_assistant",
      event,
      requestId,
      code,
      occurredAt: new Date().toISOString(),
    }),
  );
}

export async function recordAssistantMetric(input: {
  userId: string;
  requestId: string;
  contextMode: string;
  status: "completed" | "refused" | "error";
  provider?: string | null;
  durationMs: number;
  inputTokens?: number;
  outputTokens?: number;
  citationCount?: number;
  safetyFlags?: string[];
  errorCode?: string | null;
}) {
  try {
    await getSupabaseAdmin()
      .from("ai_request_logs")
      .upsert(
        {
          user_id: input.userId,
          request_id: input.requestId,
          context_mode: input.contextMode,
          status: input.status,
          provider: input.provider ?? null,
          duration_ms: Math.max(0, input.durationMs),
          input_tokens: Math.max(0, input.inputTokens ?? 0),
          output_tokens: Math.max(0, input.outputTokens ?? 0),
          citation_count: Math.max(0, input.citationCount ?? 0),
          safety_flags: input.safetyFlags ?? [],
          error_code: input.errorCode ?? null,
        },
        { onConflict: "request_id" },
      );
  } catch {
    // Telemetry must never break an assistant response.
  }
}
