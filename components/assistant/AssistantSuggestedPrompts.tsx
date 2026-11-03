import { academyLessonText } from "@/lib/academy/academyLessonText";
import type { Locale } from "@/lib/i18n/config";
export function AssistantSuggestedPrompts({
  prompts,
  onSelect,
  disabled,
  locale = "en",
}: {
  prompts: readonly string[];
  onSelect: (prompt: string) => void;
  disabled: boolean;
  locale?: Locale;
}) {
  const tr = academyLessonText(locale);
  return (
    <div className="assistant-prompts" aria-label={tr("Suggested questions")}>
      {prompts.map((prompt) => (
        <button
          type="button"
          onClick={() => onSelect(prompt)}
          disabled={disabled}
          key={prompt}
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
