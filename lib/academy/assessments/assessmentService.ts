import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AcademyAttempt, AcademyPublicQuestion } from "@/types/academy";
import { requireAcademyUser } from "../academyAuthorization";
import { AcademyError } from "../academyErrors";
import {
  findAssessmentForGrading,
  findEnrollmentByCourse,
} from "../academyRepository";
import { parseAcademyIdentifier } from "../academyValidation";
import { canAttemptAssessment } from "../academyAccess";
import { createAttemptOrdering } from "./assessmentRandomization";
import { scoreAssessment } from "./assessmentScoring";

const mapAttempt = (row: Record<string, unknown>): AcademyAttempt => ({
  assessmentId: String(row.assessment_id),
  assessmentVersion: Number(row.assessment_version),
  attemptNumber: Number(row.attempt_number),
  enrollmentId: String(row.enrollment_id),
  expiresAt: row.expires_at as string | null,
  id: String(row.id),
  maximumScore: row.maximum_score === null ? null : Number(row.maximum_score),
  passed: row.passed as boolean | null,
  randomizedAnswerOrders:
    (row.randomized_answer_orders as Record<string, string[]>) ?? {},
  randomizedQuestionIds: (row.randomized_question_ids as string[]) ?? [],
  score: row.score === null ? null : Number(row.score),
  scorePercent: row.score_percent === null ? null : Number(row.score_percent),
  startedAt: String(row.started_at),
  status: row.status as AcademyAttempt["status"],
  submittedAt: row.submitted_at as string | null,
  userId: String(row.user_id),
});

const publicQuestion = (
  question: Parameters<typeof scoreAssessment>[0][number],
): AcademyPublicQuestion => {
  const {
    correctAnswer: _answer,
    explanation: _explanation,
    ...safe
  } = question;
  return safe;
};

export async function startAssessmentAttempt(assessmentIdInput: string) {
  const access = await requireAcademyUser();
  const assessmentId = parseAcademyIdentifier(
    assessmentIdInput,
    "assessment ID",
  );
  const assessment = await findAssessmentForGrading(assessmentId);
  if (!assessment)
    throw new AcademyError(
      "ACADEMY_ASSESSMENT_NOT_AVAILABLE",
      "This assessment is not available.",
    );
  if (assessment.premium && !access.hasPremiumAccess)
    throw new AcademyError(
      "ACADEMY_PREMIUM_REQUIRED",
      "Premium membership is required for this assessment.",
    );
  const enrollment = await findEnrollmentByCourse(
    access.userId,
    assessment.courseId,
  );
  if (!enrollment)
    throw new AcademyError(
      "ACADEMY_NOT_ENROLLED",
      "Enroll in the course before starting this assessment.",
    );
  const { count } = await getSupabaseAdmin()
    .from("academy_assessment_attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", access.userId)
    .eq("assessment_id", assessmentId)
    .neq("status", "invalidated");
  const attemptsUsed = count ?? 0;
  const maximumAttempts = Math.min(
    assessment.maximumAttempts,
    access.limits.maxAssessmentAttempts,
  );
  const decision = canAttemptAssessment({
    access: { allowed: true, reason: "allowed" },
    attemptsUsed,
    availableFrom: assessment.availableFrom,
    availableUntil: assessment.availableUntil,
    maximumAttempts,
  });
  if (!decision.allowed)
    throw new AcademyError(
      decision.reason === "attempt-limit-reached"
        ? "ACADEMY_ATTEMPT_LIMIT_REACHED"
        : "ACADEMY_ASSESSMENT_NOT_AVAILABLE",
      "This assessment cannot be started right now.",
    );
  const attemptNumber = attemptsUsed + 1;
  const seed = `${access.userId}:${assessment.id}:${assessment.version}:${attemptNumber}`;
  const ordering = createAttemptOrdering(
    assessment.questions.map((question) => question.id),
    Object.fromEntries(
      assessment.questions.map((question) => [
        question.id,
        question.answers.map((answer) => answer.id),
      ]),
    ),
    seed,
    assessment.randomizeQuestions,
    assessment.randomizeAnswers,
  );
  const expiresAt = assessment.timeLimitMinutes
    ? new Date(Date.now() + assessment.timeLimitMinutes * 60_000).toISOString()
    : null;
  const { data, error } = await getSupabaseAdmin()
    .from("academy_assessment_attempts")
    .insert({
      assessment_id: assessment.id,
      assessment_version: assessment.version,
      attempt_number: attemptNumber,
      enrollment_id: enrollment.id,
      expires_at: expiresAt,
      randomized_answer_orders: ordering.randomizedAnswerOrders,
      randomized_question_ids: ordering.randomizedQuestionIds,
      user_id: access.userId,
    })
    .select()
    .single();
  if (error?.code === "23505")
    throw new AcademyError(
      "ACADEMY_RATE_LIMITED",
      "An assessment attempt was already created. Refresh and try again.",
    );
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Could not start assessment.",
    );
  const attempt = mapAttempt(data);
  const questionMap = new Map(
    assessment.questions.map((question) => [question.id, question]),
  );
  return {
    attempt,
    questions: attempt.randomizedQuestionIds
      .map((id) => questionMap.get(id))
      .filter((question): question is NonNullable<typeof question> =>
        Boolean(question),
      )
      .map(publicQuestion),
  };
}

export async function submitAssessmentAttempt(input: {
  attemptId: string;
  idempotencyKey: string;
  responses: Record<string, unknown>;
}) {
  const access = await requireAcademyUser();
  const attemptId = parseAcademyIdentifier(input.attemptId, "attempt ID");
  const { data, error } = await getSupabaseAdmin()
    .from("academy_assessment_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", access.userId)
    .maybeSingle();
  if (error || !data)
    throw new AcademyError(
      "ACADEMY_FORBIDDEN",
      "Assessment attempt was not found.",
    );
  const attempt = mapAttempt(data);
  if (
    ["graded", "passed", "failed"].includes(attempt.status) &&
    data.submission_idempotency_key === input.idempotencyKey
  )
    return attempt;
  if (attempt.status !== "started")
    throw new AcademyError(
      "ACADEMY_ATTEMPT_ALREADY_SUBMITTED",
      "This assessment attempt is already final.",
    );
  if (attempt.expiresAt && new Date(attempt.expiresAt) < new Date())
    throw new AcademyError(
      "ACADEMY_ATTEMPT_EXPIRED",
      "This assessment attempt has expired.",
    );
  const assessment = await findAssessmentForGrading(attempt.assessmentId);
  if (!assessment || assessment.version !== attempt.assessmentVersion)
    throw new AcademyError(
      "ACADEMY_ASSESSMENT_NOT_AVAILABLE",
      "This assessment version is unavailable. Contact support before retrying.",
    );
  const allowedIds = new Set(attempt.randomizedQuestionIds);
  if (Object.keys(input.responses).some((id) => !allowedIds.has(id)))
    throw new AcademyError(
      "ACADEMY_INVALID_RESPONSE",
      "A response does not belong to this attempt.",
    );
  const scoring = scoreAssessment(
    assessment.questions.filter((question) => allowedIds.has(question.id)),
    input.responses,
    assessment.passingScore,
  );
  const questionMap = new Map(
    assessment.questions.map((question) => [question.id, question]),
  );
  const responseRows = scoring.responses.map((result) => {
    const question = questionMap.get(result.questionId);
    return {
      awarded_points: result.awardedPoints,
      correct: result.correct,
      feedback:
        assessment.showExplanations && question?.explanation
          ? question.explanation
          : null,
      maximum_points: result.maximumPoints,
      normalized_response: input.responses[result.questionId] ?? null,
      question_id: result.questionId,
      response: input.responses[result.questionId] ?? null,
    };
  });
  const rpc = await getSupabaseAdmin().rpc("grade_academy_attempt", {
    p_attempt_id: attempt.id,
    p_grading_metadata: {
      assessmentVersion: assessment.version,
      scoringEngine: 1,
    },
    p_idempotency_key: input.idempotencyKey,
    p_maximum_score: scoring.maximumPoints,
    p_passed: scoring.passed,
    p_responses: responseRows,
    p_score: scoring.awardedPoints,
    p_score_percent: scoring.scorePercent,
    p_user_id: access.userId,
  });
  if (rpc.error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Assessment submission could not be saved safely.",
    );
  return mapAttempt(rpc.data as Record<string, unknown>);
}
