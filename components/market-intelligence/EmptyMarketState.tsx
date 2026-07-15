import Link from "next/link";

export function EmptyMarketState({ admin = false }: { admin?: boolean }) {
  return (
    <div className="mi-empty" role="status">
      <span aria-hidden="true">◇</span>
      <h3>No published outlooks available</h3>
      <p>
        The editorial desk has not published structured market intelligence for
        this view yet.
      </p>
      {admin ? (
        <Link href="/admin/market-intelligence/new">Create an outlook</Link>
      ) : (
        <Link href="/analysis">Browse analysis</Link>
      )}
    </div>
  );
}
