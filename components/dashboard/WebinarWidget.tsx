import Link from "next/link";
import { Video } from "lucide-react";
import { DashboardPanel } from "./DashboardPanel";

export function WebinarWidget() {
  return (
    <DashboardPanel id="webinar" eyebrow="Live education" title="Webinar Widget">
      <div className="dashboard-webinar-card">
        <span className="dashboard-webinar-icon"><Video size={23} aria-hidden="true" /></span>
        <div>
          <span>Next session</span>
          <h3>Weekly Market Planning Room</h3>
          <p>The webinar calendar is being prepared. New sessions will appear here when scheduled.</p>
        </div>
        <Link href="/webinars" className="button button-secondary">View webinars</Link>
      </div>
    </DashboardPanel>
  );
}
