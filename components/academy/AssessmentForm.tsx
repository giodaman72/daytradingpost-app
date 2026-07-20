"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AcademyAttempt, AcademyPublicQuestion } from "@/types/academy";
import {
  countUnansweredAssessmentQuestions,
  isAssessmentResponseAnswered,
  normalizeAssessmentSubmission,
} from "@/lib/academy/assessments/assessmentPresentation";
import {
  academyIdempotencyKey,
  academyRequest,
  recordAcademyClientEvent,
} from "./academyClient";

type AssessmentFormProps = {
  attempt: AcademyAttempt;
  courseId: string;
  initialRemainingSeconds: number | null;
  initialResponses?: Record<string, unknown>;
  questions: AcademyPublicQuestion[];
};

export function AssessmentForm({
  attempt,
  courseId,
  initialRemainingSeconds,
  initialResponses = {},
  questions,
}: AssessmentFormProps) {
  const router = useRouter();
  const [responses, setResponses] = useState<Record<string, unknown>>(() => ({
    ...Object.fromEntries(
      questions
        .filter((question) => question.questionType === "ordering")
        .map((question) => [
          question.id,
          question.answers.map((answer) => answer.id),
        ]),
    ),
    ...initialResponses,
  }));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(() => new Set());
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(
    initialRemainingSeconds,
  );
  const [error, setError] = useState<string | null>(null);
  const [orderingAnnouncement, setOrderingAnnouncement] = useState("");
  const [reviewingSubmission, setReviewingSubmission] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialRemainingSeconds === null) return;
    const reconcile = () => {
      if (!attempt.expiresAt) return;
      setRemainingSeconds(
        Math.max(
          0,
          Math.floor((Date.parse(attempt.expiresAt) - Date.now()) / 1_000),
        ),
      );
    };
    const timer = window.setInterval(reconcile, 1_000);
    document.addEventListener("visibilitychange", reconcile);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", reconcile);
    };
  }, [attempt.expiresAt, initialRemainingSeconds]);

  useEffect(() => {
    const hasResponses = Object.keys(responses).length > 0;
    if (!hasResponses || submitting) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [responses, submitting]);

  const setResponse = (questionId: string, value: unknown) => {
    setReviewingSubmission(false);
    setResponses((current) => ({ ...current, [questionId]: value }));
  };
  const currentQuestion = questions[currentIndex];
  const unansweredCount = countUnansweredAssessmentQuestions(
    questions,
    responses,
  );

  function moveOrderingAnswer(
    question: AcademyPublicQuestion,
    answerId: string,
    direction: -1 | 1,
  ) {
    const response = responses[question.id];
    const ordered = Array.isArray(response)
      ? ([...response] as string[])
      : question.answers.map((answer) => answer.id);
    const index = ordered.indexOf(answerId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    setResponse(question.id, ordered);
    const label =
      question.answers.find((answer) => answer.id === answerId)?.label ??
      "Answer";
    setOrderingAnnouncement(`${label} moved to position ${target + 1}.`);
  }

  function renderQuestion(question: AcademyPublicQuestion) {
    const value = responses[question.id];
    if (
      question.questionType === "single-choice" ||
      question.questionType === "true-false"
    )
      return question.answers.map((answer) => (
        <label className="academy-answer-option" key={answer.id}>
          <input
            type="radio"
            name={`question-${question.id}`}
            value={answer.id}
            checked={value === answer.id}
            onChange={() => setResponse(question.id, answer.id)}
          />
          <span>{answer.label}</span>
        </label>
      ));

    if (question.questionType === "multiple-choice") {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <>
          <p className="academy-question-guidance">Select all that apply.</p>
          {question.answers.map((answer) => (
            <label className="academy-answer-option" key={answer.id}>
              <input
                type="checkbox"
                checked={selected.includes(answer.id)}
                onChange={(event) =>
                  setResponse(
                    question.id,
                    event.target.checked
                      ? [...selected, answer.id]
                      : selected.filter((id) => id !== answer.id),
                  )
                }
              />
              <span>{answer.label}</span>
            </label>
          ))}
        </>
      );
    }

    if (question.questionType === "numeric")
      return (
        <label className="academy-answer-field">
          <span>Numeric answer</span>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={
              typeof value === "string" || typeof value === "number"
                ? value
                : ""
            }
            onChange={(event) => setResponse(question.id, event.target.value)}
          />
        </label>
      );

    if (question.questionType === "short-answer")
      return (
        <label className="academy-answer-field">
          <span>Your answer</span>
          <textarea
            rows={4}
            maxLength={5_000}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => setResponse(question.id, event.target.value)}
          />
        </label>
      );

    if (question.questionType === "matching") {
      const matches =
        value && typeof value === "object"
          ? (value as Record<string, string>)
          : {};
      const selectedTargets = new Set(Object.values(matches));
      return question.answers.map((answer) => (
        <label className="academy-match-row" key={answer.id}>
          <span>{answer.label}</span>
          <select
            value={matches[answer.id] ?? ""}
            onChange={(event) =>
              setResponse(question.id, {
                ...matches,
                [answer.id]: event.target.value,
              })
            }
          >
            <option value="">Choose match</option>
            {question.matchTargets?.map((target) => (
              <option
                value={target}
                key={target}
                disabled={
                  selectedTargets.has(target) && matches[answer.id] !== target
                }
              >
                {target}
              </option>
            ))}
          </select>
        </label>
      ));
    }

    const ordered = Array.isArray(value)
      ? (value as string[])
      : question.answers.map((answer) => answer.id);
    const answerMap = new Map(
      question.answers.map((answer) => [answer.id, answer.label]),
    );
    return (
      <>
        <p className="academy-question-guidance">
          Use the move controls to place the answers in order.
        </p>
        <ol className="academy-ordering-list">
          {ordered.map((answerId, index) => (
            <li key={answerId}>
              <span>
                <span className="sr-only">Position {index + 1}: </span>
                {answerMap.get(answerId)}
              </span>
              <div>
                <button
                  type="button"
                  onClick={() => moveOrderingAnswer(question, answerId, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${answerMap.get(answerId)} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveOrderingAnswer(question, answerId, 1)}
                  disabled={index === ordered.length - 1}
                  aria-label={`Move ${answerMap.get(answerId)} down`}
                >
                  ↓
                </button>
              </div>
            </li>
          ))}
        </ol>
        <p className="sr-only" aria-live="polite">
          {orderingAnnouncement}
        </p>
      </>
    );
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const result = await academyRequest<AcademyAttempt>(
        `/api/academy/attempts/${attempt.id}/submit`,
        {
          body: JSON.stringify({
            idempotencyKey: academyIdempotencyKey("assessment-submission"),
            responses: normalizeAssessmentSubmission(questions, responses),
          }),
          method: "POST",
        },
      );
      recordAcademyClientEvent({
        assessmentId: attempt.assessmentId,
        courseId,
        name: "academy_assessment_submitted",
      });
      recordAcademyClientEvent({
        assessmentId: attempt.assessmentId,
        courseId,
        name: result.passed
          ? "academy_assessment_passed"
          : "academy_assessment_failed",
      });
      router.replace(`/academy/assessments/attempts/${attempt.id}/result`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The assessment could not be submitted.",
      );
      setReviewingSubmission(false);
    } finally {
      setSubmitting(false);
    }
  }

  const expired = remainingSeconds === 0;
  const timerWarning =
    remainingSeconds !== null && remainingSeconds <= 60
      ? "One minute or less remains."
      : remainingSeconds !== null && remainingSeconds <= 300
        ? "Five minutes or less remain."
        : "";

  if (!currentQuestion)
    return (
      <div className="academy-locked-state">
        <h2>No assessment questions are available.</h2>
        <p>This attempt cannot be completed. Return to the course and retry.</p>
      </div>
    );

  return (
    <section className="academy-assessment-form">
      <div className="academy-assessment-toolbar">
        {remainingSeconds !== null ? (
          <div className="academy-assessment-timer" role="timer">
            Time remaining: {Math.floor(remainingSeconds / 60)}:
            {String(remainingSeconds % 60).padStart(2, "0")}
          </div>
        ) : (
          <span>No time limit</span>
        )}
        <span>
          {questions.length - unansweredCount} of {questions.length} answered
        </span>
        <span>{flaggedIds.size} flagged for review</span>
      </div>
      <p className="sr-only" aria-live="assertive">
        {timerWarning}
      </p>
      <nav
        className="academy-question-navigator"
        aria-label="Assessment questions"
      >
        {questions.map((question, index) => {
          const answered = isAssessmentResponseAnswered(
            question,
            responses[question.id],
          );
          const flagged = flaggedIds.has(question.id);
          return (
            <button
              key={question.id}
              type="button"
              aria-current={index === currentIndex ? "step" : undefined}
              aria-label={`Question ${index + 1}, ${answered ? "answered" : "unanswered"}${flagged ? ", flagged" : ""}`}
              onClick={() => {
                setCurrentIndex(index);
                setReviewingSubmission(false);
              }}
            >
              {index + 1}
              <small>
                {flagged ? "Flagged" : answered ? "Answered" : "Open"}
              </small>
            </button>
          );
        })}
      </nav>
      <fieldset>
        <legend>
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          {currentQuestion.prompt}
        </legend>
        <button
          type="button"
          className="academy-flag-question"
          aria-pressed={flaggedIds.has(currentQuestion.id)}
          onClick={() =>
            setFlaggedIds((current) => {
              const next = new Set(current);
              if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
              else next.add(currentQuestion.id);
              return next;
            })
          }
        >
          {flaggedIds.has(currentQuestion.id)
            ? "Remove review flag"
            : "Flag for review"}
        </button>
        <div className="academy-answer-list">
          {renderQuestion(currentQuestion)}
        </div>
      </fieldset>
      <div className="academy-assessment-navigation">
        <button
          type="button"
          className="button button-secondary"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((current) => current - 1)}
        >
          Previous question
        </button>
        {currentIndex < questions.length - 1 ? (
          <button
            type="button"
            className="button"
            onClick={() => setCurrentIndex((current) => current + 1)}
          >
            Next question
          </button>
        ) : (
          <button
            type="button"
            className="button"
            onClick={() => setReviewingSubmission(true)}
            disabled={expired}
          >
            Review submission
          </button>
        )}
      </div>
      {reviewingSubmission ? (
        <div
          className="academy-submit-confirmation"
          role="alertdialog"
          aria-labelledby="academy-submit-title"
          aria-describedby="academy-submit-description"
        >
          <h2 id="academy-submit-title">Submit this assessment?</h2>
          <p id="academy-submit-description">
            {unansweredCount} unanswered and {flaggedIds.size} flagged. Formal
            submission is final for this attempt.
          </p>
          <div>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setReviewingSubmission(false)}
            >
              Keep reviewing
            </button>
            <button
              className="button"
              type="button"
              onClick={() => void submit()}
              disabled={submitting || expired}
            >
              {submitting ? "Submitting securely…" : "Confirm submission"}
            </button>
          </div>
        </div>
      ) : null}
      {error ? (
        <p className="academy-form-error" role="alert">
          {error}
        </p>
      ) : null}
      {expired ? (
        <p className="academy-form-error" role="alert">
          This attempt has expired. Refresh to confirm its server status.
        </p>
      ) : null}
    </section>
  );
}
