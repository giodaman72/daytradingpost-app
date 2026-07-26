import "server-only";

import { academyConfig } from "../academyConfig";
import { requireAcademyUser } from "../academyAuthorization";
import { AcademyError } from "../academyErrors";
import { enforceAcademyRateLimit } from "../academyRateLimit";
import { findEnrollmentByCourse } from "../academyRepository";
import { getAcademyCourse } from "../academyService";
import {
  normalizePlainText,
  parseAcademyIdentifier,
} from "../academyValidation";
import {
  deleteOwnedCourseReview,
  findOwnedCourseReview,
  getCourseReviewAggregate,
  insertCourseReview,
  listPublishedCourseReviews,
  listPublishedReviewReplies,
  reportCourseReview,
  updateOwnedCourseReview,
} from "./reviewRepository";
import { parseAcademyReview } from "./reviewValidation";

export async function getCourseReviews(courseId: string) {
  const id = parseAcademyIdentifier(courseId, "course ID");
  const [reviews, aggregate] = await Promise.all([
    listPublishedCourseReviews(id),
    getCourseReviewAggregate(id),
  ]);
  return {
    aggregate,
    replies: await listPublishedReviewReplies(
      reviews.map((review) => review.id),
    ),
    reviews,
  };
}

export async function getReviewEligibility(courseSlug: string) {
  const access = await requireAcademyUser();
  const course = await getAcademyCourse(courseSlug);
  const enrollment = await findEnrollmentByCourse(access.userId, course.id);
  const review = enrollment
    ? await findOwnedCourseReview(access.userId, course.id)
    : null;
  return {
    eligible:
      Boolean(enrollment) &&
      Number(enrollment?.progressPercent ?? 0) >=
        academyConfig.reviewMinimumProgressPercent,
    enrollment,
    minimumProgressPercent: academyConfig.reviewMinimumProgressPercent,
    review,
  };
}

export async function createCourseReview(
  courseSlug: string,
  input: Record<string, unknown>,
) {
  const access = await requireAcademyUser();
  enforceAcademyRateLimit(access.userId, "review", 8);
  const course = await getAcademyCourse(courseSlug);
  const enrollment = await findEnrollmentByCourse(access.userId, course.id);
  if (!enrollment)
    throw new AcademyError(
      "ACADEMY_NOT_ENROLLED",
      "Enroll in this course before reviewing it.",
    );
  if (enrollment.progressPercent < academyConfig.reviewMinimumProgressPercent)
    throw new AcademyError(
      "ACADEMY_REVIEW_NOT_ELIGIBLE",
      `Complete at least ${academyConfig.reviewMinimumProgressPercent}% before reviewing this course.`,
    );
  if (await findOwnedCourseReview(access.userId, course.id))
    throw new AcademyError(
      "ACADEMY_REVIEW_EXISTS",
      "You already have an active review for this course.",
    );
  const review = parseAcademyReview(input);
  return insertCourseReview({
    courseId: course.id,
    userId: access.userId,
    ...review,
  });
}

export async function editCourseReview(
  reviewId: string,
  input: Record<string, unknown>,
) {
  const access = await requireAcademyUser();
  enforceAcademyRateLimit(access.userId, "review", 8);
  return updateOwnedCourseReview({
    id: parseAcademyIdentifier(reviewId, "review ID"),
    userId: access.userId,
    ...parseAcademyReview(input),
  });
}

export async function removeCourseReview(reviewId: string) {
  const access = await requireAcademyUser();
  enforceAcademyRateLimit(access.userId, "review", 8);
  await deleteOwnedCourseReview(
    access.userId,
    parseAcademyIdentifier(reviewId, "review ID"),
  );
}

export async function reportReview(
  reviewId: string,
  input: Record<string, unknown>,
) {
  const access = await requireAcademyUser();
  enforceAcademyRateLimit(access.userId, "review-report", 5);
  await reportCourseReview({
    reason: normalizePlainText(input.reason, "Report reason", 500),
    reviewId: parseAcademyIdentifier(reviewId, "review ID"),
    userId: access.userId,
  });
}
