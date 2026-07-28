import "server-only";

import { createNotification } from "@/lib/notifications";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AcademyCertificate } from "@/types/academy";
import { requireAcademyPermission } from "../admin/academyAdminAuthorization";
import { requireAcademyUser } from "../academyAuthorization";
import { enforceAcademyRateLimit } from "../academyRateLimit";
import { AcademyError } from "../academyErrors";
import { findPublishedCourseBySlug } from "../academyRepository";
import {
  normalizePlainText,
  parseAcademyIdentifier,
  parseVerificationCode,
} from "../academyValidation";
import { academyConfig } from "../academyConfig";
import { evaluateCertificateEligibility } from "./certificateEligibility";
import {
  canReissueCertificate,
  canRevokeCertificate,
} from "./certificateLifecycle";
import {
  findActiveCertificateRecord,
  findCertificateRecord,
  findExistingCertificateRecord,
  findOwnedCertificateRecord,
  listCertificateRecords,
  verifyCertificateRecord,
} from "./certificateRepository";
import {
  createCertificateNumber,
  createCertificateVerificationCode,
} from "./certificateNumber";
import { buildCertificateVerificationUrl } from "./certificateShare";

export async function verifyCertificate(code: string, request?: Request) {
  if (request) {
    const { checkPublicApiRateLimit } = await import("@/lib/rateLimit");
    const retryAfter = checkPublicApiRateLimit(request);
    if (retryAfter)
      throw new AcademyError(
        "ACADEMY_RATE_LIMITED",
        "Too many verification requests. Please try again later.",
        { retryAfter },
      );
  }
  return verifyCertificateRecord(parseVerificationCode(code));
}

export async function getUserCertificates(limit = 20, offset = 0) {
  const access = await requireAcademyUser();
  return listCertificateRecords(
    access.userId,
    Math.min(50, Math.max(1, limit)),
    Math.max(0, offset),
  );
}

export async function getOwnedCertificate(certificateIdInput: string) {
  const access = await requireAcademyUser();
  const certificateId = parseAcademyIdentifier(
    certificateIdInput,
    "certificate ID",
  );
  const certificate = await findOwnedCertificateRecord(
    access.userId,
    certificateId,
  );
  if (!certificate)
    throw new AcademyError("ACADEMY_FORBIDDEN", "Certificate was not found.");
  return certificate;
}

export function getCertificateVerificationUrl(
  certificate: Pick<AcademyCertificate, "verificationCode">,
  requestBaseUrl?: string,
) {
  const configuredBaseUrl =
    academyConfig.certificateVerificationBaseUrl ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const baseUrl =
    configuredBaseUrl ||
    (process.env.NODE_ENV !== "production" ? requestBaseUrl : undefined);
  if (!baseUrl)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Certificate verification URL is not configured.",
    );
  return buildCertificateVerificationUrl(baseUrl, certificate.verificationCode);
}

async function loadEligibilityState(userId: string, enrollmentId: string) {
  const admin = getSupabaseAdmin();
  const { data: enrollment, error: enrollmentError } = await admin
    .from("academy_enrollments")
    .select(
      "id,user_id,course_id,course_slug,course_version,status,completed_at,certificate_hold_at",
    )
    .eq("id", enrollmentId)
    .eq("user_id", userId)
    .maybeSingle();
  if (enrollmentError)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Certificate eligibility could not be checked.",
    );
  if (!enrollment)
    throw new AcademyError(
      "ACADEMY_CERTIFICATE_NOT_ELIGIBLE",
      "A valid course enrollment is required.",
    );
  const course = await findPublishedCourseBySlug(
    String(enrollment.course_slug),
  );
  if (!course || course.id !== enrollment.course_id)
    throw new AcademyError(
      "ACADEMY_CERTIFICATE_NOT_ELIGIBLE",
      "The completed course is no longer available for certificate issuance.",
    );

  let finalAssessmentPassed: boolean | null = null;
  let scoreSnapshot: number | null = null;
  if (course.passingRequirements.finalAssessmentId) {
    const { data: attempt, error: attemptError } = await admin
      .from("academy_assessment_attempts")
      .select("passed,score_percent")
      .eq("user_id", userId)
      .eq("assessment_id", course.passingRequirements.finalAssessmentId)
      .eq("passed", true)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (attemptError)
      throw new AcademyError(
        "ACADEMY_PROVIDER_UNAVAILABLE",
        "Assessment eligibility could not be checked.",
      );
    finalAssessmentPassed = attempt?.passed === true;
    scoreSnapshot =
      attempt?.score_percent === null || attempt?.score_percent === undefined
        ? null
        : Number(attempt.score_percent);
  }
  const existing = await findExistingCertificateRecord(
    userId,
    course.id,
    course.version,
  );
  return {
    course,
    enrollment,
    existing,
    finalAssessmentPassed,
    scoreSnapshot,
  };
}

export async function issueCertificate(input: {
  enrollmentId: string;
  idempotencyKey: string;
}) {
  const access = await requireAcademyUser();
  enforceAcademyRateLimit(access.userId, "certificate", 6);
  const enrollmentId = parseAcademyIdentifier(
    input.enrollmentId,
    "enrollment ID",
  );
  const idempotencyKey = normalizePlainText(
    input.idempotencyKey,
    "Idempotency key",
    160,
  );
  const state = await loadEligibilityState(access.userId, enrollmentId);
  const learnerDisplayName = access.profile?.full_name?.trim() || null;
  const eligibility = evaluateCertificateEligibility({
    administrativeHold: Boolean(state.enrollment.certificate_hold_at),
    certificateEnabled: state.course.certificateEnabled,
    courseCompleted:
      state.enrollment.status === "completed" &&
      Boolean(state.enrollment.completed_at),
    enrollmentValid:
      state.enrollment.user_id === access.userId &&
      Number(state.enrollment.course_version) === state.course.version,
    finalAssessmentPassed: state.finalAssessmentPassed,
    finalAssessmentRequired: Boolean(
      state.course.passingRequirements.finalAssessmentId,
    ),
    hasExistingCertificate: Boolean(state.existing),
    learnerDisplayName,
  });
  if (!eligibility.eligible) {
    if (state.existing?.status === "issued" && eligibility.reasons.length === 1)
      return finalizeCertificateIssuance(state.existing);
    throw new AcademyError(
      "ACADEMY_CERTIFICATE_NOT_ELIGIBLE",
      "Certificate requirements are not currently met.",
      { reason: eligibility.reasons.join(",") },
    );
  }

  const certificateNumber = createCertificateNumber();
  const verificationCode = createCertificateVerificationCode();
  const { data, error } = await getSupabaseAdmin().rpc(
    "issue_academy_certificate",
    {
      p_certificate_number: certificateNumber,
      p_completion_date: String(state.enrollment.completed_at).slice(0, 10),
      p_course_id: state.course.id,
      p_course_title: state.course.title,
      p_course_version: state.course.version,
      p_enrollment_id: enrollmentId,
      p_idempotency_key: idempotencyKey,
      p_instructor_name: state.course.instructor?.name ?? null,
      p_learner_display_name: learnerDisplayName,
      p_metadata: {
        certificateTemplateVersion: 1,
        courseSlug: state.course.slug,
        educationalCompletionOnly: true,
      },
      p_score_snapshot: state.scoreSnapshot,
      p_user_id: access.userId,
      p_verification_code: verificationCode,
    },
  );
  if (error) {
    const existing = await findActiveCertificateRecord(
      access.userId,
      state.course.id,
      state.course.version,
    );
    if (existing) return finalizeCertificateIssuance(existing);
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Certificate could not be issued.",
    );
  }
  const certificate = await findOwnedCertificateRecord(
    access.userId,
    String(data),
  );
  if (!certificate)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Certificate issuance could not be confirmed.",
    );
  return finalizeCertificateIssuance(certificate);
}

async function finalizeCertificateIssuance(certificate: AcademyCertificate) {
  await Promise.all([
    createNotification({
      idempotencyKey: `academy-certificate-issued:${certificate.id}`,
      link: `/academy/certificates/${certificate.id}`,
      message: `Your educational completion certificate for ${certificate.courseTitleSnapshot} is available.`,
      metadata: { certificateId: certificate.id },
      notificationType: "academy_certificate_issued",
      severity: "success",
      title: "Certificate issued",
      userId: certificate.userId,
    }),
    recordCertificateIssuanceEvent(certificate),
  ]);
  return certificate;
}

async function recordCertificateIssuanceEvent(certificate: AcademyCertificate) {
  const { error } = await getSupabaseAdmin()
    .from("academy_events")
    .insert({
      course_id: certificate.courseId,
      event_name: "academy_certificate_issued",
      idempotency_key: `certificate:${certificate.id}:issued`,
      metadata: {},
      user_id: certificate.userId,
    });
  if (error?.code === "23505") return;
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Certificate analytics could not be recorded.",
    );
}

export async function getCertificateWallet(limit = 12, offset = 0) {
  const access = await requireAcademyUser();
  const [{ certificates, total }, enrollmentResult, certificateHistory] =
    await Promise.all([
      listCertificateRecords(access.userId, limit, offset),
      getSupabaseAdmin()
        .from("academy_enrollments")
        .select("id,course_id,course_slug,course_version,completed_at")
        .eq("user_id", access.userId)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(20),
      getSupabaseAdmin()
        .from("academy_certificates")
        .select("course_id,course_version")
        .eq("user_id", access.userId),
    ]);
  if (enrollmentResult.error || certificateHistory.error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Certificate opportunities are unavailable.",
    );
  const certificateCourseKeys = new Set(
    (certificateHistory.data ?? []).map(
      (certificate) => `${certificate.course_id}:${certificate.course_version}`,
    ),
  );
  const courses = await Promise.all(
    (enrollmentResult.data ?? []).map(async (enrollment) => {
      const course = await findPublishedCourseBySlug(enrollment.course_slug);
      if (
        !course?.certificateEnabled ||
        certificateCourseKeys.has(`${course.id}:${course.version}`)
      )
        return null;
      return {
        courseTitle: course.title,
        enrollmentId: String(enrollment.id),
      };
    }),
  );
  return {
    certificates,
    opportunities: courses.filter(
      (course): course is NonNullable<typeof course> => Boolean(course),
    ),
    total,
  };
}

export async function revokeCertificate(input: {
  certificateId: string;
  confirmation: string;
  reason: string;
  requestId: string;
}) {
  const actor = await requireAcademyPermission("academy:manage-certificates");
  enforceAcademyRateLimit(actor.userId, "admin-certificate", 10);
  const certificateId = parseAcademyIdentifier(
    input.certificateId,
    "certificate ID",
  );
  const reason = normalizePlainText(input.reason, "Revocation reason", 500);
  const requestId = normalizePlainText(input.requestId, "Request ID", 160);
  const certificate = await findCertificateRecord(certificateId);
  if (!certificate)
    throw new AcademyError("ACADEMY_FORBIDDEN", "Certificate was not found.");
  const decision = canRevokeCertificate({
    actorCanManageCertificates: true,
    confirmation: input.confirmation,
    reason,
    status: certificate.status,
  });
  if (!decision.allowed) {
    if (certificate.status === "revoked" && input.confirmation === "REVOKE")
      return certificate;
    throw new AcademyError(
      "ACADEMY_VALIDATION_FAILED",
      "Revocation requires an active certificate, a reason, and explicit confirmation.",
    );
  }
  const { data, error } = await getSupabaseAdmin().rpc(
    "revoke_academy_certificate",
    {
      p_actor_user_id: actor.userId,
      p_certificate_id: certificateId,
      p_reason: reason,
      p_request_id: requestId,
    },
  );
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Certificate could not be revoked.",
    );
  const revoked = await findCertificateRecord(String(data));
  if (!revoked)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Certificate revocation could not be confirmed.",
    );
  await createNotification({
    idempotencyKey: `academy-certificate-revoked:${revoked.id}`,
    link: `/academy/certificates/${revoked.id}`,
    message: `Your certificate for ${revoked.courseTitleSnapshot} was revoked. Contact support if you need help.`,
    metadata: { certificateId: revoked.id },
    notificationType: "academy_certificate_revoked",
    severity: "warning",
    title: "Certificate status updated",
    userId: revoked.userId,
  });
  return revoked;
}

export async function reissueCertificate(input: {
  certificateId: string;
  confirmation: string;
  reason: string;
  requestId: string;
}) {
  const actor = await requireAcademyPermission("academy:manage-certificates");
  enforceAcademyRateLimit(actor.userId, "admin-certificate", 10);
  const certificateId = parseAcademyIdentifier(
    input.certificateId,
    "certificate ID",
  );
  const reason = normalizePlainText(input.reason, "Reissue reason", 500);
  const requestId = normalizePlainText(input.requestId, "Request ID", 160);
  const certificate = await findCertificateRecord(certificateId);
  if (!certificate)
    throw new AcademyError("ACADEMY_FORBIDDEN", "Certificate was not found.");
  const decision = canReissueCertificate({
    actorCanManageCertificates: true,
    confirmation: input.confirmation,
    reason,
    status: certificate.status,
  });
  if (!decision.allowed) {
    if (
      certificate.status === "superseded" &&
      certificate.supersededByCertificateId &&
      input.confirmation === "REISSUE"
    ) {
      const existing = await findCertificateRecord(
        certificate.supersededByCertificateId,
      );
      if (existing) return finalizeCertificateIssuance(existing);
    }
    throw new AcademyError(
      "ACADEMY_VALIDATION_FAILED",
      "Reissue requires a revoked certificate, a reason, and explicit confirmation.",
    );
  }
  const { data, error } = await getSupabaseAdmin().rpc(
    "reissue_academy_certificate",
    {
      p_actor_user_id: actor.userId,
      p_certificate_id: certificateId,
      p_certificate_number: createCertificateNumber(),
      p_reason: reason,
      p_request_id: requestId,
      p_verification_code: createCertificateVerificationCode(),
    },
  );
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Certificate could not be reissued.",
    );
  const replacement = await findCertificateRecord(String(data));
  if (!replacement)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Certificate reissue could not be confirmed.",
    );
  return finalizeCertificateIssuance(replacement);
}
