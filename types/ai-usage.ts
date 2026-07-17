export type AssistantUsage = {
  usageDate: string;
  requestCount: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: string | null;
};

export type AssistantUsageSummary = AssistantUsage & {
  dailyLimit: number;
  remaining: number;
};
