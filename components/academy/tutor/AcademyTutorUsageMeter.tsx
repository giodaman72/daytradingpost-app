import type { Locale } from "@/lib/i18n/config";
import type { AssistantUsageSummary } from "@/types/ai-usage";
import { AssistantUsageMeter } from "@/components/assistant/AssistantUsageMeter";

export function AcademyTutorUsageMeter(props: {
  usage: AssistantUsageSummary;
  premium: boolean;
  locale?: Locale;
}) {
  return <AssistantUsageMeter {...props} />;
}
