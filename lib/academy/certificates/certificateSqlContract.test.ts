import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "docs/supabase-trading-academy-lms.sql",
);

describe("certificate database contract", () => {
  it("keeps issuance transactional, locked and idempotent", async () => {
    const sql = await readFile(migrationPath, "utf8");
    const issuance = sql.slice(
      sql.indexOf(
        "create or replace function public.issue_academy_certificate",
      ),
      sql.indexOf(
        "create or replace function public.revoke_academy_certificate",
      ),
    );
    expect(issuance).toContain("pg_advisory_xact_lock");
    expect(issuance).toContain("issuance_idempotency_key = p_idempotency_key");
    expect(issuance).toContain("status = 'issued'");
    expect(sql).toContain("academy_certificates_one_active_course_version");
    expect(sql).toContain("academy_certificates_protect_snapshot");
  });

  it("makes revocation non-destructive, audited and request-idempotent", async () => {
    const sql = await readFile(migrationPath, "utf8");
    const revocation = sql.slice(
      sql.indexOf(
        "create or replace function public.revoke_academy_certificate",
      ),
      sql.indexOf(
        "create or replace function public.protect_academy_certificate_snapshot",
      ),
    );
    expect(revocation).toContain("where request_id = p_request_id");
    expect(revocation).toContain("update public.academy_certificates");
    expect(revocation).toContain("insert into public.academy_admin_audit");
    expect(revocation).not.toContain("delete from public.academy_certificates");
  });
});
