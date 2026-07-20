import type { Metadata } from "next";
import Link from "next/link";
import { AcademyAdminShell } from "@/components/academy/admin/AcademyAdminShell";
import { requireAcademyPermission } from "@/lib/academy/admin/academyAdminAuthorization";
import {
  listAdminAcademyAssessments,
  listAdminAcademyCourses,
} from "@/lib/academy/admin/academyAdminContent";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Academy Administration",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const sections = [
  ["/admin/academy/courses", "Courses", "Editorial status and validation"],
  [
    "/admin/academy/enrollments",
    "Enrollments",
    "Safe learner progress operations",
  ],
  [
    "/admin/academy/assessments",
    "Assessments",
    "Assessment metadata without answer keys",
  ],
  [
    "/admin/academy/certificates",
    "Certificates",
    "Lifecycle and audit history",
  ],
  ["/admin/academy/reviews", "Reviews", "Moderation queue"],
  ["/admin/academy/analytics", "Analytics", "Privacy-conscious aggregates"],
] as const;

export default async function AcademyAdminPage() {
  await requireAcademyPermission("academy:view-analytics");
  const [
    courses,
    assessments,
    enrollmentCount,
    pendingReviewCount,
    auditResult,
  ] = await Promise.all([
    listAdminAcademyCourses(),
    listAdminAcademyAssessments(),
    getSupabaseAdmin()
      .from("academy_enrollments")
      .select("id", { count: "exact", head: true }),
    getSupabaseAdmin()
      .from("academy_course_reviews")
      .select("id", { count: "exact", head: true })
      .eq("moderation_status", "pending")
      .is("deleted_at", null),
    getSupabaseAdmin()
      .from("academy_admin_audit")
      .select("id,actor_user_id,action,target_type,target_id,created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  const validationErrors = courses.reduce(
    (total, course) =>
      total +
      course.validationIssues.filter((issue) => issue.severity === "error")
        .length,
    0,
  );
  return (
    <AcademyAdminShell
      title="Academy administration"
      description="Manage editorial quality, learner operations and aggregate performance without exposing private learner content."
    >
      <dl className="academy-metric-grid">
        <div>
          <dt>Courses</dt>
          <dd>{courses.length}</dd>
        </div>
        <div>
          <dt>Validation errors</dt>
          <dd>{validationErrors}</dd>
        </div>
        <div>
          <dt>Assessments</dt>
          <dd>{assessments.length}</dd>
        </div>
        <div>
          <dt>Enrollments</dt>
          <dd>{enrollmentCount.count ?? 0}</dd>
        </div>
        <div>
          <dt>Reviews pending</dt>
          <dd>{pendingReviewCount.count ?? 0}</dd>
        </div>
      </dl>
      <div className="academy-admin-card-grid">
        {sections.map(([href, title, description]) => (
          <Link className="academy-admin-card" href={href} key={href}>
            <h2>{title}</h2>
            <p>{description}</p>
            <span>Open workspace →</span>
          </Link>
        ))}
      </div>
      <section className="academy-admin-panel">
        <h2>Recent sensitive-action audit</h2>
        <ul className="academy-audit-list">
          {(auditResult.data ?? []).map((entry) => (
            <li key={String(entry.id)}>
              <strong>{String(entry.action)}</strong>
              <span>
                {String(entry.target_type)} · {String(entry.target_id)}
              </span>
              <time dateTime={String(entry.created_at)}>
                {new Date(String(entry.created_at)).toLocaleString("en-US")}
              </time>
            </li>
          ))}
        </ul>
        {!auditResult.data?.length ? <p>No audit actions recorded.</p> : null}
      </section>
    </AcademyAdminShell>
  );
}
