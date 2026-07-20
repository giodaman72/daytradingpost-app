import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = resolve(process.cwd(), "docs/supabase-academy-admin.sql");
const contentServicePath = resolve(
  process.cwd(),
  "lib/academy/admin/academyAdminContent.ts",
);
const enrollmentServicePath = resolve(
  process.cwd(),
  "lib/academy/admin/academyEnrollmentAdminService.ts",
);

describe("Academy admin database and data-minimization contract", () => {
  it("makes manual enrollment and progress reset audited and request-idempotent", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("admin_enroll_academy_course");
    expect(sql).toContain("academy_manual_enrollment");
    expect(sql).toContain("admin_manage_academy_enrollment");
    expect(sql).toContain("where request_id = p_request_id");
    expect(sql).toContain("p_confirmation <> 'RESET PROGRESS'");
    expect(sql).toContain("'academy_enrollment_' || p_action");
  });

  it("retains assessment history while auditing invalidation", async () => {
    const sql = await readFile(migrationPath, "utf8");
    const invalidation = sql.slice(
      sql.indexOf("admin_invalidate_academy_attempt"),
    );
    expect(invalidation).toContain("set status = 'invalidated'");
    expect(invalidation).toContain("academy_assessment_invalidated");
    expect(invalidation).not.toContain(
      "delete from public.academy_assessment_responses",
    );
  });

  it("requires explicit instructor assignments and blocks browser table access", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("academy_instructor_assignments");
    expect(sql).toMatch(
      /revoke all on\s+public\.academy_instructor_assignments,[\s\S]*from anon, authenticated/,
    );
  });

  it("does not select private notes or assessment answer keys for admin lists", async () => {
    const content = await readFile(contentServicePath, "utf8");
    const enrollment = await readFile(enrollmentServicePath, "utf8");
    expect(content).not.toMatch(/correctAnswer|correctOptionIds|numericAnswer/);
    expect(enrollment).not.toContain("academy_learner_notes");
    expect(enrollment).not.toContain("academy_assessment_responses");
  });

  it("records review reports without publishing private reporter data", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("academy_review_reports");
    expect(sql).toContain("moderation_status = 'reported'");
    expect(sql).toContain("unique(review_id, user_id)");
  });
});
