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
        "create or replace function public.reissue_academy_certificate",
      ),
    );
    expect(revocation).toContain("where request_id = p_request_id");
    expect(revocation).toContain("update public.academy_certificates");
    expect(revocation).toContain("insert into public.academy_admin_audit");
    expect(revocation).not.toContain("delete from public.academy_certificates");
  });

  it("reissues revoked certificates transactionally without rewriting snapshots", async () => {
    const sql = await readFile(migrationPath, "utf8");
    const reissue = sql.slice(
      sql.indexOf(
        "create or replace function public.reissue_academy_certificate",
      ),
      sql.indexOf(
        "create or replace function public.protect_academy_certificate_snapshot",
      ),
    );
    expect(reissue).toContain("where request_id = p_request_id");
    expect(reissue).toContain("certificate.status <> 'revoked'");
    expect(reissue).toContain("pg_advisory_xact_lock");
    expect(reissue).toContain("supersedes_certificate_id");
    expect(reissue).toContain("superseded_by_certificate_id = replacement_id");
    expect(reissue).toContain("'academy_certificate_reissued'");
    expect(reissue).not.toContain("delete from public.academy_certificates");
  });
});
