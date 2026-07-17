import "server-only";
import type {
  AssistantProviderRequest,
  AssistantProviderResponse,
} from "@/types/ai-assistant";
import { AssistantError } from "../assistantErrors";
import { classifyAssistantIntent } from "../safety/intentClassifier";
import type { AIProvider, AssistantProviderChunk } from "./AIProvider";

const FIXTURE_NOTICE =
  "**Development fixture — no external AI service was called.**";

function response(
  request: AssistantProviderRequest,
): AssistantProviderResponse {
  if (request.messages.at(-1)?.content.includes("[fixture:error]"))
    throw new AssistantError(
      "PROVIDER_ERROR",
      "The development provider returned a test error.",
      503,
    );
  if (request.messages.at(-1)?.content.includes("[fixture:timeout]"))
    throw new AssistantError(
      "PROVIDER_TIMEOUT",
      "The development provider timed out.",
      504,
      true,
    );
  const hasContext = Boolean(request.retrievedContext.trim());
  const text = hasContext
    ? `${FIXTURE_NOTICE}\n\nHere is a concise educational summary based only on the retrieved DayTradingPost context. Review the cited source timestamps and any delayed-data notices before relying on a market statement.\n\nEducational information only—not personalized investment advice.`
    : `${FIXTURE_NOTICE}\n\nNo relevant DayTradingPost source was available for this question. Try selecting an instrument, article, economic event, or Academy topic.`;
  return {
    text,
    model: "development-fixture-v1",
    provider: "development",
    finishReason: "stop",
    usage: {
      inputTokens: Math.ceil(
        (request.retrievedContext.length +
          request.messages.map((item) => item.content).join("").length) /
          4,
      ),
      outputTokens: Math.ceil(text.length / 4),
    },
    requestId: request.requestId,
    createdAt: new Date(0).toISOString(),
  };
}

export class DevelopmentAIProvider implements AIProvider {
  readonly id = "development";
  async generateResponse(request: AssistantProviderRequest) {
    return response(request);
  }
  async *streamResponse(
    request: AssistantProviderRequest,
  ): AsyncIterable<AssistantProviderChunk> {
    const result = response(request);
    for (const part of result.text.match(/.{1,36}(?:\s|$)/g) ?? [result.text])
      yield { type: "delta", text: part };
    yield { type: "complete", response: result };
  }
  summarizeContent(content: string, requestId: string) {
    return this.generateResponse({
      messages: [{ role: "user", content }],
      systemInstructions: "Create a concise fixture summary.",
      retrievedContext: content,
      outputFormat: "markdown",
      maximumOutputTokens: 300,
      temperature: 0,
      requestId,
    });
  }
  async classifyIntent(content: string) {
    return classifyAssistantIntent(content).intent;
  }
  async healthCheck() {
    return {
      configured: true,
      healthy: true,
      provider: this.id,
      message: "Deterministic development fixtures are enabled.",
    };
  }
}
