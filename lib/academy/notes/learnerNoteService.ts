import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AcademyLearnerNote } from "@/types/academy";
import { requireAcademyUser } from "../academyAuthorization";
import { academyConfig } from "../academyConfig";
import { AcademyError } from "../academyErrors";
import { validateAcademyLearnerReference } from "../academyLearnerOwnership";
import {
  normalizePlainText,
  parseAcademyIdentifier,
} from "../academyValidation";

const mapNote = (row: Record<string, unknown>): AcademyLearnerNote => ({
  courseId: String(row.course_id),
  createdAt: row.created_at ? String(row.created_at) : undefined,
  id: String(row.id),
  lessonId: String(row.lesson_id),
  moduleId: row.module_id as string | null,
  noteText: String(row.note_text),
  positionSeconds:
    row.position_seconds === null ? null : Number(row.position_seconds),
  updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  userId: String(row.user_id),
});

export async function listCourseNotes(
  courseId: string,
  limit = 50,
  offset = 0,
) {
  const access = await requireAcademyUser();
  const { data, error } = await getSupabaseAdmin()
    .from("academy_learner_notes")
    .select("*")
    .eq("user_id", access.userId)
    .eq("course_id", parseAcademyIdentifier(courseId, "course ID"))
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Private notes are unavailable.",
    );
  return (data ?? []).map(mapNote);
}

export async function createLearnerNote(input: {
  courseId: string;
  lessonId: string;
  moduleId?: string | null;
  noteText: string;
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
    .from("academy_learner_notes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", access.userId);
  if ((count ?? 0) >= access.limits.maxNotes)
    throw new AcademyError(
      "ACADEMY_VALIDATION_FAILED",
      "Your private note limit has been reached.",
    );
  const { data, error } = await getSupabaseAdmin()
    .from("academy_learner_notes")
    .insert({
      course_id: reference.courseId,
      lesson_id: reference.lessonId,
      module_id: reference.moduleId,
      note_text: normalizePlainText(
        input.noteText,
        "Note",
        academyConfig.maxNoteLength,
      ),
      position_seconds:
        input.positionSeconds === null || input.positionSeconds === undefined
          ? null
          : Math.max(0, Math.floor(input.positionSeconds)),
      user_id: access.userId,
    })
    .select()
    .single();
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Could not save private note.",
    );
  return mapNote(data);
}

export async function updateLearnerNote(id: string, noteText: string) {
  const access = await requireAcademyUser();
  const { data, error } = await getSupabaseAdmin()
    .from("academy_learner_notes")
    .update({
      note_text: normalizePlainText(
        noteText,
        "Note",
        academyConfig.maxNoteLength,
      ),
    })
    .eq("id", parseAcademyIdentifier(id, "note ID"))
    .eq("user_id", access.userId)
    .select()
    .maybeSingle();
  if (error || !data)
    throw new AcademyError("ACADEMY_FORBIDDEN", "Private note was not found.");
  return mapNote(data);
}

export async function deleteLearnerNote(id: string) {
  const access = await requireAcademyUser();
  const { error } = await getSupabaseAdmin()
    .from("academy_learner_notes")
    .delete()
    .eq("id", parseAcademyIdentifier(id, "note ID"))
    .eq("user_id", access.userId);
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Could not delete private note.",
    );
}
