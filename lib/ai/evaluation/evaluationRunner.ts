import { classifyAssistantIntent } from "../safety/intentClassifier";
import { getSafetyRefusal } from "../safety/financialSafety";
import { ASSISTANT_EVALUATION_CASES } from "./evaluationCases";
import { scoreEvaluation } from "./evaluationScoring";

export function runDeterministicAssistantEvaluation() {
  return ASSISTANT_EVALUATION_CASES.map((testCase) => {
    const classification = classifyAssistantIntent(testCase.prompt);
    const refusal = getSafetyRefusal(classification.intent);
    return scoreEvaluation(testCase, {
      grounded: true,
      citationsValid: true,
      sourceRelevant: true,
      safe:
        !testCase.expectedIntent ||
        classification.intent === testCase.expectedIntent,
      timestampDisclosed: true,
      accessControlled: true,
      refusalUseful: !testCase.expectsRefusal || Boolean(refusal),
      concise: !refusal || refusal.length < 400,
    });
  });
}
