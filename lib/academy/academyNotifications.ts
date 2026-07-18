import type { NotificationDraft } from "@/types/notification";

export type AcademyMilestone =
  | "course-enrolled"
  | "module-completed"
  | "course-completed"
  | "assessment-passed"
  | "assessment-failed"
  | "certificate-issued"
  | "learning-path-milestone";

export function createAcademyMilestoneNotification(input: {
  courseSlug: string;
  courseTitle: string;
  milestone: AcademyMilestone;
  userId: string;
}): NotificationDraft & { idempotencyKey: string } {
  const copy: Record<AcademyMilestone, { message: string; title: string }> = {
    "course-enrolled": {
      message: `You are enrolled in ${input.courseTitle}.`,
      title: "Course enrollment confirmed",
    },
    "module-completed": {
      message: `You completed a module in ${input.courseTitle}.`,
      title: "Module completed",
    },
    "course-completed": {
      message: `You completed ${input.courseTitle}.`,
      title: "Course completed",
    },
    "assessment-passed": {
      message: `You passed an assessment in ${input.courseTitle}.`,
      title: "Assessment passed",
    },
    "assessment-failed": {
      message: `Review the course material before your next ${input.courseTitle} attempt.`,
      title: "Assessment review recommended",
    },
    "certificate-issued": {
      message: `Your educational completion certificate for ${input.courseTitle} is available.`,
      title: "Certificate issued",
    },
    "learning-path-milestone": {
      message: `You reached a learning-path milestone in ${input.courseTitle}.`,
      title: "Learning milestone",
    },
  };
  return {
    ...copy[input.milestone],
    idempotencyKey: `${input.userId}:${input.courseSlug}:${input.milestone}`,
    link: `/academy/${input.courseSlug}`,
    notificationType: `academy_${input.milestone.replaceAll("-", "_")}`,
    severity: input.milestone === "assessment-failed" ? "warning" : "success",
    userId: input.userId,
  };
}

export function createAcademyEmailTemplateData(input: {
  courseTitle: string;
  deepLink: string;
  learnerName: string;
  milestone: AcademyMilestone;
  preferencesUrl: string;
}) {
  return {
    courseTitle: input.courseTitle,
    deepLink: input.deepLink,
    learnerName: input.learnerName,
    milestone: input.milestone,
    preferencesUrl: input.preferencesUrl,
    disclaimer:
      "Educational content only. Trading involves risk and losses are possible.",
  };
}
