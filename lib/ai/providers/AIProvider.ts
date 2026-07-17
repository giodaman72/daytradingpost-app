import type {
  AssistantProviderRequest,
  AssistantProviderResponse,
} from "@/types/ai-assistant";

export type AssistantProviderChunk =
  | { type: "delta"; text: string }
  | { type: "complete"; response: AssistantProviderResponse };

export type AssistantProviderHealth = {
  configured: boolean;
  healthy: boolean;
  provider: string;
  message: string;
};

export interface AIProvider {
  readonly id: string;
  generateResponse(
    request: AssistantProviderRequest,
    signal?: AbortSignal,
  ): Promise<AssistantProviderResponse>;
  streamResponse(
    request: AssistantProviderRequest,
    signal?: AbortSignal,
  ): AsyncIterable<AssistantProviderChunk>;
  summarizeContent(
    content: string,
    requestId: string,
  ): Promise<AssistantProviderResponse>;
  classifyIntent(content: string): Promise<string>;
  healthCheck(): Promise<AssistantProviderHealth>;
}
