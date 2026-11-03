import { academyLessonText } from "@/lib/academy/academyLessonText";
import type { Locale } from "@/lib/i18n/config";
import type { AssistantUsageSummary } from "@/types/ai-usage";

export function AssistantUsageMeter({
  usage,
  premium,
  locale = "en",
}: {
  usage: AssistantUsageSummary;
  premium: boolean;
  locale?: Locale;
}) {
  const tr = academyLessonText(locale);
  return (
    <div className="assistant-usage">
      <div>
        <span>{tr("Daily usage")}</span>
        <strong>
          {usage.remaining} {tr("questions left")}
        </strong>
      </div>
      <progress
        value={usage.requestCount}
        max={usage.dailyLimit}
        aria-label={`${usage.requestCount} ${tr("of")} ${usage.dailyLimit} ${tr("daily questions used")}`}
      />
      <small>{premium ? tr("Premium allowance") : tr("Free allowance")}</small>
    </div>
  );
}
