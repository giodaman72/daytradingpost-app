import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Clock3, ShieldCheck } from "lucide-react";
import { AcademyPortableText } from "@/components/academy/AcademyPortableText";
import { AssessmentForm } from "@/components/academy/AssessmentForm";
import { getAssessmentAttemptForLearner } from "@/lib/academy/assessments/assessmentService";
import { AcademyError } from "@/lib/academy/academyErrors";

export const metadata: Metadata = {
  title: "Academy Assessment",
  description: "Private DayTradingPost Academy assessment attempt.",
  robots: { index: false, follow: false },
};

type AssessmentPageProps = {
  params: Promise<{ attemptId: string }>;
};

export default async function AssessmentPage({ params }: AssessmentPageProps) {
  const { attemptId } = await params;
  let view;
  try {
    view = await getAssessmentAttemptForLearner(attemptId);
  } catch (error) {
    if (error instanceof AcademyError) {
      if (error.code === "ACADEMY_UNAUTHENTICATED")
        redirect(
          `/login?next=${encodeURIComponent(`/academy/assessments/attempts/${attemptId}`)}`,
        );
      if (
        ["ACADEMY_FORBIDDEN", "ACADEMY_VALIDATION_FAILED"].includes(error.code)
      )
        notFound();
    }
    throw error;
  }
  const final = ["graded", "passed", "failed"].includes(view.attempt.status);
  const inactive = ["expired", "abandoned", "invalidated"].includes(
    view.attempt.status,
  );
  if (final) redirect(`/academy/assessments/attempts/${attemptId}/result`);
  return (
    <section className="academy-assessment-page">
      <div className="container academy-assessment-shell">
        <Link href="/academy/courses" className="text-link">
          <ArrowLeft size={15} aria-hidden="true" />
          Academy courses
        </Link>
        <header>
          <span className="section-kicker">Secure assessment</span>
          <h1>{view.assessment.title}</h1>
          <div>
            <span>
              <ShieldCheck size={15} aria-hidden="true" />
              Attempt {view.attempt.attemptNumber}
            </span>
            <span>
              <Clock3 size={15} aria-hidden="true" />
              {view.assessment.timeLimitMinutes
                ? `${view.assessment.timeLimitMinutes} minute limit`
                : "No time limit"}
            </span>
          </div>
          <AcademyPortableText value={view.assessment.instructions} />
        </header>
        {inactive ? (
          <div className="academy-locked-state">
            <span className="section-kicker">Attempt closed</span>
            <h1>This assessment attempt is {view.attempt.status}.</h1>
            <p>
              Return to the course lesson to review the material and check
              whether another attempt is available.
            </p>
            <Link href="/academy/courses" className="button">
              Return to courses
            </Link>
          </div>
        ) : (
          <AssessmentForm
            attempt={view.attempt}
            courseId={view.assessment.courseId}
            initialResponses={Object.fromEntries(
              view.responses.map((response) => [
                response.questionId,
                response.response,
              ]),
            )}
            initialRemainingSeconds={view.initialRemainingSeconds}
            questions={view.questions}
          />
        )}
      </div>
    </section>
  );
}
