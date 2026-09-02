import Link from "next/link";
import type { AssistantContextMode } from "@/types/ai-context";
import type { Locale } from "@/lib/i18n/config";
import { localizeHref } from "@/lib/i18n/config";

export function AssistantContextActions({
  title = "Ask the AI Assistant",
  mode,
  instrument,
  article,
  event,
  prompts,
  locale = "en",
}: {
  title?: string;
  mode: AssistantContextMode;
  instrument?: string;
  article?: string;
  event?: string;
  prompts: readonly string[];
  locale?: Locale;
}) {
  const spanish = locale === "es";
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
        <span className="section-kicker">
          {spanish
            ? "Explicación de IA con fuentes"
            : "Grounded AI explanation"}
        </span>
        <h2 id="assistant-actions-title">{title}</h2>
        <p>
          {spanish
            ? "No se genera ninguna respuesta hasta que elijas una pregunta."
            : "No response is generated until you choose a question."}
        </p>
      </div>
      <div>
        {prompts.map((prompt) => {
          const query = new URLSearchParams(base);
          query.set("prompt", prompt);
          return (
            <Link
              href={localizeHref(`/assistant?${query}`, locale)}
              key={prompt}
            >
              {prompt}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
