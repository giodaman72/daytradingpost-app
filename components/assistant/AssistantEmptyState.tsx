export function AssistantEmptyState() {
  return (
    <div className="assistant-empty">
      <span aria-hidden="true">DTP AI</span>
      <h2>Ask from verified DayTradingPost context.</h2>
      <p>
        Choose a mode or prompt below. Market answers show their source,
        timestamp, and delayed or fixture status.
      </p>
    </div>
  );
}
