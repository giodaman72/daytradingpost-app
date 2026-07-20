import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAcademyPermission } from "../admin/academyAdminAuthorization";
import { parseAcademyIdentifier } from "../academyValidation";
import { listPendingReviews, moderateCourseReview } from "./reviewRepository";
import { parseReviewModeration } from "./reviewValidation";

export async function getReviewModerationQueue() {
  await requireAcademyPermission("academy:manage-reviews");
  return listPendingReviews();
}

export async function moderateReview(
  reviewId: string,
  input: Record<string, unknown>,
) {
  const access = await requireAcademyPermission("academy:manage-reviews");
  const moderation = parseReviewModeration(input);
  const review = await moderateCourseReview({
    actorUserId: access.userId,
    id: parseAcademyIdentifier(reviewId, "review ID"),
    ...moderation,
  });
  await getSupabaseAdmin()
    .from("academy_admin_audit")
    .insert({
      action: `review_${moderation.status}`,
      actor_user_id: access.userId,
      metadata: { reason: moderation.reason },
      request_id: `review:${review.id}:${review.updatedAt}`,
      target_id: review.id,
      target_type: "course_review",
    });
  return review;
}
