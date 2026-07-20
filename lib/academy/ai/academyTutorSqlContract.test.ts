import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  join(process.cwd(), "docs/supabase-ai-assistant.sql"),
  "utf8",
).toLowerCase();

describe("Academy Tutor persistence contract", () => {
  it("keeps conversations, messages and feedback owner-readable only", () => {
    expect(sql).toContain("members read own ai conversations");
    expect(sql).toContain("members read own ai messages");
    expect(sql).toContain("members read own ai feedback");
    expect(
      sql.match(/using \(user_id = \(select auth\.uid\(\)\)\)/g),
    ).toHaveLength(4);
    expect(sql).toContain(
      "revoke all on public.ai_conversations, public.ai_messages, public.ai_usage, public.ai_feedback from anon, authenticated",
    );
  });

  it("cascades permanent conversation deletion through messages and feedback", () => {
    expect(sql).toMatch(
      /conversation_id uuid not null references public\.ai_conversations\(id\) on delete cascade/g,
    );
    expect(sql).toContain(
      "message_id uuid not null references public.ai_messages(id) on delete cascade",
    );
  });
});
