export function evaluateCertificateEligibility(input: {
  administrativeHold: boolean;
  certificateEnabled: boolean;
  courseCompleted: boolean;
  enrollmentValid: boolean;
  finalAssessmentPassed: boolean | null;
  finalAssessmentRequired: boolean;
  hasExistingCertificate: boolean;
  learnerDisplayName: string | null;
}) {
  const reasons: string[] = [];
  if (!input.courseCompleted) reasons.push("course-not-completed");
  if (!input.certificateEnabled) reasons.push("certificate-disabled");
  if (!input.enrollmentValid) reasons.push("enrollment-invalid");
  if (input.finalAssessmentRequired && input.finalAssessmentPassed !== true)
    reasons.push("assessment-not-passed");
  if (input.hasExistingCertificate) reasons.push("already-issued");
  if (!input.learnerDisplayName?.trim()) reasons.push("display-name-required");
  if (input.administrativeHold) reasons.push("administrative-hold");
  return { eligible: reasons.length === 0, reasons };
}
