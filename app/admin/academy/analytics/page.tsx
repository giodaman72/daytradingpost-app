import type { Metadata } from "next";
import { AcademyAdminShell } from "@/components/academy/admin/AcademyAdminShell";
import { AcademyAnalyticsFilters } from "@/components/academy/admin/AcademyAnalyticsFilters";
import { AcademyMetricGrid } from "@/components/academy/admin/AcademyMetricGrid";
import {
  getAdminAcademyAnalytics,
  parseAcademyAnalyticsFilters,
} from "@/lib/academy/admin/academyAnalyticsService";
import { listAdminAcademyCourses } from "@/lib/academy/admin/academyAdminContent";

export const metadata: Metadata = {
  title: "Academy Analytics",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AcademyAnalyticsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    course?: string | string[];
    from?: string | string[];
    instructor?: string | string[];
    to?: string | string[];
  }>;
}) {
  const filters = parseAcademyAnalyticsFilters(await searchParams);
  const [dashboard, courses] = await Promise.all([
    getAdminAcademyAnalytics(filters),
    listAdminAcademyCourses(),
  ]);
  return (
    <AcademyAdminShell
      title="Academy analytics"
      description="Aggregate content, funnel, learning, assessment, certificate, resource, Tutor and recommendation activity. Metrics come only from recorded events and database state."
    >
      <AcademyAnalyticsFilters
        courses={courses}
        defaultValues={filters}
        showInstructor
      />
      <p className="academy-admin-notice">
        Cohort: {dashboard.cohortSize} learner
        {dashboard.cohortSize === 1 ? "" : "s"}. Rates for cohorts smaller than
        {dashboard.privacyThreshold} are suppressed.
      </p>
      <AcademyMetricGrid
        metrics={dashboard.metrics}
        privacyThreshold={dashboard.privacyThreshold}
      />
    </AcademyAdminShell>
  );
}
