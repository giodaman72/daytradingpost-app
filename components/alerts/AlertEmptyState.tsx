import Link from "next/link";
export function AlertEmptyState() {
  return (
    <div className="smart-empty">
      <span aria-hidden="true">◉</span>
      <h2>No smart alerts yet</h2>
      <p>
        Create a server-evaluated alert using verified market, editorial,
        analysis, or economic data.
      </p>
      <Link className="button" href="/alerts/new">
        Create alert
      </Link>
    </div>
  );
}
