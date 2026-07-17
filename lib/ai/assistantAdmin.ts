import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function getAssistantAdminSummary(from: string, to: string) {
  const db = getSupabaseAdmin();
  const [{ data: logs }, { data: usage }, { data: feedback }] =
    await Promise.all([
      db
        .from("ai_request_logs")
        .select(
          "user_id,status,provider,duration_ms,input_tokens,output_tokens,citation_count,safety_flags,context_mode,error_code",
        )
        .gte("created_at", from)
        .lte("created_at", to)
        .limit(10_000),
      db
        .from("ai_usage")
        .select("estimated_cost")
        .gte("usage_date", from.slice(0, 10))
        .lte("usage_date", to.slice(0, 10))
        .limit(10_000),
      db
        .from("ai_feedback")
        .select("rating")
        .gte("created_at", from)
        .lte("created_at", to)
        .limit(10_000),
    ]);
  const rows = (logs ?? []) as Array<Record<string, unknown>>;
  const modes = new Map<string, number>();
  rows.forEach((row) => {
    const mode = String(row.context_mode);
    modes.set(mode, (modes.get(mode) ?? 0) + 1);
  });
  const completed = rows.filter((row) => row.status === "completed");
  const refused = rows.filter((row) => row.status === "refused");
  const errors = rows.filter((row) => row.status === "error");
  const total = rows.length;
  return {
    requests: total,
    activeUsers: new Set(rows.map((row) => row.user_id).filter(Boolean)).size,
    averageResponseMs: total
      ? Math.round(
          rows.reduce((sum, row) => sum + Number(row.duration_ms), 0) / total,
        )
      : 0,
    errorRate: total ? Math.round((errors.length / total) * 1000) / 10 : 0,
    providerFailures: errors.filter((row) =>
      String(row.error_code).startsWith("PROVIDER"),
    ).length,
    inputTokens: rows.reduce((sum, row) => sum + Number(row.input_tokens), 0),
    outputTokens: rows.reduce((sum, row) => sum + Number(row.output_tokens), 0),
    estimatedCost: (usage ?? []).some((item) => item.estimated_cost != null)
      ? (usage ?? []).reduce(
          (sum, item) => sum + Number(item.estimated_cost ?? 0),
          0,
        )
      : null,
    refusals: refused.length,
    citationCoverage: completed.length
      ? Math.round(
          (completed.filter((row) => Number(row.citation_count) > 0).length /
            completed.length) *
            1000,
        ) / 10
      : 0,
    positiveFeedback: (feedback ?? []).filter(
      (item) => item.rating === "positive",
    ).length,
    negativeFeedback: (feedback ?? []).filter(
      (item) => item.rating === "negative",
    ).length,
    topModes: [...modes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7),
  };
}
