export function EmptyState({
  title = "No economic events found",
  description = "No verified events match the selected period and filters.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="economic-empty" role="status">
      <span aria-hidden="true">◎</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
