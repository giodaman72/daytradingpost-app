import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sqlPath = resolve(
  process.cwd(),
  "docs/supabase-academy-personalization.sql",
);

describe("Academy personalization SQL", () => {
  it("enforces one active review per learner and course", async () => {
    const sql = await readFile(sqlPath, "utf8");
    expect(sql).toContain("academy_course_reviews_one_active_per_user_course");
    expect(sql).toContain("where deleted_at is null");
  });

  it("prevents browser roles from reading cross-user drafts or preferences", async () => {
    const sql = await readFile(sqlPath, "utf8");
    expect(sql).toContain("enable row level security");
    expect(sql).toMatch(
      /revoke all on public\.academy_learner_preferences, public\.academy_course_reviews\s+from anon, authenticated/,
    );
  });

  it("limits public aggregates to moderated, non-deleted reviews", async () => {
    const sql = await readFile(sqlPath, "utf8");
    expect(sql).toContain(
      "where moderation_status = 'published' and deleted_at is null",
    );
  });
});
