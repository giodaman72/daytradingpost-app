import Link from "next/link";
import type { AssistantUsageSummary } from "@/types/ai-usage";
import { DashboardPanel } from "./DashboardPanel";

const questions = [
  ["Summarize today’s market brief", "market_analysis"],
  ["Explain the main risks across my watchlist", "watchlist_summary"],
  ["What are today’s major economic events?", "economic_event"],
] as const;

export function AIAssistantWidget({
  usage,
  premium,
}: {
  usage: AssistantUsageSummary | null;
  premium: boolean;
}) {
  return (
    <DashboardPanel
      id="ai-assistant"
      eyebrow="On-demand, source-grounded"
      title="AI Trading Assistant"
      className="dashboard-panel-wide"
      action={
        <Link href="/assistant" className="dashboard-panel-link">
          Open assistant →
        </Link>
      }
    >
      <div className="dashboard-ai-widget">
        <div>
          <p>
            Ask against published analysis, structured market intelligence,
            economic events, and Academy material.
          </p>
          <strong>
            {usage
              ? `${usage.remaining} of ${usage.dailyLimit} questions remaining today`
              : "Usage becomes available after the AI database migration"}
          </strong>
        </div>
        <div>
          {questions.map(([prompt, mode]) => (
            <Link
              href={`/assistant?mode=${mode}&prompt=${encodeURIComponent(prompt)}`}
              key={prompt}
            >
              {prompt}
            </Link>
          ))}
        </div>
        {!premium ? (
          <Link href="/premium">
            Upgrade for watchlist context and higher limits →
          </Link>
        ) : null}
      </div>
    </DashboardPanel>
  );
}
