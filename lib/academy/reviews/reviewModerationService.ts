import "server-only";

import { requireAcademyPermission } from "../admin/academyAdminAuthorization";
import {
  normalizePlainText,
  parseAcademyIdentifier,
} from "../academyValidation";
import {
  listModerationReviews,
  moderateCourseReview,
} from "./reviewRepository";
import { parseReviewModeration } from "./reviewValidation";

export async function getReviewModerationQueue(
  status: "pending" | "published" | "rejected" | "reported" = "pending",
) {
  await requireAcademyPermission("academy:moderate-reviews");
  return listModerationReviews(status);
}

export async function moderateReview(
  reviewId: string,
  input: Record<string, unknown>,
) {
  const access = await requireAcademyPermission("academy:moderate-reviews");
  const moderation = parseReviewModeration(input);
  const review = await moderateCourseReview({
    actorUserId: access.userId,
    id: parseAcademyIdentifier(reviewId, "review ID"),
    requestId: normalizePlainText(input.requestId, "Request ID", 160),
    ...moderation,
  });
  return review;
}
