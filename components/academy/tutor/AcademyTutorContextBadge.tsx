export function AcademyTutorContextBadge({
  courseTitle,
  lessonTitle,
}: {
  courseTitle?: string | null;
  lessonTitle?: string | null;
}) {
  return (
    <span className="assistant-context-badge">
      {lessonTitle
        ? `${courseTitle ?? "Academy"} · ${lessonTitle}`
        : (courseTitle ?? "Academy Tutor")}
    </span>
  );
}
