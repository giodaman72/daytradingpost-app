import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import type { AcademyAttemptView } from "@/types/academy";
import { AssessmentLauncher } from "./AssessmentLauncher";

type AssessmentResultProps = {
  view: AcademyAttemptView;
};

export function AssessmentResult({ view }: AssessmentResultProps) {
  const passed = view.attempt.passed === true;
  const remainingAttempts = Math.max(
    0,
    view.assessment.maximumAttempts - view.attemptsUsed,
  );
  const responseMap = new Map(
    view.responses.map((response) => [response.questionId, response]),
  );
  return (
    <section
      className={`academy-assessment-result ${passed ? "passed" : "failed"}`}
    >
      <div className="academy-result-summary">
        {passed ? (
          <CheckCircle2 size={36} aria-hidden="true" />
        ) : (
          <XCircle size={36} aria-hidden="true" />
        )}
        <span className="section-kicker">
          {passed ? "Assessment passed" : "Assessment complete"}
        </span>
        <h2>{Math.round(view.attempt.scorePercent ?? 0)}%</h2>
        <p>
          Passing score: {view.assessment.passingScore}% · Attempt{" "}
          {view.attempt.attemptNumber}
        </p>
        <p>
          Submitted{" "}
          {view.attempt.submittedAt
            ? new Date(view.attempt.submittedAt).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "UTC",
              })
            : "—"}{" "}
          UTC · {remainingAttempts}{" "}
          {remainingAttempts === 1 ? "attempt" : "attempts"} remaining
        </p>
      </div>
      {view.responses.length ? (
        <ol className="academy-result-list">
          {view.questions.map((question, index) => {
            const response = responseMap.get(question.id);
            return (
              <li key={question.id}>
                <div>
                  <strong>
                    {index + 1}. {question.prompt}
                  </strong>
                  {response?.correct !== null &&
                  response?.correct !== undefined ? (
                    <span
                      className={response.correct ? "correct" : "incorrect"}
                    >
                      {response.correct ? "Correct" : "Review"}
                    </span>
                  ) : (
                    <span>Response recorded</span>
                  )}
                </div>
                {response?.feedback ? <p>{response.feedback}</p> : null}
              </li>
            );
          })}
        </ol>
      ) : null}
      {!passed ? (
        <p className="academy-result-guidance">
          <RotateCcw size={17} aria-hidden="true" />
          Review the lesson material before starting another attempt.
        </p>
      ) : null}
      {remainingAttempts > 0 ? (
        <AssessmentLauncher
          assessmentId={view.attempt.assessmentId}
          courseId={view.assessment.courseId}
          label="Start a new attempt"
        />
      ) : null}
    </section>
  );
}
