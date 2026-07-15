import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MarketBiasBadge } from "@/components/market-intelligence/MarketBiasBadge";
import { AdminDeleteButton } from "@/components/market-intelligence/AdminDeleteButton";
import { requireMarketEditor } from "@/lib/auth/adminAuthorization";
import { listAllIntelligence } from "@/lib/market/marketIntelligenceRepository";
import { deleteMarketIntelligence } from "./actions";

export const metadata: Metadata = {
  title: "Market Intelligence Editor",
  description: "Manage DayTradingPost editorial market outlooks.",
  robots: { index: false, follow: false },
};

const statusMessages: Record<string, string> = {
  created: "The outlook was created.",
  updated: "The outlook was updated.",
  deleted: "The outlook was deleted.",
  "delete-failed": "The outlook could not be deleted.",
};

export default async function MarketIntelligenceAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireMarketEditor();
  const [records, query] = await Promise.all([
    listAllIntelligence(),
    searchParams,
  ]);

  return (
    <main className="mi-admin-page">
      <Header />
      <section className="container mi-admin-shell">
        <header className="mi-admin-heading">
          <div>
            <span className="section-kicker">Editorial operations</span>
            <h1>Market Intelligence Editor</h1>
            <p>
              Manage structured, date-specific outlooks used throughout
              DayTradingPost.
            </p>
          </div>
          <Link className="button" href="/admin/market-intelligence/new">
            New outlook
          </Link>
        </header>

        {query.status && statusMessages[query.status] ? (
          <p className="form-status" role="status">
            {statusMessages[query.status]}
          </p>
        ) : null}

        {records.length ? (
          <div className="mi-admin-table-wrap">
            <table className="mi-admin-table">
              <caption className="sr-only">Market intelligence records</caption>
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th>Date</th>
                  <th>Bias</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <strong>{record.instrumentName}</strong>
                      <span>{record.symbol}</span>
                    </td>
                    <td>{record.validForDate}</td>
                    <td>
                      <MarketBiasBadge bias={record.bias} />
                    </td>
                    <td>
                      {record.isPublished ? "Published" : "Draft"}
                      {record.isFeatured ? " · Featured" : ""}
                    </td>
                    <td className="mi-admin-actions">
                      <Link
                        href={`/admin/market-intelligence/${record.id}/edit`}
                      >
                        Edit
                      </Link>
                      <AdminDeleteButton
                        action={deleteMarketIntelligence.bind(null, record.id)}
                        label={`${record.instrumentName} outlook for ${record.validForDate}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mi-empty">
            <h2>No outlooks yet</h2>
            <p>
              Create the first editorial market outlook to populate the site.
            </p>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
