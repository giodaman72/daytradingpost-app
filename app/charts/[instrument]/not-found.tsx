import Link from "next/link";
export default function ChartNotFound() {
  return (
    <main className="chart-unavailable">
      <h1>Chart unavailable</h1>
      <p>This instrument is not in the DayTradingPost registry.</p>
      <Link href="/charts">View supported charts</Link>
    </main>
  );
}
