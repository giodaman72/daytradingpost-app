import { describe, expect, it } from "vitest";
import {
  canReissueCertificate,
  canRevokeCertificate,
  publicCertificateStatus,
} from "./certificateLifecycle";

describe("certificate lifecycle policy", () => {
  it("requires admin permission, a reason, confirmation and active status", () => {
    expect(
      canRevokeCertificate({
        actorCanManageCertificates: false,
        confirmation: "",
        reason: "short",
        status: "superseded",
      }).reasons,
    ).toEqual([
      "permission-required",
      "confirmation-required",
      "reason-required",
      "certificate-not-active",
    ]);
  });

  it("allows an explicitly confirmed administrator revocation", () => {
    expect(
      canRevokeCertificate({
        actorCanManageCertificates: true,
        confirmation: "REVOKE",
        reason: "The completion record was administratively invalidated.",
        status: "issued",
      }).allowed,
    ).toBe(true);
  });

  it("requires permission, confirmation, a reason and revoked status to reissue", () => {
    expect(
      canReissueCertificate({
        actorCanManageCertificates: false,
        confirmation: "",
        reason: "short",
        status: "issued",
      }),
    ).toEqual({
      allowed: false,
      reasons: [
        "permission-required",
        "confirmation-required",
        "reason-required",
        "certificate-not-revoked",
      ],
    });
  });

  it("allows an administrator to replace a revoked certificate", () => {
    expect(
      canReissueCertificate({
        actorCanManageCertificates: true,
        confirmation: "REISSUE",
        reason: "The revoked credential has been reviewed and approved.",
        status: "revoked",
      }).allowed,
    ).toBe(true);
  });

  it("preserves revoked and superseded public statuses", () => {
    expect(publicCertificateStatus("issued")).toBe("valid");
    expect(publicCertificateStatus("revoked")).toBe("revoked");
    expect(publicCertificateStatus("superseded")).toBe("superseded");
  });
});
