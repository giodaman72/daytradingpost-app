import "server-only";

import { getCurrentUser } from "@/lib/supabase/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AcademyInstructorAssignment } from "@/types/academy-admin";
import { AcademyError } from "../academyErrors";

function mapAssignment(
  row: Record<string, unknown>,
): AcademyInstructorAssignment {
  return {
    courseId: String(row.course_id),
    instructorId: String(row.instructor_id),
    userId: String(row.user_id),
  };
}

export async function requireAcademyInstructor() {
  const user = await getCurrentUser();
  if (!user)
    throw new AcademyError(
      "ACADEMY_UNAUTHENTICATED",
      "Sign in to access the instructor dashboard.",
    );
  const { data, error } = await getSupabaseAdmin()
    .from("academy_instructor_assignments")
    .select("user_id,instructor_id,course_id")
    .eq("user_id", user.id)
    .eq("active", true);
  if (error?.code === "42P01")
    throw new AcademyError(
      "ACADEMY_FORBIDDEN",
      "No Academy instructor assignment is configured.",
    );
  if (error || !data?.length)
    throw new AcademyError(
      "ACADEMY_FORBIDDEN",
      "An active Academy instructor assignment is required.",
    );
  return {
    assignments: data.map(mapAssignment),
    userId: user.id,
  };
}

export function instructorOwnsCourse(
  assignments: AcademyInstructorAssignment[],
  courseId: string,
) {
  return assignments.some((assignment) => assignment.courseId === courseId);
}
