import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatGrid } from "@/components/dashboard/stat-grid";
import { QuickActions, RecentActivityPlaceholder } from "@/components/dashboard/quick-actions";
import { getDashboardStats } from "@/lib/actions/dashboard-stats";

export const dynamic = "force-dynamic";

export default function DashboardHome() {
  return (
    <div>
      <PageHeader
        eyebrowKey="dashboard.eyebrow"
        titleKey="dashboard.welcome"
        descriptionKey="dashboard.subtitle"
      />

      {/* Why: stream stats independently so PageHeader + QuickActions paint
          immediately while the four COUNT() queries resolve. */}
      <Suspense fallback={<StatGridSkeleton />}>
        <StatGridAsync />
      </Suspense>

      <QuickActions />

      <Suspense fallback={null}>
        <RecentActivityPlaceholder />
      </Suspense>
    </div>
  );
}

async function StatGridAsync() {
  const stats = await getDashboardStats();
  return <StatGrid stats={stats} />;
}

function StatGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-[148px] animate-pulse rounded-2xl border border-border bg-card/30 p-6"
          aria-hidden
        >
          <div className="mb-4 h-10 w-10 rounded-xl bg-white/[0.04]" />
          <div className="h-8 w-16 rounded bg-white/[0.04]" />
          <div className="mt-3 h-3 w-24 rounded bg-white/[0.03]" />
        </div>
      ))}
    </div>
  );
}
