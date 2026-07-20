import "server-only";

import {
  findEnrollmentByCourse,
  findPublishedLessonState,
} from "./academyRepository";
import { AcademyError } from "./academyErrors";
import { parseAcademyIdentifier } from "./academyValidation";

export async function validateAcademyLearnerReference(input: {
  courseId: string;
  lessonId: string;
  moduleId?: string | null;
  userId: string;
}) {
  const courseId = parseAcademyIdentifier(input.courseId, "course ID");
  const lessonId = parseAcademyIdentifier(input.lessonId, "lesson ID");
  const moduleId = input.moduleId
    ? parseAcademyIdentifier(input.moduleId, "module ID")
    : null;
  const [lesson, enrollment] = await Promise.all([
    findPublishedLessonState(lessonId),
    findEnrollmentByCourse(input.userId, courseId),
  ]);
  if (
    !lesson ||
    lesson.courseId !== courseId ||
    (moduleId && lesson.moduleId !== moduleId) ||
    !enrollment
  )
    throw new AcademyError(
      "ACADEMY_FORBIDDEN",
      "This learner item does not belong to an accessible lesson.",
    );
  return { courseId, lessonId, moduleId };
}
