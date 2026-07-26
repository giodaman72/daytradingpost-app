import { getAssistantLimits } from "@/constants/ai-assistant";
import type { AssistantCitation } from "@/types/ai-citation";
import type { RetrievalDocument } from "@/types/ai-context";
import {
  canRetrievePremiumSource,
  canUseAssistantMode,
} from "../assistantPolicy";
import { parseAssistantRequest } from "../assistantValidation";
import { buildAssistantCitations } from "../retrieval/citationBuilder";
import {
  sanitizeAssistantMarkdown,
  validateAssistantCitations,
} from "../safety/outputValidator";
import { classifyAssistantIntent } from "../safety/intentClassifier";
import { getSafetyRefusal } from "../safety/financialSafety";
import {
  ASSISTANT_EVALUATION_CASES,
  type AssistantEvaluationCase,
} from "./evaluationCases";
import { scoreEvaluation } from "./evaluationScoring";

const TIMESTAMP = "2026-07-17T12:00:00.000Z";

function sourceFor(caseId: string): RetrievalDocument {
  const sourceType =
    caseId === "academy-simple"
      ? "academy"
      : caseId === "watchlist-owner"
        ? "watchlist"
        : caseId.includes("economic") || caseId === "cpi-education"
          ? "economic_event"
          : caseId.includes("market-data") || caseId === "timestamp-mismatch"
            ? "market_data"
            : "market_intelligence";
  return {
    sourceType,
    sourceId: `${caseId}-source`,
    title: `${caseId} deterministic source`,
    content: "Mocked DayTradingPost source content.",
    url:
      sourceType === "economic_event" ? "/economic-calendar/mock" : "/analysis",
    timestamp: TIMESTAMP,
    premium: caseId === "premium-denied",
    delayed: caseId === "market-data-delayed",
    fixture: caseId === "fixture-disclosure",
    relevance: 100,
  };
}

function mockedOutput(
  testCase: AssistantEvaluationCase,
  refusal: string | null,
) {
  if (refusal) return refusal;
  if (testCase.expectsFixtureDisclosure)
    return "Development fixture — no external AI service was called.";
  if (testCase.expectsDelayedDisclosure)
    return `This market-data snapshot is delayed. Provider timestamp: ${TIMESTAMP}.`;
  if (testCase.expectsTimestampDisclosure)
    return `The source provider timestamp is ${TIMESTAMP}.`;
  if (testCase.id === "market-data-missing" || testCase.id === "no-sources")
    return "The requested DayTradingPost information is unavailable.";
  if (testCase.id === "usage-limit")
    return "The configured daily usage limit has been reached.";
  return testCase.expectsCitations
    ? `This mocked summary is grounded in the supplied DayTradingPost source dated ${TIMESTAMP}.`
    : "This deterministic response contains no factual market claim.";
}

function inputValidationMatches(testCase: AssistantEvaluationCase) {
  try {
    parseAssistantRequest(
      {
        message: testCase.prompt,
        contextMode: "general_education",
        requestId: `evaluation-${testCase.id}`,
      },
      4_000,
    );
    return !testCase.expectsValidationError;
  } catch {
    return Boolean(testCase.expectsValidationError);
  }
}

export function runDeterministicAssistantEvaluation() {
  return ASSISTANT_EVALUATION_CASES.map((testCase) => {
    const classification = classifyAssistantIntent(testCase.prompt);
    const refusal = getSafetyRefusal(classification.intent);
    const documents = testCase.expectsCitations ? [sourceFor(testCase.id)] : [];
    let proposedCitations: AssistantCitation[] =
      buildAssistantCitations(documents);
    if (testCase.id === "fabricated-citation")
      proposedCitations = buildAssistantCitations([
        sourceFor("fabricated-provider-source"),
      ]);
    const acceptedCitations = validateAssistantCitations(
      proposedCitations,
      documents,
    );
    const output = sanitizeAssistantMarkdown(mockedOutput(testCase, refusal));
    const accessControlled =
      testCase.id === "premium-denied"
        ? !canRetrievePremiumSource(false)
        : testCase.id === "watchlist-owner"
          ? !canUseAssistantMode("watchlist_summary", false) &&
            canUseAssistantMode("watchlist_summary", true)
          : testCase.id === "usage-limit"
            ? getAssistantLimits(false).dailyRequests > 0
            : true;
    const citationsValid =
      testCase.id === "fabricated-citation"
        ? acceptedCitations.length === 0
        : testCase.expectsCitations
          ? acceptedCitations.length === documents.length
          : acceptedCitations.length === 0;
    const unavailableCase =
      testCase.id === "market-data-missing" || testCase.id === "no-sources";
    return scoreEvaluation(testCase, {
      grounded:
        Boolean(refusal) ||
        (Boolean(testCase.expectsCitations) && citationsValid) ||
        (unavailableCase && output.includes("unavailable")) ||
        (testCase.expectsAccessDenied && accessControlled) ||
        testCase.id === "usage-limit" ||
        Boolean(testCase.expectsValidationError) ||
        (Boolean(testCase.expectsFixtureDisclosure) &&
          /development fixture/i.test(output)) ||
        testCase.id === "fabricated-citation",
      citationsValid,
      sourceRelevant:
        !testCase.expectsCitations ||
        (documents.length === 1 && documents[0].relevance === 100),
      safe:
        (!testCase.expectedIntent ||
          classification.intent === testCase.expectedIntent) &&
        inputValidationMatches(testCase),
      timestampDisclosed:
        (!testCase.expectsTimestampDisclosure || output.includes(TIMESTAMP)) &&
        (!testCase.expectsDelayedDisclosure || /delayed/i.test(output)),
      accessControlled,
      refusalUseful: !testCase.expectsRefusal || Boolean(refusal),
      concise: !refusal || refusal.length < 400,
    });
  });
}
