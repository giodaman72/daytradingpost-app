import type {
  AcademyAccessLevel,
  AcademyContentStatus,
  AcademyDifficulty,
  AcademyEnrollmentStatus,
} from "./academy";

export type AcademyAdminLessonSummary = {
  accessLevel: AcademyAccessLevel;
  completionMode: string;
  id: string;
  order: number;
  required: boolean;
  status: AcademyContentStatus;
  title: string;
  version: number;
};

export type AcademyAdminModuleSummary = {
  accessLevel: AcademyAccessLevel;
  id: string;
  lessons: AcademyAdminLessonSummary[];
  order: number;
  prerequisiteIds: string[];
  required: boolean;
  status: AcademyContentStatus;
  title: string;
  version: number;
};

export type AcademyAdminCourse = {
  accessLevel: AcademyAccessLevel;
  archived: boolean;
  difficulty: AcademyDifficulty;
  id: string;
  instructor: { id: string; name: string } | null;
  modules: AcademyAdminModuleSummary[];
  publishedAt: string | null;
  slug: string;
  status: AcademyContentStatus;
  studioDocumentId: string;
  title: string;
  updatedAt: string;
  validationIssues: Array<{
    code: string;
    message: string;
    path: string;
    severity: "error" | "warning";
  }>;
  version: number;
};

export type AcademyAdminAssessment = {
  availableFrom: string | null;
  availableUntil: string | null;
  courseId: string;
  id: string;
  maximumAttempts: number;
  passingScore: number;
  premium: boolean;
  questionCount: number;
  status: AcademyContentStatus;
  studioDocumentId: string;
  title: string;
  validationIssues: string[];
  version: number;
};

export type AcademyAdminEnrollment = {
  courseId: string;
  courseSlug: string;
  courseVersion: number;
  enrolledAt: string;
  id: string;
  learnerDisplayName: string;
  lastAccessedAt: string | null;
  progressPercent: number;
  status: AcademyEnrollmentStatus;
  userId: string;
};

export type AcademyMetric = {
  key: string;
  label: string;
  suppressed: boolean;
  value: number | null;
};

export type AcademyAnalyticsDashboard = {
  cohortSize: number;
  filters: {
    courseId: string | null;
    dateFrom: string;
    dateTo: string;
    instructorId: string | null;
  };
  metrics: AcademyMetric[];
  privacyThreshold: number;
};

export type AcademyInstructorAssignment = {
  courseId: string;
  instructorId: string;
  userId: string;
};

export type AcademyInstructorReply = {
  createdAt: string;
  id: string;
  instructorUserId: string;
  moderationReason: string | null;
  replyText: string;
  reviewId: string;
  status: "pending" | "published" | "rejected";
  updatedAt: string;
};
