import type { AssistantUsageSummary } from "@/types/ai-usage";
import { AssistantUsageMeter } from "@/components/assistant/AssistantUsageMeter";

export function AcademyTutorUsageMeter(props: {
  usage: AssistantUsageSummary;
  premium: boolean;
}) {
  return <AssistantUsageMeter {...props} />;
}
