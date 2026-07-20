import { beforeEach, describe, expect, it, vi } from "vitest";
import { AcademyError } from "@/lib/academy/academyErrors";
import { buildCertificatePdf } from "@/lib/academy/certificates/certificatePdf";
import { getOwnedCertificate } from "@/lib/academy/certificates/certificateService";
import { GET } from "./route";

vi.mock("@/lib/academy/certificates/certificateService", () => ({
  getCertificateVerificationUrl: vi.fn(),
  getOwnedCertificate: vi.fn(),
}));

vi.mock("@/lib/academy/certificates/certificatePdf", () => ({
  buildCertificatePdf: vi.fn(),
}));

describe("certificate PDF download authorization", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not render a PDF when the owner check fails", async () => {
    vi.mocked(getOwnedCertificate).mockRejectedValue(
      new AcademyError("ACADEMY_FORBIDDEN", "Certificate was not found."),
    );
    const response = await GET(
      new Request(
        "https://daytradingpost.com/api/academy/certificates/other/download",
      ),
      { params: Promise.resolve({ certificateId: "other" }) },
    );
    expect(response.status).toBe(403);
    expect(buildCertificatePdf).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      code: "ACADEMY_FORBIDDEN",
    });
  });
});
