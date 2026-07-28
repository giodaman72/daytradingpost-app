import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AcademyAdminShell } from "@/components/academy/admin/AcademyAdminShell";
import { requireAcademyPermission } from "@/lib/academy/admin/academyAdminAuthorization";
import {
  academyStudioDocumentUrl,
  getAdminAcademyCourse,
} from "@/lib/academy/admin/academyAdminContent";

export const metadata: Metadata = {
  title: "Academy Course Validation",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AcademyCourseAdminDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAcademyPermission("academy:view");
  const course = await getAdminAcademyCourse((await params).id);
  if (!course) notFound();
  return (
    <AcademyAdminShell
      title={course.title}
      description={`Version ${course.version} · ${course.status} · ${course.accessLevel}. Editorial mutations remain inside Sanity Studio.`}
    >
      <div className="academy-admin-actions prominent">
        {course.slug ? (
          <Link className="button" href={`/academy/courses/${course.slug}`}>
            Preview public route
          </Link>
        ) : null}
        <Link
          className="button"
          href={academyStudioDocumentUrl(
            "academyCourse",
            course.studioDocumentId,
          )}
        >
          Edit in Studio
        </Link>
      </div>
      <section className="academy-admin-panel">
        <h2>Publishing validation</h2>
        {course.validationIssues.length ? (
          <ul className="academy-validation-list">
            {course.validationIssues.map((issue) => (
              <li
                className={issue.severity}
                key={`${issue.code}:${issue.path}`}
              >
                <strong>{issue.code}</strong>
                <span>{issue.message}</span>
                <code>{issue.path}</code>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            No blocking reference or curriculum validation issues were detected.
          </p>
        )}
      </section>
      <section className="academy-admin-panel">
        <h2>Structured curriculum</h2>
        <ol className="academy-curriculum-admin-list">
          {course.modules.map((courseModule) => (
            <li key={courseModule.id}>
              <header>
                <strong>
                  {courseModule.order}. {courseModule.title}
                </strong>
                <span>
                  {courseModule.required ? "Required" : "Optional"} ·{" "}
                  {courseModule.accessLevel} · v{courseModule.version}
                </span>
              </header>
              <p>
                Prerequisites:{" "}
                {courseModule.prerequisiteIds.join(", ") || "None"}
              </p>
              <ul>
                {courseModule.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <strong>
                      {lesson.order}. {lesson.title}
                    </strong>
                    <span>
                      {lesson.required ? "Required" : "Optional"} ·{" "}
                      {lesson.completionMode} · {lesson.accessLevel} ·{" "}
                      {lesson.status} · v{lesson.version}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
      <aside className="academy-admin-notice">
        Duplicate, schedule, publish, unpublish and archive through the Studio
        document menu. The application deliberately has no Sanity write token.
      </aside>
    </AcademyAdminShell>
  );
}
