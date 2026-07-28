import "server-only";
import { AssistantError } from "../assistantErrors";
import { getAssistantConfig } from "../assistantConfig";
import type { AIProvider } from "./AIProvider";
import { DevelopmentAIProvider } from "./developmentProvider";
import { OpenAIProvider } from "./openAIProvider";

export function getAIProvider(): AIProvider {
  const config = getAssistantConfig();
  if (config.provider === "development") return new DevelopmentAIProvider();
  if (config.provider === "openai" && config.openAIConfigured)
    return new OpenAIProvider();
  throw new AssistantError(
    "PROVIDER_UNAVAILABLE",
    "The AI Assistant is unavailable until a server-side provider is configured.",
    503,
  );
}
