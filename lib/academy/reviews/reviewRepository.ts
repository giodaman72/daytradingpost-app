import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  AcademyCourseReview,
  AcademyReviewAggregate,
} from "@/types/academy";
import { AcademyError } from "../academyErrors";

export function calculateReviewAggregate(
  ratings: readonly number[],
): AcademyReviewAggregate {
  const valid = ratings.filter(
    (rating) => Number.isInteger(rating) && rating >= 1 && rating <= 5,
  );
  return {
    averageRating: valid.length
      ? Math.round(
          (valid.reduce((total, rating) => total + rating, 0) / valid.length) *
            10,
        ) / 10
      : null,
    publishedCount: valid.length,
  };
}

function mapReview(row: Record<string, unknown>): AcademyCourseReview {
  return {
    courseId: String(row.course_id),
    createdAt: String(row.created_at),
    deletedAt: row.deleted_at ? String(row.deleted_at) : null,
    id: String(row.id),
    rating: Number(row.rating),
    reviewText: row.review_text ? String(row.review_text) : null,
    status: row.moderation_status as AcademyCourseReview["status"],
    title: row.title ? String(row.title) : null,
    updatedAt: String(row.updated_at),
    userId: String(row.user_id),
  };
}

export async function listPublishedCourseReviews(courseId: string, limit = 20) {
  const { data, error } = await getSupabaseAdmin()
    .from("academy_course_reviews")
    .select("*")
    .eq("course_id", courseId)
    .eq("moderation_status", "published")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(Math.min(50, Math.max(1, limit)));
  if (error?.code === "42P01") return [];
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Course reviews are unavailable.",
    );
  return (data ?? []).map(mapReview);
}

export async function getCourseReviewAggregate(
  courseId: string,
): Promise<AcademyReviewAggregate> {
  const { data, error } = await getSupabaseAdmin()
    .from("academy_course_reviews")
    .select("rating")
    .eq("course_id", courseId)
    .eq("moderation_status", "published")
    .is("deleted_at", null);
  if (error?.code === "42P01")
    return { averageRating: null, publishedCount: 0 };
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Review summary is unavailable.",
    );
  return calculateReviewAggregate(
    (data ?? []).map((row) => Number(row.rating)),
  );
}

export async function findOwnedCourseReview(userId: string, courseId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("academy_course_reviews")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error?.code === "42P01") return null;
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Your review is unavailable.",
    );
  return data ? mapReview(data) : null;
}

export async function insertCourseReview(input: {
  courseId: string;
  rating: number;
  reviewText: string;
  title: string;
  userId: string;
}) {
  const { data, error } = await getSupabaseAdmin()
    .from("academy_course_reviews")
    .insert({
      course_id: input.courseId,
      rating: input.rating,
      review_text: input.reviewText,
      title: input.title,
      user_id: input.userId,
    })
    .select()
    .single();
  if (error?.code === "23505")
    throw new AcademyError(
      "ACADEMY_REVIEW_EXISTS",
      "You already have an active review for this course.",
    );
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Your review could not be saved.",
    );
  return mapReview(data);
}

export async function updateOwnedCourseReview(input: {
  id: string;
  rating: number;
  reviewText: string;
  title: string;
  userId: string;
}) {
  const { data, error } = await getSupabaseAdmin()
    .from("academy_course_reviews")
    .update({
      moderation_status: "pending",
      moderated_at: null,
      moderated_by: null,
      moderation_reason: null,
      rating: input.rating,
      review_text: input.reviewText,
      title: input.title,
    })
    .eq("id", input.id)
    .eq("user_id", input.userId)
    .is("deleted_at", null)
    .select()
    .maybeSingle();
  if (error || !data)
    throw new AcademyError("ACADEMY_REVIEW_NOT_FOUND", "Review was not found.");
  return mapReview(data);
}

export async function deleteOwnedCourseReview(userId: string, id: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("academy_course_reviews")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();
  if (error || !data)
    throw new AcademyError("ACADEMY_REVIEW_NOT_FOUND", "Review was not found.");
}

export async function listPendingReviews(limit = 100) {
  const { data, error } = await getSupabaseAdmin()
    .from("academy_course_reviews")
    .select("*")
    .eq("moderation_status", "pending")
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(Math.min(100, Math.max(1, limit)));
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Review moderation queue is unavailable.",
    );
  return (data ?? []).map(mapReview);
}

export async function moderateCourseReview(input: {
  actorUserId: string;
  id: string;
  reason: string;
  status: "published" | "rejected";
}) {
  const { data, error } = await getSupabaseAdmin()
    .from("academy_course_reviews")
    .update({
      moderated_at: new Date().toISOString(),
      moderated_by: input.actorUserId,
      moderation_reason: input.reason,
      moderation_status: input.status,
    })
    .eq("id", input.id)
    .is("deleted_at", null)
    .select()
    .maybeSingle();
  if (error || !data)
    throw new AcademyError("ACADEMY_REVIEW_NOT_FOUND", "Review was not found.");
  return mapReview(data);
}
