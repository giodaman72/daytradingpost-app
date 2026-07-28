export function AcademyTutorEmptyState({
  lessonTitle,
}: {
  lessonTitle?: string | null;
}) {
  return (
    <div className="assistant-empty">
      <span aria-hidden="true">DTP Tutor</span>
      <h2>
        {lessonTitle
          ? `Ask about “${lessonTitle}”.`
          : "Study from authorized Academy sources."}
      </h2>
      <p>
        Choose a learning action or write a question. The Tutor runs only after
        you submit and never receives private notes by default.
      </p>
    </div>
  );
}
