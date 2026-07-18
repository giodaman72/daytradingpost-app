import type {
  AcademyAccessLevel,
  AcademyContentStatus,
  AcademyEnrollmentStatus,
} from "@/types/academy";

export type AcademyAccessReason =
  | "allowed"
  | "authentication-required"
  | "premium-required"
  | "not-published"
  | "not-enrolled"
  | "enrollment-inactive"
  | "prerequisite-not-met"
  | "outside-availability-window"
  | "attempt-limit-reached";

export type AcademyAccessDecision = {
  allowed: boolean;
  reason: AcademyAccessReason;
};

export function canViewCourse(input: {
  accessLevel: AcademyAccessLevel;
  administrativePreview?: boolean;
  authenticated: boolean;
  hasPremiumAccess: boolean;
  publishedAt: string | null;
  status: AcademyContentStatus;
  now?: Date;
}): AcademyAccessDecision {
  if (input.administrativePreview) return { allowed: true, reason: "allowed" };
  const now = input.now ?? new Date();
  if (
    input.status !== "published" ||
    !input.publishedAt ||
    new Date(input.publishedAt) > now
  )
    return { allowed: false, reason: "not-published" };
  if (input.accessLevel === "premium" && !input.authenticated)
    return { allowed: false, reason: "authentication-required" };
  if (input.accessLevel === "premium" && !input.hasPremiumAccess)
    return { allowed: false, reason: "premium-required" };
  return { allowed: true, reason: "allowed" };
}

export function canEnrollInCourse(
  input: Parameters<typeof canViewCourse>[0] & {
    prerequisitesMet: boolean;
  },
): AcademyAccessDecision {
  const view = canViewCourse(input);
  if (!view.allowed) return view;
  if (!input.authenticated)
    return { allowed: false, reason: "authentication-required" };
  if (!input.prerequisitesMet)
    return { allowed: false, reason: "prerequisite-not-met" };
  return { allowed: true, reason: "allowed" };
}

export function canViewLesson(input: {
  courseAccess: AcademyAccessDecision;
  enrolled: boolean;
  enrollmentStatus: AcademyEnrollmentStatus | null;
  prerequisitesMet: boolean;
}): AcademyAccessDecision {
  if (!input.courseAccess.allowed) return input.courseAccess;
  if (!input.enrolled) return { allowed: false, reason: "not-enrolled" };
  if (
    !input.enrollmentStatus ||
    ["revoked", "expired", "archived"].includes(input.enrollmentStatus)
  )
    return { allowed: false, reason: "enrollment-inactive" };
  if (!input.prerequisitesMet)
    return { allowed: false, reason: "prerequisite-not-met" };
  return { allowed: true, reason: "allowed" };
}

export function canAttemptAssessment(input: {
  access: AcademyAccessDecision;
  attemptsUsed: number;
  availableFrom: string | null;
  availableUntil: string | null;
  maximumAttempts: number;
  now?: Date;
}): AcademyAccessDecision {
  if (!input.access.allowed) return input.access;
  const now = input.now ?? new Date();
  if (
    (input.availableFrom && now < new Date(input.availableFrom)) ||
    (input.availableUntil && now > new Date(input.availableUntil))
  )
    return { allowed: false, reason: "outside-availability-window" };
  if (input.attemptsUsed >= input.maximumAttempts)
    return { allowed: false, reason: "attempt-limit-reached" };
  return { allowed: true, reason: "allowed" };
}

export function canAccessResource(
  resourceAccess: AcademyAccessLevel,
  hasPremiumAccess: boolean,
) {
  return resourceAccess === "free" || hasPremiumAccess;
}

export const canUseAiTutorForLesson = (
  aiTutorEnabled: boolean,
  access: AcademyAccessDecision,
) => aiTutorEnabled && access.allowed;
