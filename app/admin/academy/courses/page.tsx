import type { Metadata } from "next";
import Link from "next/link";
import { AcademyAdminShell } from "@/components/academy/admin/AcademyAdminShell";
import { requireAcademyPermission } from "@/lib/academy/admin/academyAdminAuthorization";
import {
  academyStudioDocumentUrl,
  filterAdminCourses,
  listAdminAcademyCourses,
  summarizeValidation,
} from "@/lib/academy/admin/academyAdminContent";

export const metadata: Metadata = {
  title: "Academy Course Management",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AcademyCoursesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAcademyPermission("academy:view");
  const filters = await searchParams;
  const courses = filterAdminCourses(await listAdminAcademyCourses(), {
    query: filters.q,
    status: filters.status,
  });
  return (
    <AcademyAdminShell
      title="Course management"
      description="Sanity remains the source of truth. Validate and preview here, then use the protected Studio document workflow to edit, duplicate, schedule, publish, unpublish or archive."
    >
      <form className="academy-admin-filters" method="get">
        <label>
          Search
          <input
            defaultValue={filters.q}
            name="q"
            placeholder="Title, slug or instructor"
          />
        </label>
        <label>
          Status
          <select defaultValue={filters.status ?? "all"} name="status">
            {[
              "all",
              "draft",
              "review",
              "scheduled",
              "published",
              "archived",
            ].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <button className="button" type="submit">
          Filter courses
        </button>
      </form>
      <div className="academy-admin-table-wrap">
        <table className="academy-admin-table">
          <caption className="sr-only">Academy courses</caption>
          <thead>
            <tr>
              <th>Course</th>
              <th>Status</th>
              <th>Version</th>
              <th>Curriculum</th>
              <th>Validation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => {
              const validation = summarizeValidation(course.validationIssues);
              return (
                <tr key={course.id}>
                  <td>
                    <strong>{course.title}</strong>
                    <span>{course.instructor?.name ?? "Unassigned"}</span>
                  </td>
                  <td>
                    {course.status}
                    {course.publishedAt ? (
                      <span>
                        {new Date(course.publishedAt).toLocaleDateString(
                          "en-US",
                          { timeZone: "UTC" },
                        )}
                      </span>
                    ) : null}
                  </td>
                  <td>{course.version}</td>
                  <td>
                    {course.modules.length} modules ·{" "}
                    {course.modules.reduce(
                      (total, item) => total + item.lessons.length,
                      0,
                    )}{" "}
                    lessons
                  </td>
                  <td>
                    {validation.errors} errors · {validation.warnings} warnings
                  </td>
                  <td className="academy-admin-actions">
                    <Link href={`/admin/academy/courses/${course.id}`}>
                      Inspect
                    </Link>
                    {course.slug ? (
                      <Link href={`/academy/courses/${course.slug}`}>
                        Preview
                      </Link>
                    ) : null}
                    <Link
                      href={academyStudioDocumentUrl(
                        "academyCourse",
                        course.studioDocumentId,
                      )}
                    >
                      Open Studio
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!courses.length ? (
        <div className="academy-admin-empty">
          <h2>No courses match</h2>
          <p>Adjust the status or search filter.</p>
        </div>
      ) : null}
    </AcademyAdminShell>
  );
}
