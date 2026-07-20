import type { Metadata } from "next";
import { AcademyAdminShell } from "@/components/academy/admin/AcademyAdminShell";
import { listAdminAcademyEnrollments } from "@/lib/academy/admin/academyEnrollmentAdminService";
import { manageEnrollmentAction, manualEnrollmentAction } from "./actions";

export const metadata: Metadata = {
  title: "Academy Enrollment Management",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const notices: Record<string, string> = {
  enrolled: "The learner was enrolled and the action was audited.",
  "enroll-failed": "The enrollment could not be created.",
  updated: "The enrollment action completed and was audited.",
  "action-failed":
    "The enrollment action was rejected or could not be completed.",
};

export default async function AcademyEnrollmentsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; q?: string; status?: string }>;
}) {
  const filters = await searchParams;
  const enrollments = await listAdminAcademyEnrollments(filters);
  return (
    <AcademyAdminShell
      title="Enrollment management"
      description="Search safe learner progress summaries and perform policy-controlled, audited enrollment actions. Private notes and assessment responses are never loaded."
    >
      {filters.notice && notices[filters.notice] ? (
        <p className="form-status" role="status">
          {notices[filters.notice]}
        </p>
      ) : null}
      <section className="academy-admin-panel">
        <h2>Manual enrollment</h2>
        <form action={manualEnrollmentAction} className="academy-admin-filters">
          <label>
            Learner profile ID
            <input name="userId" required />
          </label>
          <label>
            Published course slug
            <input name="courseSlug" required />
          </label>
          <button className="button" type="submit">
            Enroll learner
          </button>
        </form>
      </section>
      <form className="academy-admin-filters" method="get">
        <label>
          Search
          <input
            defaultValue={filters.q}
            name="q"
            placeholder="Learner name, course or ID"
          />
        </label>
        <label>
          Status
          <select defaultValue={filters.status ?? ""} name="status">
            <option value="">All statuses</option>
            {[
              "enrolled",
              "in_progress",
              "completed",
              "paused",
              "revoked",
              "expired",
              "archived",
            ].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <button className="button" type="submit">
          Filter enrollments
        </button>
      </form>
      <div className="academy-admin-table-wrap">
        <table className="academy-admin-table">
          <caption className="sr-only">Academy enrollments</caption>
          <thead>
            <tr>
              <th>Learner</th>
              <th>Course</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Last access</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment.id}>
                <td>
                  <strong>{enrollment.learnerDisplayName}</strong>
                  <span>{enrollment.userId}</span>
                </td>
                <td>
                  {enrollment.courseSlug}
                  <span>Version {enrollment.courseVersion}</span>
                </td>
                <td>{enrollment.status}</td>
                <td>{Math.round(enrollment.progressPercent)}%</td>
                <td>
                  {enrollment.lastAccessedAt
                    ? new Date(enrollment.lastAccessedAt).toLocaleDateString(
                        "en-US",
                        { timeZone: "UTC" },
                      )
                    : "Not started"}
                </td>
                <td>
                  <details>
                    <summary>Manage</summary>
                    <form
                      action={manageEnrollmentAction}
                      className="academy-enrollment-admin-form"
                    >
                      <input
                        name="enrollmentId"
                        type="hidden"
                        value={enrollment.id}
                      />
                      <label>
                        Action
                        <select name="action" required>
                          <option value="pause">Pause</option>
                          <option value="revoke">Revoke access</option>
                          <option value="restore">Restore</option>
                          <option value="reset">Reset progress</option>
                        </select>
                      </label>
                      <label>
                        Reason
                        <input maxLength={500} name="reason" required />
                      </label>
                      <label>
                        Reset confirmation
                        <input
                          name="confirmation"
                          placeholder="RESET PROGRESS"
                        />
                      </label>
                      <button type="submit">Apply audited action</button>
                    </form>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!enrollments.length ? (
        <div className="academy-admin-empty">
          <h2>No enrollments match</h2>
          <p>Adjust the filters or manually enroll a learner.</p>
        </div>
      ) : null}
    </AcademyAdminShell>
  );
}
