import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
  AcademyCertificate,
  AcademyCertificateVerification,
} from "@/types/academy";
import { CertificateCard } from "./CertificateCard";
import { CertificateVerification } from "./CertificateVerification";
import { CertificateWallet } from "./CertificateWallet";

const certificate: AcademyCertificate = {
  certificateNumber: "DTP-2026-A1B2C3D4E5F6",
  completionDate: "2026-07-19",
  courseId: "course-1",
  courseTitleSnapshot: "Risk Management Foundations",
  courseVersion: 1,
  enrollmentId: "enrollment-1",
  id: "certificate-1",
  instructorNameSnapshot: "Morgan Lee",
  issuedAt: "2026-07-20T12:00:00.000Z",
  learnerDisplayName: "Alex Trader",
  revocationReason: null,
  revokedAt: null,
  scoreSnapshot: 92,
  status: "issued",
  supersededByCertificateId: null,
  supersedesCertificateId: null,
  userId: "user-1",
  verificationCode: "opaque_code_12345678901234567890",
};

const verification: AcademyCertificateVerification = {
  certificateNumber: certificate.certificateNumber,
  completionDate: certificate.completionDate,
  courseTitle: certificate.courseTitleSnapshot,
  instructorName: certificate.instructorNameSnapshot,
  issuedAt: certificate.issuedAt,
  learnerDisplayName: certificate.learnerDisplayName,
  status: "issued",
  valid: true,
};

describe("certificate components", () => {
  it("renders a private wallet card with view, download and verify actions", () => {
    render(
      <CertificateCard
        certificate={certificate}
        verificationUrl="https://example.com/verify/certificate/opaque"
      />,
    );
    expect(
      screen.getByRole("heading", { name: certificate.courseTitleSnapshot }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /download pdf/i })).toHaveAttribute(
      "href",
      "/api/academy/certificates/certificate-1/download",
    );
  });

  it("renders an accessible empty wallet", () => {
    render(<CertificateWallet certificates={[]} verificationUrls={{}} />);
    expect(
      screen.getByRole("heading", { name: /certificate wallet is ready/i }),
    ).toBeInTheDocument();
  });

  it("shows only the approved public verification fields", () => {
    const { container } = render(
      <CertificateVerification verification={verification} />,
    );
    expect(screen.getByText("Certificate verified")).toBeInTheDocument();
    expect(screen.getByText("Alex Trader")).toBeInTheDocument();
    expect(container.textContent).not.toContain("alex@example.com");
    expect(container.textContent).not.toContain("user-1");
    expect(container.textContent).not.toContain("enrollment-1");
  });

  it("uses the same generic result for invalid or unknown codes", () => {
    render(<CertificateVerification verification={null} />);
    expect(screen.getByText("Certificate not verified")).toBeInTheDocument();
    expect(screen.getByText(/invalid or does not match/i)).toBeInTheDocument();
  });

  it("clearly displays a revoked verification result", () => {
    render(
      <CertificateVerification
        verification={{ ...verification, status: "revoked", valid: false }}
      />,
    );
    expect(screen.getByText("Certificate revoked")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Certificate status: Revoked"),
    ).toBeInTheDocument();
  });
});
