import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { findOwnedCertificateRecord } from "./certificateRepository";

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: vi.fn(),
}));

const row = {
  certificate_number: "DTP-2026-ABCDEF123456",
  completion_date: "2026-07-19",
  course_id: "course-1",
  course_title_snapshot: "Course",
  course_version: 1,
  enrollment_id: "enrollment-1",
  id: "certificate-1",
  instructor_name_snapshot: null,
  issued_at: "2026-07-20T00:00:00Z",
  learner_display_name: "Alex",
  revocation_reason: null,
  revoked_at: null,
  score_snapshot: null,
  status: "issued",
  superseded_by_certificate_id: null,
  supersedes_certificate_id: null,
  user_id: "owner-1",
  verification_code: "opaque_code_12345678901234567890",
};

describe("certificate repository ownership", () => {
  beforeEach(() => vi.clearAllMocks());

  it("includes the authenticated owner in the private certificate predicate", async () => {
    const eq = vi.fn();
    const chain = {
      eq,
      maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }),
      select: vi.fn(),
    };
    chain.select.mockReturnValue(chain);
    eq.mockReturnValue(chain);
    vi.mocked(getSupabaseAdmin).mockReturnValue({
      from: vi.fn().mockReturnValue(chain),
    } as never);

    const result = await findOwnedCertificateRecord("owner-1", "certificate-1");
    expect(eq).toHaveBeenCalledWith("id", "certificate-1");
    expect(eq).toHaveBeenCalledWith("user_id", "owner-1");
    expect(result?.userId).toBe("owner-1");
  });
});
