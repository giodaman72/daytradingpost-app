import { academyLessonText } from "@/lib/academy/academyLessonText";
import type { Locale } from "@/lib/i18n/config";
import type {
  AcademyCourseDetail,
  AcademyLearningState,
} from "@/types/academy";
import { CourseCurriculum } from "./CourseCurriculum";

type LessonCurriculumNavigationProps = {
  course: AcademyCourseDetail;
  learningState: AcademyLearningState;
  locale?: Locale;
};

export function LessonCurriculumNavigation({
  course,
  learningState,
  locale = "en",
}: LessonCurriculumNavigationProps) {
  const tr = academyLessonText(locale);
  return (
    <>
      <aside
        className="academy-lesson-navigation academy-lesson-navigation-desktop"
        aria-label={tr("Course curriculum")}
      >
        <strong>{course.title}</strong>
        <CourseCurriculum
          course={course}
          learningState={learningState}
          locale={locale}
        />
      </aside>
      <details className="academy-mobile-curriculum">
        <summary>{tr("Open course curriculum")}</summary>
        <div>
          <strong>{course.title}</strong>
          <CourseCurriculum
            course={course}
            learningState={learningState}
            locale={locale}
          />
        </div>
      </details>
    </>
  );
}
