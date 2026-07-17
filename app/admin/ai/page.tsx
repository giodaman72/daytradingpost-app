import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getAssistantAdminSummary } from "@/lib/ai/assistantAdmin";
import { requireAssistantAdmin } from "@/lib/ai/assistantAuthorization";

export const metadata: Metadata = {
  title: "AI Assistant Operations",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ days?: string }> };

export default async function AdminAIPage({ searchParams }: Props) {
  try {
    await requireAssistantAdmin();
  } catch {
    redirect("/account?notice=admin-access-required");
  }
  const requested = Number((await searchParams).days);
  const days = [1, 7, 30].includes(requested) ? requested : 7;
  const to = new Date();
  const from = new Date(to.getTime() - days * 86_400_000);
  const summary = await getAssistantAdminSummary(
    from.toISOString(),
    to.toISOString(),
  );
  const metrics = [
    ["Requests", summary.requests],
    ["Active users", summary.activeUsers],
    ["Average response", `${summary.averageResponseMs} ms`],
    ["Error rate", `${summary.errorRate}%`],
    ["Provider failures", summary.providerFailures],
    ["Input tokens", summary.inputTokens.toLocaleString()],
    ["Output tokens", summary.outputTokens.toLocaleString()],
    [
      "Estimated cost",
      summary.estimatedCost === null
        ? "Not configured"
        : summary.estimatedCost.toFixed(4),
    ],
    ["Safety refusals", summary.refusals],
    ["Citation coverage", `${summary.citationCoverage}%`],
    ["Positive feedback", summary.positiveFeedback],
    ["Negative feedback", summary.negativeFeedback],
  ];
  return (
    <main className="assistant-admin-page">
      <Header />
      <section className="assistant-hero">
        <div className="container">
          <span className="section-kicker">Privacy-conscious operations</span>
          <h1>AI Assistant observability</h1>
          <p>
            Aggregates only. Prompts, responses, private source context, keys,
            and hidden instructions are not displayed.
          </p>
          <nav aria-label="Date range">
            {[1, 7, 30].map((value) => (
              <a
                href={`/admin/ai?days=${value}`}
                aria-current={days === value ? "page" : undefined}
                key={value}
              >
                {value} day{value === 1 ? "" : "s"}
              </a>
            ))}
          </nav>
        </div>
      </section>
      <section className="container assistant-admin-grid">
        {metrics.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
        <article className="assistant-admin-wide">
          <span>Top context modes</span>
          {summary.topModes.length ? (
            <ol>
              {summary.topModes.map(([mode, count]) => (
                <li key={mode}>
                  {mode.replaceAll("_", " ")} <strong>{count}</strong>
                </li>
              ))}
            </ol>
          ) : (
            <p>No assistant requests in this date range.</p>
          )}
        </article>
      </section>
      <Footer />
    </main>
  );
}
