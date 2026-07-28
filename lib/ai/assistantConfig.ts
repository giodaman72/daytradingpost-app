import "server-only";

const integer = (value: string | undefined, fallback: number, min: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min ? parsed : fallback;
};

export function getAssistantConfig() {
  const provider = process.env.AI_PROVIDER?.trim() || "unconfigured";
  const development =
    provider === "development" && process.env.NODE_ENV !== "production";

  return {
    provider: development ? "development" : provider,
    primaryModel: process.env.OPENAI_ASSISTANT_MODEL?.trim() || "",
    classifierModel: process.env.OPENAI_CLASSIFIER_MODEL?.trim() || "",
    requestTimeoutMs: integer(process.env.AI_REQUEST_TIMEOUT_MS, 30_000, 1_000),
    maximumOutputTokens: integer(process.env.AI_MAX_OUTPUT_TOKENS, 700, 100),
    maximumInputCharacters: integer(
      process.env.AI_MAX_INPUT_CHARACTERS,
      4_000,
      100,
    ),
    maximumContextCharacters: integer(
      process.env.AI_MAX_CONTEXT_CHARACTERS,
      16_000,
      1_000,
    ),
    maximumConcurrentRequests: integer(
      process.env.AI_MAX_CONCURRENT_REQUESTS,
      2,
      1,
    ),
    conversationRetentionDays: integer(
      process.env.AI_CONVERSATION_RETENTION_DAYS,
      180,
      1,
    ),
    openAIConfigured:
      provider === "openai" &&
      Boolean(process.env.OPENAI_API_KEY?.trim()) &&
      Boolean(process.env.OPENAI_ASSISTANT_MODEL?.trim()),
  } as const;
}

export function estimateAssistantCost(
  inputTokens: number,
  outputTokens: number,
) {
  const inputValue = process.env.AI_INPUT_COST_PER_MILLION?.trim();
  const outputValue = process.env.AI_OUTPUT_COST_PER_MILLION?.trim();
  if (!inputValue || !outputValue) return null;
  const inputPerMillion = Number(inputValue);
  const outputPerMillion = Number(outputValue);
  if (!Number.isFinite(inputPerMillion) || !Number.isFinite(outputPerMillion))
    return null;
  return (
    (Math.max(0, inputTokens) * inputPerMillion +
      Math.max(0, outputTokens) * outputPerMillion) /
    1_000_000
  );
}
