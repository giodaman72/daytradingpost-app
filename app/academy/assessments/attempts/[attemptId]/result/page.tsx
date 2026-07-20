import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AssessmentResult } from "@/components/academy/AssessmentResult";
import { AcademyError } from "@/lib/academy/academyErrors";
import { getAssessmentAttemptForLearner } from "@/lib/academy/assessments/assessmentService";

export const metadata: Metadata = {
  title: "Academy Assessment Result",
  description: "Private DayTradingPost Academy assessment result.",
  robots: { index: false, follow: false },
};

type AssessmentResultPageProps = {
  params: Promise<{ attemptId: string }>;
};

export default async function AssessmentResultPage({
  params,
}: AssessmentResultPageProps) {
  const { attemptId } = await params;
  let view;
  try {
    view = await getAssessmentAttemptForLearner(attemptId);
  } catch (error) {
    if (error instanceof AcademyError) {
      if (error.code === "ACADEMY_UNAUTHENTICATED")
        redirect(
          `/login?next=${encodeURIComponent(`/academy/assessments/attempts/${attemptId}/result`)}`,
        );
      if (
        ["ACADEMY_FORBIDDEN", "ACADEMY_VALIDATION_FAILED"].includes(error.code)
      )
        notFound();
    }
    throw error;
  }
  if (view.attempt.status === "started")
    redirect(`/academy/assessments/attempts/${attemptId}`);
  if (!["graded", "passed", "failed"].includes(view.attempt.status))
    return (
      <section className="academy-assessment-page">
        <div className="container academy-locked-state">
          <span className="section-kicker">Result unavailable</span>
          <h1>This attempt is {view.attempt.status}.</h1>
          <p>A result is available only after confirmed server grading.</p>
          <Link href="/academy/courses" className="button">
            Return to courses
          </Link>
        </div>
      </section>
    );
  return (
    <section className="academy-assessment-page">
      <div className="container academy-assessment-shell">
        <Link href="/academy/courses" className="text-link">
          <ArrowLeft size={15} aria-hidden="true" />
          Academy courses
        </Link>
        <header>
          <span className="section-kicker">Verified result</span>
          <h1>{view.assessment.title}</h1>
        </header>
        <AssessmentResult view={view} />
      </div>
    </section>
  );
}
