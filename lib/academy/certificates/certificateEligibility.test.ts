import { describe, expect, it } from "vitest";
import { evaluateCertificateEligibility } from "./certificateEligibility";

const eligible = {
  administrativeHold: false,
  certificateEnabled: true,
  courseCompleted: true,
  enrollmentValid: true,
  finalAssessmentPassed: true,
  finalAssessmentRequired: true,
  hasExistingCertificate: false,
  learnerDisplayName: "Alex Trader",
};

describe("Academy certificate eligibility", () => {
  it("accepts a fully eligible learner", () => {
    expect(evaluateCertificateEligibility(eligible)).toEqual({
      eligible: true,
      reasons: [],
    });
  });

  it("prevents duplicate certificates", () => {
    expect(
      evaluateCertificateEligibility({
        ...eligible,
        hasExistingCertificate: true,
      }).reasons,
    ).toContain("already-issued");
  });

  it("requires display name and completion", () => {
    expect(
      evaluateCertificateEligibility({
        ...eligible,
        courseCompleted: false,
        learnerDisplayName: " ",
      }).reasons,
    ).toEqual(["course-not-completed", "display-name-required"]);
  });

  it.each([
    ["certificateEnabled", false, "certificate-disabled"],
    ["enrollmentValid", false, "enrollment-invalid"],
    ["finalAssessmentPassed", false, "assessment-not-passed"],
    ["administrativeHold", true, "administrative-hold"],
  ] as const)(
    "rejects %s when the requirement is not met",
    (key, value, reason) => {
      expect(
        evaluateCertificateEligibility({ ...eligible, [key]: value }).reasons,
      ).toContain(reason);
    },
  );

  it("does not require an assessment when the course has none", () => {
    expect(
      evaluateCertificateEligibility({
        ...eligible,
        finalAssessmentPassed: null,
        finalAssessmentRequired: false,
      }),
    ).toEqual({ eligible: true, reasons: [] });
  });
});
