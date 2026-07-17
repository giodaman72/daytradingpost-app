import Link from "next/link";
import { getInstrument } from "@/constants/instruments";
import { getAuthenticatedUser } from "@/lib/auth";
export async function MarketQuickActions({
  instrument: value,
}: {
  instrument: string;
}) {
  const instrument = getInstrument(value);
  if (!instrument) return null;
  const user = await getAuthenticatedUser();
  const next = `/alerts/new?instrument=${instrument.slug}`;
  return (
    <aside
      className="market-quick-actions"
      aria-label={`${instrument.name} member actions`}
    >
      <strong>Track {instrument.name}</strong>
      <div>
        {user ? (
          <>
            <Link href="/watchlists">Add to watchlist</Link>
            <Link href={`${next}&type=price_above`}>Create price alert</Link>
            <Link href={`${next}&type=market_bias_changed`}>
              Bias-change alert
            </Link>
            <Link href={`${next}&type=new_market_analysis`}>
              New-analysis alert
            </Link>
          </>
        ) : (
          <Link href={`/login?next=${encodeURIComponent(next)}`}>
            Sign in to create watchlists and alerts
          </Link>
        )}
      </div>
    </aside>
  );
}
