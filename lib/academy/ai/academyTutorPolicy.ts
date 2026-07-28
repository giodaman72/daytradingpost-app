import type {
  AssistantIntent,
  AssistantSafetyFlag,
} from "@/types/ai-assistant";

export type AcademyTutorPolicyDecision = {
  intent: AssistantIntent | null;
  flags: AssistantSafetyFlag[];
  refusal: string | null;
};

const policy = (
  intent: AssistantIntent,
  flag: AssistantSafetyFlag,
  refusal: string,
): AcademyTutorPolicyDecision => ({ intent, flags: [flag], refusal });

export function evaluateAcademyTutorPolicy(
  message: string,
  options: { activeAssessment?: boolean } = {},
): AcademyTutorPolicyDecision {
  const normalized = message.toLowerCase();
  if (
    /(answer key|correct answers?|solutions? sheet|teacher.?s? answers?)/i.test(
      normalized,
    )
  )
    return policy(
      "academy_answer_key",
      "answer_key_request",
      "I can’t provide or reconstruct answer keys. I can explain the underlying lesson concept or generate new, ungraded practice questions.",
    );
  if (
    options.activeAssessment ||
    /(answer|solve|complete|do|take).*(quiz|exam|assessment|graded question)/i.test(
      normalized,
    ) ||
    /(quiz|exam|assessment).*(for me|correct option|right answer)/i.test(
      normalized,
    )
  )
    return policy(
      options.activeAssessment
        ? "academy_active_assessment"
        : "academy_assessment_completion",
      options.activeAssessment ? "active_assessment" : "assessment_completion",
      "I can’t answer or complete an active or graded assessment. I can explain the lesson concept without applying it to the assessment question, or help review permitted feedback after submission.",
    );
  if (
    /(certify|certificate|credential).*(without|skip|fake|grant|issue)|claim.*certified/i.test(
      normalized,
    )
  )
    return policy(
      "academy_certification_claim",
      "certification_claim",
      "I can’t issue, bypass, or misrepresent Academy certification. Certificates are created only by the verified LMS completion workflow.",
    );
  if (
    /(dump|extract|copy|reveal|show).*(premium|locked|unpublished|draft).*(course|lesson|content|article)|bypass.*(paywall|premium)/i.test(
      normalized,
    )
  )
    return policy(
      "academy_premium_extraction",
      "premium_extraction",
      "I can’t expose premium, locked, draft, or unpublished material. I can help with content your account is authorized to access.",
    );
  return { intent: null, flags: [], refusal: null };
}

export function isFinalAssessmentStatus(status: string) {
  return ["graded", "passed", "failed"].includes(status);
}
