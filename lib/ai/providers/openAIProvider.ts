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
import {
  applyOpenAIStreamEvent,
  createOpenAIStreamState,
  reasoningForModel,
  responseVisibleText,
  retryOutputTokenBudget,
  shouldRetryEmptyResponse,
} from "./openAIResponse";

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

function logEmptyResponseRetry(
  requestId: string,
  model: string,
  originalBudget: number,
  retryBudget: number,
) {
  console.warn(
    JSON.stringify({
      scope: "ai_assistant",
      event: "provider_empty_response_retry",
      requestId,
      model,
      reason: "max_output_tokens",
      originalBudget,
      retryBudget,
      occurredAt: new Date().toISOString(),
    }),
  );
}

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
      let maximumOutputTokens = request.maximumOutputTokens;
      let totalInputTokens = 0;
      let totalOutputTokens = 0;

      for (let attempt = 0; attempt < 2; attempt += 1) {
        const result = await openai.responses.create(
          {
            model: config.primaryModel,
            instructions: request.systemInstructions,
            input: input(request),
            max_output_tokens: maximumOutputTokens,
            safety_identifier: request.safetyIdentifier,
            store: false,
            ...reasoningForModel(config.primaryModel, config.reasoningEffort),
          },
          { signal },
        );
        const text = responseVisibleText(result);
        totalInputTokens += result.usage?.input_tokens ?? 0;
        totalOutputTokens += result.usage?.output_tokens ?? 0;

        if (
          attempt === 0 &&
          shouldRetryEmptyResponse(text, result.incomplete_details?.reason)
        ) {
          const retryBudget = retryOutputTokenBudget(maximumOutputTokens);
          logEmptyResponseRetry(
            request.requestId,
            result.model,
            maximumOutputTokens,
            retryBudget,
          );
          maximumOutputTokens = retryBudget;
          continue;
        }

        if (result.status === "failed" || result.error)
          throw new AssistantError(
            "PROVIDER_ERROR",
            "The AI provider could not complete this request.",
            503,
            true,
          );

        if (!text.trim())
          throw new AssistantError(
            "PROVIDER_ERROR",
            "The AI provider could not produce a response. Please try again.",
            503,
            true,
          );

        return {
          text,
          model: result.model,
          provider: this.id,
          finishReason: result.status ?? "completed",
          usage: {
            inputTokens: totalInputTokens,
            outputTokens: totalOutputTokens,
          },
          requestId: request.requestId,
          createdAt: new Date().toISOString(),
        };
      }

      throw new AssistantError(
        "PROVIDER_ERROR",
        "The AI provider could not produce a response. Please try again.",
        503,
        true,
      );
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
      let maximumOutputTokens = request.maximumOutputTokens;
      let totalInputTokens = 0;
      let totalOutputTokens = 0;

      for (let attempt = 0; attempt < 2; attempt += 1) {
        const stream = await openai.responses.create(
          {
            model: config.primaryModel,
            instructions: request.systemInstructions,
            input: input(request),
            max_output_tokens: maximumOutputTokens,
            safety_identifier: request.safetyIdentifier,
            store: false,
            stream: true,
            ...reasoningForModel(config.primaryModel, config.reasoningEffort),
          },
          { signal },
        );
        const state = createOpenAIStreamState(config.primaryModel);

        for await (const event of stream) {
          const delta = applyOpenAIStreamEvent(state, event);
          if (delta) yield { type: "delta", text: delta };
          if (state.failed)
            throw new AssistantError(
              "PROVIDER_ERROR",
              "The AI provider could not complete this request.",
              503,
              true,
            );
        }
        totalInputTokens += state.inputTokens;
        totalOutputTokens += state.outputTokens;

        if (
          attempt === 0 &&
          shouldRetryEmptyResponse(state.text, state.incompleteReason)
        ) {
          const retryBudget = retryOutputTokenBudget(maximumOutputTokens);
          logEmptyResponseRetry(
            request.requestId,
            state.model,
            maximumOutputTokens,
            retryBudget,
          );
          maximumOutputTokens = retryBudget;
          continue;
        }

        if (!state.text.trim())
          throw new AssistantError(
            "PROVIDER_ERROR",
            "The AI provider could not produce a response. Please try again.",
            503,
            true,
          );

        yield {
          type: "complete",
          response: {
            text: state.text,
            model: state.model,
            provider: this.id,
            finishReason: state.finishReason,
            usage: {
              inputTokens: totalInputTokens,
              outputTokens: totalOutputTokens,
            },
            requestId: request.requestId,
            createdAt: new Date().toISOString(),
          },
        };
        return;
      }

      throw new AssistantError(
        "PROVIDER_ERROR",
        "The AI provider could not produce a response. Please try again.",
        503,
        true,
      );
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
