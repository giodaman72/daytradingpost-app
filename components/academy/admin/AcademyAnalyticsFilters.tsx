import type { AcademyAdminCourse } from "@/types/academy-admin";

export function AcademyAnalyticsFilters({
  courses,
  defaultValues,
  showInstructor = false,
}: {
  courses: AcademyAdminCourse[];
  defaultValues: {
    courseId: string | null;
    dateFrom: string;
    dateTo: string;
    instructorId: string | null;
  };
  showInstructor?: boolean;
}) {
  const instructors = [
    ...new Map(
      courses
        .filter((course) => course.instructor)
        .map((course) => [course.instructor?.id, course.instructor] as const),
    ).values(),
  ];
  return (
    <form className="academy-admin-filters" method="get">
      <label>
        From
        <input defaultValue={defaultValues.dateFrom} name="from" type="date" />
      </label>
      <label>
        To
        <input defaultValue={defaultValues.dateTo} name="to" type="date" />
      </label>
      <label>
        Course
        <select defaultValue={defaultValues.courseId ?? ""} name="course">
          <option value="">All courses</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </label>
      {showInstructor ? (
        <label>
          Instructor
          <select
            defaultValue={defaultValues.instructorId ?? ""}
            name="instructor"
          >
            <option value="">All instructors</option>
            {instructors.map((instructor) =>
              instructor ? (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.name}
                </option>
              ) : null,
            )}
          </select>
        </label>
      ) : null}
      <button className="button" type="submit">
        Apply filters
      </button>
    </form>
  );
}
