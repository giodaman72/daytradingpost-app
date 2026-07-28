import type { AssistantUsageSummary } from "@/types/ai-usage";

export function AssistantUsageMeter({
  usage,
  premium,
}: {
  usage: AssistantUsageSummary;
  premium: boolean;
}) {
  return (
    <div className="assistant-usage">
      <div>
        <span>Daily usage</span>
        <strong>{usage.remaining} questions left</strong>
      </div>
      <progress
        value={usage.requestCount}
        max={usage.dailyLimit}
        aria-label={`${usage.requestCount} of ${usage.dailyLimit} daily questions used`}
      />
      <small>{premium ? "Premium allowance" : "Free allowance"}</small>
    </div>
  );
}
