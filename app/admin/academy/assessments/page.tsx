import type { Metadata } from "next";
import Link from "next/link";
import { AcademyAdminShell } from "@/components/academy/admin/AcademyAdminShell";
import { requireAcademyPermission } from "@/lib/academy/admin/academyAdminAuthorization";
import {
  academyStudioDocumentUrl,
  listAdminAcademyAssessments,
} from "@/lib/academy/admin/academyAdminContent";
import { invalidateAssessmentAttemptAction } from "./actions";

export const metadata: Metadata = {
  title: "Academy Assessment Management",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AcademyAssessmentsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireAcademyPermission("academy:manage-assessments");
  const [assessments, query] = await Promise.all([
    listAdminAcademyAssessments(),
    searchParams,
  ]);
  return (
    <AcademyAdminShell
      title="Assessment management"
      description="Review assessment availability and validation without loading answer keys or individual learner responses."
    >
      {query.notice ? (
        <p className="form-status" role="status">
          {query.notice === "invalidated"
            ? "Assessment attempt invalidated and audited."
            : "Assessment invalidation failed."}
        </p>
      ) : null}
      <section className="academy-admin-panel">
        <h2>Invalidate an attempt</h2>
        <p>
          This changes status only; responses and historical scores remain
          retained for audit. It does not allow manual score editing.
        </p>
        <form
          action={invalidateAssessmentAttemptAction}
          className="academy-admin-filters"
        >
          <label>
            Attempt ID
            <input name="attemptId" required />
          </label>
          <label>
            Reason
            <input maxLength={500} name="reason" required />
          </label>
          <label>
            Confirmation
            <input name="confirmation" placeholder="INVALIDATE" required />
          </label>
          <button className="button" type="submit">
            Invalidate attempt
          </button>
        </form>
      </section>
      <div className="academy-admin-table-wrap">
        <table className="academy-admin-table">
          <caption className="sr-only">Academy assessment metadata</caption>
          <thead>
            <tr>
              <th>Assessment</th>
              <th>Status</th>
              <th>Questions</th>
              <th>Passing score</th>
              <th>Attempts</th>
              <th>Availability</th>
              <th>Validation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((assessment) => (
              <tr key={assessment.id}>
                <td>
                  <strong>{assessment.title}</strong>
                  <span>
                    Version {assessment.version}
                    {assessment.premium ? " · Premium" : ""}
                  </span>
                </td>
                <td>{assessment.status}</td>
                <td>{assessment.questionCount}</td>
                <td>{assessment.passingScore}%</td>
                <td>{assessment.maximumAttempts}</td>
                <td>
                  {assessment.availableFrom
                    ? new Date(assessment.availableFrom).toLocaleDateString(
                        "en-US",
                        { timeZone: "UTC" },
                      )
                    : "Immediate"}{" "}
                  –{" "}
                  {assessment.availableUntil
                    ? new Date(assessment.availableUntil).toLocaleDateString(
                        "en-US",
                        { timeZone: "UTC" },
                      )
                    : "No expiry"}
                </td>
                <td>
                  {assessment.validationIssues.length
                    ? assessment.validationIssues.join(" ")
                    : "Ready"}
                </td>
                <td>
                  <Link
                    href={academyStudioDocumentUrl(
                      "academyAssessment",
                      assessment.studioDocumentId,
                    )}
                  >
                    Validate in Studio
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!assessments.length ? (
        <div className="academy-admin-empty">
          <h2>No assessments</h2>
          <p>Create assessment content in Sanity Studio.</p>
        </div>
      ) : null}
      <p className="academy-admin-notice">
        Correct answers and grading keys are intentionally excluded from this
        interface. Grading services retrieve them only with server-side
        authorization.
      </p>
    </AcademyAdminShell>
  );
}
