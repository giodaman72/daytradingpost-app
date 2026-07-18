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
});
