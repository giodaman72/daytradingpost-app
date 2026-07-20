import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AcademyBookmark } from "@/types/academy";
import { requireAcademyUser } from "../academyAuthorization";
import { academyConfig } from "../academyConfig";
import { AcademyError } from "../academyErrors";
import { validateAcademyLearnerReference } from "../academyLearnerOwnership";
import {
  normalizePlainText,
  parseAcademyIdentifier,
} from "../academyValidation";

const mapBookmark = (row: Record<string, unknown>): AcademyBookmark => ({
  courseId: String(row.course_id),
  createdAt: row.created_at ? String(row.created_at) : undefined,
  id: String(row.id),
  label: row.label as string | null,
  lessonId: String(row.lesson_id),
  moduleId: row.module_id as string | null,
  positionSeconds:
    row.position_seconds === null ? null : Number(row.position_seconds),
  userId: String(row.user_id),
});

export async function listCourseBookmarks(
  courseId: string,
  limit = 50,
  offset = 0,
) {
  const access = await requireAcademyUser();
  const { data, error } = await getSupabaseAdmin()
    .from("academy_bookmarks")
    .select("*")
    .eq("user_id", access.userId)
    .eq("course_id", parseAcademyIdentifier(courseId, "course ID"))
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Bookmarks are unavailable.",
    );
  return (data ?? []).map(mapBookmark);
}

export async function createBookmark(input: {
  courseId: string;
  label?: string | null;
  lessonId: string;
  moduleId?: string | null;
  positionSeconds?: number | null;
}) {
  const access = await requireAcademyUser();
  const reference = await validateAcademyLearnerReference({
    courseId: input.courseId,
    lessonId: input.lessonId,
    moduleId: input.moduleId,
    userId: access.userId,
  });
  const { count } = await getSupabaseAdmin()
    .from("academy_bookmarks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", access.userId);
  if ((count ?? 0) >= access.limits.maxBookmarks)
    throw new AcademyError(
      "ACADEMY_VALIDATION_FAILED",
      "Your bookmark limit has been reached.",
    );
  const position =
    input.positionSeconds === null || input.positionSeconds === undefined
      ? null
      : Math.max(0, Math.floor(input.positionSeconds));
  const { data, error } = await getSupabaseAdmin()
    .from("academy_bookmarks")
    .insert({
      bookmark_type: position === null ? "lesson" : "video-timestamp",
      course_id: reference.courseId,
      label: input.label
        ? normalizePlainText(
            input.label,
            "Bookmark label",
            academyConfig.maxBookmarkLabelLength,
          )
        : null,
      lesson_id: reference.lessonId,
      module_id: reference.moduleId,
      position_seconds: position,
      user_id: access.userId,
    })
    .select()
    .single();
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Could not create bookmark.",
    );
  return mapBookmark(data);
}

export async function updateBookmark(id: string, label: string | null) {
  const access = await requireAcademyUser();
  const { data, error } = await getSupabaseAdmin()
    .from("academy_bookmarks")
    .update({
      label: label
        ? normalizePlainText(
            label,
            "Bookmark label",
            academyConfig.maxBookmarkLabelLength,
          )
        : null,
    })
    .eq("id", parseAcademyIdentifier(id, "bookmark ID"))
    .eq("user_id", access.userId)
    .select()
    .maybeSingle();
  if (error || !data)
    throw new AcademyError("ACADEMY_FORBIDDEN", "Bookmark was not found.");
  return mapBookmark(data);
}

export async function deleteBookmark(id: string) {
  const access = await requireAcademyUser();
  const { error } = await getSupabaseAdmin()
    .from("academy_bookmarks")
    .delete()
    .eq("id", parseAcademyIdentifier(id, "bookmark ID"))
    .eq("user_id", access.userId);
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Could not delete bookmark.",
    );
}
