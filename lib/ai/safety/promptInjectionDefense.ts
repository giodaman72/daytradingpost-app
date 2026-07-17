const INSTRUCTION_LINE =
  /(ignore|override|disregard).*(instruction|system|developer|safety)|(?:system|assistant)\s*:/i;

export function neutralizeRetrievedContent(value: string) {
  return value
    .split(/\r?\n/)
    .filter((line) => !INSTRUCTION_LINE.test(line))
    .join("\n")
    .replaceAll("```", "'''")
    .slice(0, 20_000);
}

export function redactObviousSecrets(value: string) {
  return value
    .replace(/\b(?:sk|rk|pk|gh[op])_[A-Za-z0-9_-]{16,}\b/g, "[REDACTED_SECRET]")
    .replace(
      /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b/g,
      "[REDACTED_TOKEN]",
    );
}
