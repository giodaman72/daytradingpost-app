import "server-only";
import { createHash } from "node:crypto";
import { getAssistantLimits } from "@/constants/ai-assistant";
import type {
  AssistantRequest,
  AssistantResponse,
  AssistantStreamEvent,
} from "@/types/ai-assistant";
import { AssistantError } from "./assistantErrors";
import { getAssistantConfig } from "./assistantConfig";
import { requireAssistantAccess } from "./assistantAuthorization";
import {
  createConversation,
  getConversation,
  getMessageByRequest,
  insertMessage,
  listConversations,
  listMessages,
} from "./assistantRepository";
import {
  acquireAssistantConcurrency,
  enforceAssistantRateLimit,
} from "./assistantRateLimit";
import { enforceAssistantUsage, recordAssistantUsage } from "./assistantUsage";
import {
  logAssistantError,
  logAssistantEvent,
  recordAssistantMetric,
} from "./assistantLogging";
import { getAIProvider } from "./providers";
import { buildSystemInstructions } from "./prompts/systemPrompt";
import { buildAssistantCitations } from "./retrieval/citationBuilder";
import { assembleRetrievedContext } from "./retrieval/contextAssembler";
import { retrieveAssistantContext } from "./retrieval/retrievalService";
import { getSafetyRefusal } from "./safety/financialSafety";
import { classifyAssistantIntent } from "./safety/intentClassifier";
import { redactObviousSecrets } from "./safety/promptInjectionDefense";
import {
  sanitizeAssistantMarkdown,
  normalizeAcademyTutorSourceMarkers,
  validateAssistantCitations,
} from "./safety/outputValidator";
import { safeConversationTitle } from "./assistantValidation";
import { evaluateAcademyTutorPolicy } from "@/lib/academy/ai/academyTutorPolicy";
import { isAcademyTutorAttemptActive } from "@/lib/academy/ai/academyTutorAssessment";
import {
  filterAuthorizedTutorMessages,
  isTutorConversationContextCompatible,
} from "@/lib/academy/ai/academyTutorMessages";

async function conversationFor(
  request: AssistantRequest,
  userId: string,
  premium: boolean,
) {
  if (request.conversationId) {
    const conversation = await getConversation(userId, request.conversationId);
    if (conversation.status === "archived")
      throw new AssistantError(
        "CONFLICT",
        "Restore this conversation before continuing it.",
        409,
      );
    if (conversation.contextMode !== request.contextMode)
      throw new AssistantError(
        "CONFLICT",
        "Start a new conversation when changing assistant modes.",
        409,
      );
    return conversation;
  }
  const limits = getAssistantLimits(premium);
  const current = await listConversations(
    userId,
    1,
    limits.maxConversations + 1,
  );
  if (current.length >= limits.maxConversations)
    throw new AssistantError(
      "LIMIT_REACHED",
      "Archive or delete an existing conversation before starting another.",
      429,
    );
  return createConversation(
    userId,
    safeConversationTitle(request.message),
    request.contextMode,
  );
}

function savedResponse(
  message: Awaited<ReturnType<typeof getMessageByRequest>>,
  requestId: string,
): AssistantResponse | null {
  if (!message) return null;
  return {
    conversationId: message.conversationId,
    messageId: message.id,
    text: message.content,
    citations: message.citations,
    model: message.model ?? "unknown",
    provider: message.provider ?? "unknown",
    finishReason: "idempotent_replay",
    usage: { inputTokens: 0, outputTokens: 0 },
    requestId,
    safetyFlags: message.safetyFlags as AssistantResponse["safetyFlags"],
    createdAt: message.createdAt,
  };
}

export async function* streamAssistantResponse(
  request: AssistantRequest,
  signal?: AbortSignal,
): AsyncIterable<AssistantStreamEvent> {
  const access = await requireAssistantAccess();
  const existing = savedResponse(
    await getMessageByRequest(access.userId, request.requestId, "assistant"),
    request.requestId,
  );
  if (existing) {
    yield {
      type: "start",
      requestId: request.requestId,
      conversationId: existing.conversationId,
    };
    yield { type: "delta", text: existing.text };
    yield { type: "complete", response: existing };
    return;
  }

  enforceAssistantRateLimit(access.userId);
  await enforceAssistantUsage(access.userId, access.hasPremiumAccess);
  const release = acquireAssistantConcurrency(access.userId);
  const startedAt = Date.now();
  try {
    const conversation = await conversationFor(
      request,
      access.userId,
      access.hasPremiumAccess,
    );
    const priorMessages =
      request.contextMode === "academy_tutor"
        ? await listMessages(access.userId, conversation.id, 50)
        : [];
    if (
      request.contextMode === "academy_tutor" &&
      !isTutorConversationContextCompatible(
        priorMessages,
        request.academyCourseSlug,
      )
    )
      throw new AssistantError(
        "CONFLICT",
        "Start a new Tutor conversation when changing courses.",
        409,
      );
    yield {
      type: "start",
      requestId: request.requestId,
      conversationId: conversation.id,
    };
    const activeAssessment = request.academyAttemptId
      ? await isAcademyTutorAttemptActive(request.academyAttemptId)
      : false;
    const generalClassification = classifyAssistantIntent(request.message);
    const academyDecision =
      request.contextMode === "academy_tutor"
        ? evaluateAcademyTutorPolicy(request.message, { activeAssessment })
        : null;
    const classification = academyDecision?.intent
      ? {
          intent: academyDecision.intent,
          flags: [
            ...new Set([
              ...generalClassification.flags,
              ...academyDecision.flags,
            ]),
          ],
        }
      : generalClassification;
    const cleanMessage = redactObviousSecrets(request.message);
    const sourceContext =
      request.contextMode === "academy_tutor"
        ? {
            academyCourseSlug: request.academyCourseSlug ?? null,
            academyLessonSlug: request.academyLessonSlug ?? null,
            academyTutorMode: request.academyTutorMode ?? null,
          }
        : undefined;
    await insertMessage({
      userId: access.userId,
      conversationId: conversation.id,
      role: "user",
      content: cleanMessage,
      contextMode: request.contextMode,
      requestId: request.requestId,
      safetyFlags: classification.flags,
      sourceContext,
    });

    const refusal =
      academyDecision?.refusal ?? getSafetyRefusal(classification.intent);
    if (refusal) {
      const message = await insertMessage({
        userId: access.userId,
        conversationId: conversation.id,
        role: "assistant",
        content: refusal,
        contextMode: request.contextMode,
        requestId: request.requestId,
        model: "deterministic-safety-policy",
        provider: "daytradingpost",
        safetyFlags: classification.flags,
        sourceContext,
      });
      await recordAssistantUsage(access.userId, 0, 0);
      await recordAssistantMetric({
        userId: access.userId,
        requestId: request.requestId,
        contextMode: request.contextMode,
        status: "refused",
        provider: "daytradingpost",
        durationMs: Date.now() - startedAt,
        safetyFlags: classification.flags,
      });
      const response: AssistantResponse = {
        conversationId: conversation.id,
        messageId: message.id,
        text: refusal,
        citations: [],
        model: "deterministic-safety-policy",
        provider: "daytradingpost",
        finishReason: "safety_refusal",
        usage: { inputTokens: 0, outputTokens: 0 },
        requestId: request.requestId,
        safetyFlags: classification.flags,
        createdAt: message.createdAt,
      };
      yield { type: "delta", text: refusal };
      yield { type: "complete", response };
      return;
    }

    const retrieval = await retrieveAssistantContext(
      request,
      access.userId,
      access.hasPremiumAccess,
    );
    if (!retrieval.documents.length)
      throw new AssistantError(
        "NO_CONTEXT",
        "No authorized DayTradingPost sources were found for this question.",
        422,
      );
    const citations = validateAssistantCitations(
      buildAssistantCitations(retrieval.documents),
      retrieval.documents,
    );
    const history = filterAuthorizedTutorMessages(
      await listMessages(access.userId, conversation.id, 12),
      access.hasPremiumAccess,
      request.contextMode === "academy_tutor"
        ? request.academyCourseSlug
        : undefined,
    );
    const provider = getAIProvider();
    const providerRequest = {
      messages: history.map(({ role, content }) => ({ role, content })),
      systemInstructions: buildSystemInstructions(
        request.contextMode,
        request.academyTutorMode,
      ),
      retrievedContext: assembleRetrievedContext(retrieval.documents),
      userContext: { accessLevel: access.accessLevel },
      outputFormat: "markdown" as const,
      maximumOutputTokens: getAssistantConfig().maximumOutputTokens,
      temperature: 0.2,
      requestId: request.requestId,
      safetyIdentifier: createHash("sha256")
        .update(`daytradingpost:${access.userId}`)
        .digest("hex"),
    };
    let providerResult = null;
    for await (const chunk of provider.streamResponse(
      providerRequest,
      signal,
    )) {
      if (chunk.type === "delta") yield chunk;
      else providerResult = chunk.response;
    }
    if (!providerResult)
      throw new AssistantError(
        "PROVIDER_ERROR",
        "The provider returned no response.",
        502,
      );
    const sanitized = sanitizeAssistantMarkdown(providerResult.text);
    const text =
      request.contextMode === "academy_tutor"
        ? normalizeAcademyTutorSourceMarkers(
            sanitized,
            retrieval.documents.length,
          )
        : sanitized;
    if (!text)
      throw new AssistantError(
        "PROVIDER_ERROR",
        "The provider returned an empty response.",
        502,
      );
    const saved = await insertMessage({
      userId: access.userId,
      conversationId: conversation.id,
      role: "assistant",
      content: text,
      citations,
      contextMode: request.contextMode,
      requestId: request.requestId,
      model: providerResult.model,
      provider: providerResult.provider,
      tokenUsage: providerResult.usage,
      safetyFlags: classification.flags,
      sourceContext,
    });
    await recordAssistantUsage(
      access.userId,
      providerResult.usage.inputTokens,
      providerResult.usage.outputTokens,
    );
    const response: AssistantResponse = {
      ...providerResult,
      text,
      conversationId: conversation.id,
      messageId: saved.id,
      citations,
      safetyFlags: classification.flags,
      createdAt: saved.createdAt,
    };
    logAssistantEvent("request_completed", {
      requestId: request.requestId,
      provider: providerResult.provider,
      durationMs: Date.now() - startedAt,
      citationCount: citations.length,
      contextMode: request.contextMode,
    });
    await recordAssistantMetric({
      userId: access.userId,
      requestId: request.requestId,
      contextMode: request.contextMode,
      status: "completed",
      provider: providerResult.provider,
      durationMs: Date.now() - startedAt,
      inputTokens: providerResult.usage.inputTokens,
      outputTokens: providerResult.usage.outputTokens,
      citationCount: citations.length,
      safetyFlags: classification.flags,
    });
    yield { type: "complete", response };
  } catch (error) {
    const code =
      error instanceof AssistantError ? error.code : "INTERNAL_ERROR";
    logAssistantError("request_failed", request.requestId, code);
    await recordAssistantMetric({
      userId: access.userId,
      requestId: request.requestId,
      contextMode: request.contextMode,
      status: "error",
      durationMs: Date.now() - startedAt,
      errorCode: code,
    });
    throw error;
  } finally {
    release();
  }
}
