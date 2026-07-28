import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  join(process.cwd(), "docs/supabase-trading-academy-lms.sql"),
  "utf8",
);
const repository = readFileSync(
  join(process.cwd(), "lib/academy/academyRepository.ts"),
  "utf8",
);
const query = readFileSync(
  join(process.cwd(), "lib/academy/academyQueries.ts"),
  "utf8",
);

describe("learning path persistence boundaries", () => {
  it("shows only published and currently released paths publicly", () => {
    expect(query).toContain('status == "published"');
    expect(query).toContain("publishedAt <= now()");
  });

  it("prevents duplicate active path enrollments", () => {
    expect(sql).toContain("academy_path_enrollments_active_unique");
    expect(sql).toContain(
      "on public.academy_learning_path_enrollments(user_id, learning_path_id)",
    );
  });

  it("enforces owner-scoped reads in both RLS and repository access", () => {
    expect(sql).toContain("members read own academy path enrollments");
    expect(sql).toContain("using (user_id = (select auth.uid()))");
    expect(repository).toContain('.eq("user_id", userId)');
  });

  it("stores the path version captured at enrollment", () => {
    expect(sql).toContain("learning_path_version integer not null");
    expect(repository).toContain(
      "learning_path_version: input.learningPathVersion",
    );
  });
});
