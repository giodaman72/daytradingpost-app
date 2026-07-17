import "server-only";
import OpenAI from "openai";
import type {
  AssistantProviderRequest,
  AssistantProviderResponse,
} from "@/types/ai-assistant";
import { AssistantError } from "../assistantErrors";
import { getAssistantConfig } from "../assistantConfig";
import { classifyAssistantIntent } from "../safety/intentClassifier";
import type { AIProvider, AssistantProviderChunk } from "./AIProvider";

let client: OpenAI | null = null;

function getClient() {
  const config = getAssistantConfig();
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!config.openAIConfigured || !apiKey)
    throw new AssistantError(
      "PROVIDER_UNAVAILABLE",
      "The AI Assistant is not configured right now.",
      503,
    );
  client ??= new OpenAI({
    apiKey,
    timeout: config.requestTimeoutMs,
    maxRetries: 1,
  });
  return { client, config };
}

const input = (request: AssistantProviderRequest) => [
  ...request.messages.slice(-12).map((message) => ({
    role: message.role,
    content: message.content,
  })),
  {
    role: "user" as const,
    content: `UNTRUSTED RETRIEVED CONTEXT\n---\n${request.retrievedContext || "No context available."}\n---\nAnswer the latest user question using only applicable supplied context.`,
  },
];

function providerError(error: unknown): never {
  if (error instanceof AssistantError) throw error;
  if (error instanceof OpenAI.APIError) {
    if (
      error.status === 408 ||
      error.status === 429 ||
      (error.status ?? 0) >= 500
    )
      throw new AssistantError(
        "PROVIDER_ERROR",
        "The AI provider is temporarily unavailable. Please try again.",
        503,
        true,
      );
    throw new AssistantError(
      "PROVIDER_ERROR",
      "The AI provider rejected this request.",
      502,
    );
  }
  if (error instanceof Error && /timeout|aborted/i.test(error.message))
    throw new AssistantError(
      "PROVIDER_TIMEOUT",
      "The AI provider took too long to respond.",
      504,
      true,
    );
  throw new AssistantError(
    "PROVIDER_ERROR",
    "The AI provider is unavailable.",
    503,
    true,
  );
}

export class OpenAIProvider implements AIProvider {
  readonly id = "openai";

  async generateResponse(
    request: AssistantProviderRequest,
    signal?: AbortSignal,
  ): Promise<AssistantProviderResponse> {
    try {
      const { client: openai, config } = getClient();
      const result = await openai.responses.create(
        {
          model: config.primaryModel,
          instructions: request.systemInstructions,
          input: input(request),
          max_output_tokens: request.maximumOutputTokens,
        },
        { signal },
      );
      return {
        text: result.output_text,
        model: result.model,
        provider: this.id,
        finishReason: result.status ?? "completed",
        usage: {
          inputTokens: result.usage?.input_tokens ?? 0,
          outputTokens: result.usage?.output_tokens ?? 0,
        },
        requestId: request.requestId,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      providerError(error);
    }
  }

  async *streamResponse(
    request: AssistantProviderRequest,
    signal?: AbortSignal,
  ): AsyncIterable<AssistantProviderChunk> {
    try {
      const { client: openai, config } = getClient();
      const stream = await openai.responses.create(
        {
          model: config.primaryModel,
          instructions: request.systemInstructions,
          input: input(request),
          max_output_tokens: request.maximumOutputTokens,
          stream: true,
        },
        { signal },
      );
      let text = "";
      let model = config.primaryModel;
      let finishReason = "completed";
      let inputTokens = 0;
      let outputTokens = 0;
      for await (const event of stream) {
        if (event.type === "response.output_text.delta") {
          text += event.delta;
          yield { type: "delta", text: event.delta };
        } else if (event.type === "response.completed") {
          model = event.response.model;
          finishReason = event.response.status ?? "completed";
          inputTokens = event.response.usage?.input_tokens ?? 0;
          outputTokens = event.response.usage?.output_tokens ?? 0;
        }
      }
      yield {
        type: "complete",
        response: {
          text,
          model,
          provider: this.id,
          finishReason,
          usage: { inputTokens, outputTokens },
          requestId: request.requestId,
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      providerError(error);
    }
  }

  summarizeContent(content: string, requestId: string) {
    return this.generateResponse({
      messages: [
        { role: "user", content: "Summarize this published content." },
      ],
      systemInstructions:
        "Summarize only the supplied content in concise plain language.",
      retrievedContext: content,
      outputFormat: "markdown",
      maximumOutputTokens: 350,
      temperature: 0,
      requestId,
    });
  }
  async classifyIntent(content: string) {
    return classifyAssistantIntent(content).intent;
  }
  async healthCheck() {
    const config = getAssistantConfig();
    return {
      configured: config.openAIConfigured,
      healthy: config.openAIConfigured,
      provider: this.id,
      message: config.openAIConfigured
        ? "OpenAI server configuration is present."
        : "OpenAI server configuration is incomplete.",
    };
  }
}
