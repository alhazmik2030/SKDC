import { PageHeader } from "@/components/dashboard/page-header";
import { StatGrid } from "@/components/dashboard/stat-grid";
import { QuickActions, RecentActivityPlaceholder } from "@/components/dashboard/quick-actions";
import { getDashboardStats } from "@/lib/actions/dashboard-stats";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const stats = await getDashboardStats();

  return (
    <div>
      <PageHeader
        eyebrowKey="dashboard.eyebrow"
        titleKey="dashboard.welcome"
        descriptionKey="dashboard.subtitle"
      />

      <StatGrid stats={stats} />

      <QuickActions />

      <RecentActivityPlaceholder />
    </div>
  );
}
