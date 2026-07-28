import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import type { AcademyCertificate } from "@/types/academy";
import { buildCertificatePdf, createCertificateQrPng } from "./certificatePdf";
import {
  buildCertificateShareLinks,
  buildCertificateVerificationUrl,
} from "./certificateShare";
import {
  createCertificateNumber,
  createCertificateVerificationCode,
} from "./certificateNumber";

const certificate: AcademyCertificate = {
  certificateNumber: "DTP-2026-A1B2C3D4E5F6",
  completionDate: "2026-07-19",
  courseId: "course-1",
  courseTitleSnapshot: "Risk Management Foundations",
  courseVersion: 2,
  enrollmentId: "enrollment-1",
  id: "certificate-internal-id",
  instructorNameSnapshot: "Morgan Lee",
  issuedAt: "2026-07-20T12:00:00.000Z",
  learnerDisplayName: "Alex Trader",
  revocationReason: null,
  revokedAt: null,
  scoreSnapshot: 92,
  status: "issued",
  supersededByCertificateId: null,
  supersedesCertificateId: null,
  userId: "private-user-id",
  verificationCode: "opaque_code_12345678901234567890",
};

describe("certificate identifiers and sharing", () => {
  it("creates unique certificate numbers and high-entropy opaque codes", () => {
    const numbers = new Set(
      Array.from({ length: 20 }, () =>
        createCertificateNumber(new Date("2026-07-20")),
      ),
    );
    const code = createCertificateVerificationCode();
    expect(numbers.size).toBe(20);
    expect([...numbers][0]).toMatch(/^DTP-2026-[A-F0-9]{12}$/);
    expect(code).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("builds a verification-only share URL without internal identifiers", () => {
    const url = buildCertificateVerificationUrl(
      "https://daytradingpost.com/private?email=hidden",
      certificate.verificationCode,
    );
    const links = buildCertificateShareLinks(url);
    expect(url).toBe(
      `https://daytradingpost.com/verify/certificate/${certificate.verificationCode}`,
    );
    expect(JSON.stringify(links)).not.toContain(certificate.id);
    expect(JSON.stringify(links)).not.toContain(certificate.userId);
    expect(links.linkedin).toContain(encodeURIComponent(url));
  });

  it("encodes only the public verification URL in the QR code", async () => {
    const url = buildCertificateVerificationUrl(
      "https://daytradingpost.com",
      certificate.verificationCode,
    );
    const png = await createCertificateQrPng(url);
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect(url).not.toContain(certificate.id);
    expect(url).not.toContain(certificate.userId);
  });

  it("renders a valid, branded PDF document", async () => {
    const verificationUrl = buildCertificateVerificationUrl(
      "https://daytradingpost.com",
      certificate.verificationCode,
    );
    const bytes = await buildCertificatePdf({ certificate, verificationUrl });
    expect(Buffer.from(bytes).subarray(0, 5).toString()).toBe("%PDF-");
    expect(bytes.byteLength).toBeGreaterThan(5_000);
    const document = await PDFDocument.load(bytes);
    expect(document.getPageCount()).toBe(1);
    expect(document.getTitle()).toContain("completion certificate");
    expect(document.getAuthor()).toBe("DayTradingPost Academy");
  });
});
