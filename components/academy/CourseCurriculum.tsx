import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Clock3,
  LockKeyhole,
  PlayCircle,
} from "lucide-react";
import type {
  AcademyCourseDetail,
  AcademyLearningState,
} from "@/types/academy";
import {
  formatAcademyDuration,
  isLessonLocked,
  lessonTypeLabel,
} from "@/lib/academy/academyPresentation";

type CourseCurriculumProps = {
  course: AcademyCourseDetail;
  learningState?: AcademyLearningState | null;
};

export function CourseCurriculum({
  course,
  learningState = null,
}: CourseCurriculumProps) {
  const lessonState = new Map(
    learningState?.lessonProgress.map((item) => [item.lessonId, item]),
  );
  return (
    <div className="academy-curriculum">
      {course.modules.map((module, moduleIndex) => {
        const moduleState = learningState?.moduleProgress.find(
          (item) => item.moduleId === module.id,
        );
        return (
          <section className="academy-module" key={module.id}>
            <details open>
              <summary>
                <div>
                  <span>Module {moduleIndex + 1}</span>
                  <h2>{module.title}</h2>
                  {module.description ? <p>{module.description}</p> : null}
                </div>
                <div className="academy-module-progress">
                  <strong>
                    {learningState
                      ? `${Math.round(moduleState?.progressPercent ?? 0)}%`
                      : module.requiredForCompletion
                        ? "Required"
                        : "Optional"}
                  </strong>
                  <span>{formatAcademyDuration(module.durationMinutes)}</span>
                </div>
              </summary>
              <ol>
                {module.lessons.map((lesson) => {
                  const progress = lessonState.get(lesson.id);
                  const locked = isLessonLocked(progress?.status);
                  const completed = progress?.status === "completed";
                  const content = (
                    <>
                      <span className="academy-lesson-state" aria-hidden="true">
                        {locked ? (
                          <LockKeyhole size={17} />
                        ) : completed ? (
                          <CheckCircle2 size={17} />
                        ) : learningState ? (
                          <PlayCircle size={17} />
                        ) : (
                          <Circle size={17} />
                        )}
                      </span>
                      <span className="academy-lesson-copy">
                        <strong>{lesson.title}</strong>
                        <small>
                          {lessonTypeLabel(lesson.lessonType)} ·{" "}
                          {formatAcademyDuration(lesson.durationMinutes)} ·{" "}
                          {lesson.requiredForCompletion
                            ? "Required"
                            : "Optional"}
                        </small>
                      </span>
                      {lesson.accessLevel === "premium" ? (
                        <span className="academy-lesson-premium">Premium</span>
                      ) : null}
                      {progress ? (
                        <span className="academy-lesson-percent">
                          {Math.round(progress.progressPercent)}%
                        </span>
                      ) : (
                        <Clock3 size={15} aria-hidden="true" />
                      )}
                    </>
                  );
                  return (
                    <li key={lesson.id}>
                      {learningState && !locked ? (
                        <Link
                          href={`/academy/courses/${course.slug}/learn/${lesson.slug}`}
                        >
                          {content}
                        </Link>
                      ) : (
                        <div
                          aria-label={
                            locked ? `${lesson.title}, locked` : undefined
                          }
                        >
                          {content}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </details>
          </section>
        );
      })}
    </div>
  );
}
