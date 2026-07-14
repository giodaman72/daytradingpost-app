import Link from "next/link";
import { BookOpenCheck } from "lucide-react";
import { DashboardPanel } from "./DashboardPanel";

export function AcademyProgress() {
  return (
    <DashboardPanel id="academy-progress" eyebrow="Learning path" title="Academy Progress">
      <div className="dashboard-progress-card">
        <div className="dashboard-progress-heading">
          <span><BookOpenCheck size={21} aria-hidden="true" /></span>
          <div><strong>Trading foundations</strong><p>No lessons completed yet</p></div>
          <b>0%</b>
        </div>
        <div className="dashboard-progress-track" role="progressbar" aria-label="Trading foundations progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}>
          <span style={{ width: "0%" }} />
        </div>
        <p>Start with market structure, risk management and repeatable trade planning.</p>
        <Link href="/academy" className="button button-secondary">Explore the academy</Link>
      </div>
    </DashboardPanel>
  );
}
