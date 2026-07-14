import Link from "next/link";
import { DEFAULT_WATCHLIST } from "@/constants/markets";
import { DashboardPanel } from "./DashboardPanel";

export function Watchlist() {
  return (
    <DashboardPanel id="watchlist" eyebrow="Market monitor" title="Watchlist">
      <ul className="dashboard-watchlist">
        {DEFAULT_WATCHLIST.map((item) => (
          <li key={item.symbol}>
            <div>
              <strong>{item.name}</strong>
              <span>{item.symbol}</span>
            </div>
            <span>{item.session}</span>
            <span className="watchlist-status">
              <i aria-hidden="true" />
              Tracking
            </span>
          </li>
        ))}
      </ul>
      <p className="dashboard-data-note">
        Instrument watchlist only · No live pricing connected
      </p>
      <Link href="/analysis" className="text-link">
        Open market analysis →
      </Link>
    </DashboardPanel>
  );
}
