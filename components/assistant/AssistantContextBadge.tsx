import type { AssistantContextMode } from "@/types/ai-context";

export function AssistantContextBadge({
  mode,
}: {
  mode: AssistantContextMode;
}) {
  return (
    <span className="assistant-context-badge">{mode.replaceAll("_", " ")}</span>
  );
}
