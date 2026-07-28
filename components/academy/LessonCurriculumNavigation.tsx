import type {
  AcademyCourseDetail,
  AcademyLearningState,
} from "@/types/academy";
import { CourseCurriculum } from "./CourseCurriculum";

type LessonCurriculumNavigationProps = {
  course: AcademyCourseDetail;
  learningState: AcademyLearningState;
};

export function LessonCurriculumNavigation({
  course,
  learningState,
}: LessonCurriculumNavigationProps) {
  return (
    <>
      <aside
        className="academy-lesson-navigation academy-lesson-navigation-desktop"
        aria-label="Course curriculum"
      >
        <strong>{course.title}</strong>
        <CourseCurriculum course={course} learningState={learningState} />
      </aside>
      <details className="academy-mobile-curriculum">
        <summary>Open course curriculum</summary>
        <div>
          <strong>{course.title}</strong>
          <CourseCurriculum course={course} learningState={learningState} />
        </div>
      </details>
    </>
  );
}
