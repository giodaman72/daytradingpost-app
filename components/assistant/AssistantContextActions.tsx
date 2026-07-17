import Link from "next/link";
import type { AssistantContextMode } from "@/types/ai-context";

export function AssistantContextActions({
  title = "Ask the AI Assistant",
  mode,
  instrument,
  article,
  event,
  prompts,
}: {
  title?: string;
  mode: AssistantContextMode;
  instrument?: string;
  article?: string;
  event?: string;
  prompts: readonly string[];
}) {
  const base = new URLSearchParams({ mode });
  if (instrument) base.set("instrument", instrument);
  if (article) base.set("article", article);
  if (event) base.set("event", event);
  return (
    <aside
      className="assistant-context-actions"
      aria-labelledby="assistant-actions-title"
    >
      <div>
        <span className="section-kicker">Grounded AI explanation</span>
        <h2 id="assistant-actions-title">{title}</h2>
        <p>No response is generated until you choose a question.</p>
      </div>
      <div>
        {prompts.map((prompt) => {
          const query = new URLSearchParams(base);
          query.set("prompt", prompt);
          return (
            <Link href={`/assistant?${query}`} key={prompt}>
              {prompt}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
