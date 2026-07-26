import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AcademyInstructorReply } from "@/types/academy-admin";
import { requireAcademyPermission } from "./academyAdminAuthorization";
import {
  instructorOwnsCourse,
  requireAcademyInstructor,
} from "./academyInstructorAuthorization";
import { AcademyError } from "../academyErrors";
import { enforceAcademyRateLimit } from "../academyRateLimit";
import {
  normalizePlainText,
  parseAcademyIdentifier,
} from "../academyValidation";

function mapReply(row: Record<string, unknown>): AcademyInstructorReply {
  return {
    createdAt: String(row.created_at),
    id: String(row.id),
    instructorUserId: String(row.instructor_user_id),
    moderationReason: row.moderation_reason
      ? String(row.moderation_reason)
      : null,
    replyText: String(row.reply_text),
    reviewId: String(row.review_id),
    status: row.moderation_status as AcademyInstructorReply["status"],
    updatedAt: String(row.updated_at),
  };
}

export async function saveInstructorReviewReply(
  reviewIdInput: string,
  input: Record<string, unknown>,
) {
  const access = await requireAcademyInstructor();
  enforceAcademyRateLimit(access.userId, "instructor-reply", 10);
  const reviewId = parseAcademyIdentifier(reviewIdInput, "review ID");
  const { data: review, error: reviewError } = await getSupabaseAdmin()
    .from("academy_course_reviews")
    .select("id,course_id")
    .eq("id", reviewId)
    .eq("moderation_status", "published")
    .is("deleted_at", null)
    .maybeSingle();
  if (reviewError || !review)
    throw new AcademyError(
      "ACADEMY_REVIEW_NOT_FOUND",
      "Published review was not found.",
    );
  if (!instructorOwnsCourse(access.assignments, String(review.course_id)))
    throw new AcademyError(
      "ACADEMY_FORBIDDEN",
      "This review is not for an assigned course.",
    );
  const { data, error } = await getSupabaseAdmin()
    .from("academy_review_replies")
    .upsert(
      {
        instructor_user_id: access.userId,
        moderation_reason: null,
        moderation_status: "pending",
        moderated_at: null,
        moderated_by: null,
        reply_text: normalizePlainText(input.replyText, "Reply", 1_000),
        review_id: reviewId,
      },
      { onConflict: "review_id,instructor_user_id" },
    )
    .select()
    .single();
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Instructor reply could not be saved.",
    );
  return mapReply(data);
}

export async function listInstructorReplies(userId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("academy_review_replies")
    .select("*")
    .eq("instructor_user_id", userId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });
  if (error?.code === "42P01") return [];
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Instructor replies are unavailable.",
    );
  return (data ?? []).map(mapReply);
}

export async function listPendingInstructorReplies() {
  await requireAcademyPermission("academy:moderate-reviews");
  const { data, error } = await getSupabaseAdmin()
    .from("academy_review_replies")
    .select("*")
    .eq("moderation_status", "pending")
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(100);
  if (error?.code === "42P01") return [];
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Instructor reply moderation is unavailable.",
    );
  return (data ?? []).map(mapReply);
}

export async function moderateInstructorReply(
  replyIdInput: string,
  input: Record<string, unknown>,
) {
  const actor = await requireAcademyPermission("academy:moderate-reviews");
  enforceAcademyRateLimit(actor.userId, "admin-instructor-reply", 20);
  const status = String(input.status);
  if (!["published", "rejected"].includes(status))
    throw new AcademyError(
      "ACADEMY_VALIDATION_FAILED",
      "Invalid reply moderation status.",
    );
  const reason = normalizePlainText(input.reason, "Moderation reason", 500);
  const replyId = parseAcademyIdentifier(replyIdInput, "reply ID");
  const { error } = await getSupabaseAdmin().rpc(
    "admin_moderate_academy_reply",
    {
      p_actor_user_id: actor.userId,
      p_reason: reason,
      p_reply_id: replyId,
      p_request_id: normalizePlainText(input.requestId, "Request ID", 160),
      p_status: status,
    },
  );
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Instructor reply moderation could not be completed.",
    );
  const { data, error: findError } = await getSupabaseAdmin()
    .from("academy_review_replies")
    .select("*")
    .eq("id", replyId)
    .maybeSingle();
  if (findError || !data)
    throw new AcademyError(
      "ACADEMY_REVIEW_NOT_FOUND",
      "Instructor reply was not found.",
    );
  return mapReply(data);
}
