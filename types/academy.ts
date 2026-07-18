export type AcademyAccessLevel = "free" | "premium";
export type AcademyContentStatus =
  "draft" | "review" | "scheduled" | "published" | "archived";
export type AcademyDifficulty = "beginner" | "intermediate" | "advanced";
export type AcademyLessonType =
  | "text"
  | "video"
  | "mixed"
  | "quiz"
  | "assessment"
  | "downloadable"
  | "webinar-replay"
  | "chart-practice"
  | "external-resource";
export type AcademyCompletionMode =
  | "manual"
  | "content-viewed"
  | "video-threshold"
  | "quiz-passed"
  | "assessment-passed"
  | "external-confirmation";
export type AcademyEnrollmentStatus =
  | "enrolled"
  | "in_progress"
  | "completed"
  | "paused"
  | "revoked"
  | "expired"
  | "archived";
export type AcademyProgressStatus =
  | "locked"
  | "available"
  | "not_started"
  | "in_progress"
  | "completed"
  | "skipped"
  | "reset";
export type AcademyAttemptStatus =
  | "started"
  | "submitted"
  | "graded"
  | "passed"
  | "failed"
  | "expired"
  | "abandoned"
  | "invalidated";
export type AcademyCertificateStatus = "issued" | "revoked" | "superseded";
export type AcademyQuestionType =
  | "single-choice"
  | "multiple-choice"
  | "true-false"
  | "numeric"
  | "ordering"
  | "matching"
  | "short-answer";

export type AcademyReference = {
  id: string;
  slug?: string;
  version: number;
};

export type AcademyInstructor = {
  id: string;
  name: string;
  professionalTitle: string | null;
  slug: string;
};

export type AcademyVideo = {
  accessLevel: AcademyAccessLevel;
  captions: Array<{ label: string; language: string; url: string }>;
  chapters: Array<{ startSeconds: number; title: string }>;
  downloadable: boolean;
  durationSeconds: number;
  playbackUrl: string | null;
  posterImageUrl: string | null;
  provider: "youtube" | "vimeo" | "mux" | "cloudflare-stream" | "self-hosted";
  providerVideoId: string | null;
  transcript: unknown[] | null;
};

export type AcademyResource = {
  accessLevel: AcademyAccessLevel;
  copyrightNotice: string | null;
  description: string | null;
  downloadable: boolean;
  fileSize: number | null;
  mimeType: string | null;
  resourceType:
    | "pdf-guide"
    | "checklist"
    | "worksheet"
    | "chart-template"
    | "glossary"
    | "transcript"
    | "reference-link"
    | "dataset"
    | "practice-file";
  title: string;
  url: string;
  version: number;
};

export type AcademyLessonBase = {
  accessLevel: AcademyAccessLevel;
  aiTutorEnabled: boolean;
  completionMode: AcademyCompletionMode;
  courseId: string;
  durationMinutes: number;
  id: string;
  learningObjectives: string[];
  moduleId: string;
  order: number;
  prerequisiteLessonIds: string[];
  requiredForCompletion: boolean;
  resources: AcademyResource[];
  slug: string;
  status: AcademyContentStatus;
  summary: string;
  title: string;
  version: number;
};

export type AcademyLesson =
  | (AcademyLessonBase & {
      body: unknown[];
      lessonType: "text" | "downloadable" | "chart-practice";
      video: null;
    })
  | (AcademyLessonBase & {
      body: unknown[];
      lessonType: "video" | "mixed" | "webinar-replay";
      video: AcademyVideo;
    })
  | (AcademyLessonBase & {
      assessmentId: string;
      body: unknown[];
      lessonType: "quiz" | "assessment";
      video: null;
    })
  | (AcademyLessonBase & {
      body: unknown[];
      externalUrl: string;
      lessonType: "external-resource";
      video: null;
    });

export type AcademyModule = {
  accessLevel: AcademyAccessLevel;
  courseId: string;
  description: string | null;
  durationMinutes: number;
  id: string;
  learningObjectives: string[];
  lessonIds: string[];
  order: number;
  prerequisiteModuleIds: string[];
  requiredForCompletion: boolean;
  slug: string;
  status: AcademyContentStatus;
  title: string;
  version: number;
};

export type AcademyCourse = {
  accessLevel: AcademyAccessLevel;
  certificateEnabled: boolean;
  category: { id: string; slug: string; title: string } | null;
  description: unknown[];
  difficulty: AcademyDifficulty;
  durationMinutes: number;
  excerpt: string;
  featured: boolean;
  id: string;
  instructor: AcademyInstructor | null;
  learningObjectives: string[];
  legacySlug: string | null;
  moduleIds: string[];
  passingRequirements: AcademyPassingRequirements;
  prerequisiteCourseIds: string[];
  publishedAt: string | null;
  slug: string;
  status: AcademyContentStatus;
  tags: string[];
  targetAudience: string[];
  title: string;
  updatedAt: string;
  version: number;
};

export type AcademyPassingRequirements = {
  finalAssessmentId: string | null;
  minimumAssessmentPercent: number | null;
  requireAllRequiredLessons: boolean;
  requireAllRequiredModules: boolean;
};

export type AcademyEnrollment = {
  accessSnapshot: Record<string, unknown>;
  completedAt: string | null;
  courseId: string;
  courseSlug: string;
  courseVersion: number;
  enrolledAt: string;
  id: string;
  lastAccessedAt: string | null;
  progressPercent: number;
  startedAt: string | null;
  status: AcademyEnrollmentStatus;
  userId: string;
};

export type AcademyLessonProgress = {
  completedAt: string | null;
  completionMethod: AcademyCompletionMode | null;
  contentViewedAt: string | null;
  enrollmentId: string;
  id: string;
  lastAccessedAt: string | null;
  lessonId: string;
  lessonVersion: number;
  progressPercent: number;
  status: AcademyProgressStatus;
  userId: string;
  videoDurationSeconds: number | null;
  videoPositionSeconds: number | null;
};

export type AcademyModuleProgress = {
  completedAt: string | null;
  completedRequiredLessonsCount: number;
  enrollmentId: string;
  id: string;
  moduleId: string;
  moduleVersion: number;
  progressPercent: number;
  requiredLessonsCount: number;
  status: AcademyProgressStatus;
  userId: string;
};

export type AcademyAnswerOption = {
  id: string;
  label: string;
  matchKey?: string;
  numericTolerance?: number;
};

export type AcademyQuestion = {
  answers: AcademyAnswerOption[];
  correctAnswer: string | string[] | number | Record<string, string>;
  difficulty: AcademyDifficulty;
  explanation: string | null;
  id: string;
  partialCredit: boolean;
  points: number;
  prompt: string;
  questionType: AcademyQuestionType;
  tags: string[];
};

export type AcademyPublicQuestion = Omit<
  AcademyQuestion,
  "correctAnswer" | "explanation"
>;

export type AcademyAssessment = {
  assessmentType:
    "lesson-quiz" | "module-quiz" | "course-final" | "practice" | "diagnostic";
  availableFrom: string | null;
  availableUntil: string | null;
  courseId: string;
  id: string;
  instructions: unknown[];
  maximumAttempts: number;
  passingScore: number;
  premium: boolean;
  questions: AcademyQuestion[];
  randomizeAnswers: boolean;
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  slug: string;
  status: AcademyContentStatus;
  timeLimitMinutes: number | null;
  title: string;
  version: number;
};

export type AcademyAttempt = {
  assessmentId: string;
  assessmentVersion: number;
  attemptNumber: number;
  enrollmentId: string;
  expiresAt: string | null;
  id: string;
  maximumScore: number | null;
  passed: boolean | null;
  randomizedAnswerOrders: Record<string, string[]>;
  randomizedQuestionIds: string[];
  score: number | null;
  scorePercent: number | null;
  startedAt: string;
  status: AcademyAttemptStatus;
  submittedAt: string | null;
  userId: string;
};

export type AcademyResponse = {
  awardedPoints: number | null;
  correct: boolean | null;
  feedback: string | null;
  id: string;
  maximumPoints: number;
  questionId: string;
  response: unknown;
};

export type AcademyCertificate = {
  certificateNumber: string;
  completionDate: string;
  courseId: string;
  courseTitleSnapshot: string;
  courseVersion: number;
  id: string;
  instructorNameSnapshot: string | null;
  issuedAt: string;
  learnerDisplayName: string;
  revokedAt: string | null;
  status: AcademyCertificateStatus;
  userId: string;
  verificationCode: string;
};

export type AcademyLearningPath = {
  accessLevel: AcademyAccessLevel;
  courseIds: string[];
  difficulty: AcademyDifficulty;
  durationMinutes: number;
  id: string;
  prerequisitePathIds: string[];
  requiredCourseIds: string[];
  slug: string;
  status: AcademyContentStatus;
  title: string;
  version: number;
};

export type AcademyLearningPathEnrollment = {
  completedAt: string | null;
  enrolledAt: string;
  id: string;
  learningPathId: string;
  learningPathVersion: number;
  progressPercent: number;
  status: AcademyEnrollmentStatus;
  userId: string;
};

export type AcademyBookmark = {
  courseId: string;
  id: string;
  label: string | null;
  lessonId: string;
  moduleId: string | null;
  positionSeconds: number | null;
  userId: string;
};

export type AcademyLearnerNote = {
  courseId: string;
  id: string;
  lessonId: string;
  moduleId: string | null;
  noteText: string;
  positionSeconds: number | null;
  userId: string;
};

export type AcademyCourseReview = {
  courseId: string;
  id: string;
  rating: number;
  reviewText: string | null;
  status: "pending" | "published" | "rejected";
  title: string | null;
  userId: string;
};

export type AcademyMembershipLimits = {
  canAccessPremiumCourses: boolean;
  canEarnCertificates: boolean;
  maxAssessmentAttempts: number;
  maxBookmarks: number;
  maxNotes: number;
  tutorDailyLimit: number;
};

export type AcademyCompletionResult = {
  completed: boolean;
  completedAt: string | null;
  progressPercent: number;
  unmetRequirements: string[];
};

export type AcademyScoringResult = {
  awardedPoints: number;
  maximumPoints: number;
  passed: boolean;
  responses: Array<{
    awardedPoints: number;
    correct: boolean;
    maximumPoints: number;
    questionId: string;
  }>;
  scorePercent: number;
};

export type AcademyPrerequisiteResult = {
  met: boolean;
  unmet: Array<{
    id: string;
    kind: "course" | "module" | "lesson" | "assessment" | "learning-path";
  }>;
};

export type AcademyProgressSummary = {
  completedLessons: number;
  completedModules: number;
  courseCompleted: boolean;
  coursePercent: number;
  totalRequiredLessons: number;
  totalRequiredModules: number;
};
