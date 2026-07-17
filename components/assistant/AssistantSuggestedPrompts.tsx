export function AssistantSuggestedPrompts({
  prompts,
  onSelect,
  disabled,
}: {
  prompts: readonly string[];
  onSelect: (prompt: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="assistant-prompts" aria-label="Suggested questions">
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
