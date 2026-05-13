"use server";

import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { requireWorkspaceId } from "@/lib/auth-helpers";
import { dashboardStatsTag } from "@/lib/cache-tags";

export interface DashboardStats {
  activeProjects: number;
  customers: number;
  invoices: number;
  designs: number;
}

// Why: the four COUNT() queries fire on every dashboard mount. Caching
// for 30s with per-workspace tag keeps stale data bounded and lets
// mutations bust their own tenant precisely via revalidateTag.
const getStatsForWorkspace = (workspaceId: string) =>
  unstable_cache(
    async (): Promise<DashboardStats> => {
      const [activeProjects, customers, invoices, designs] = await Promise.all([
        db.project.count({
          where: {
            workspaceId,
            status: { in: ["DRAFT", "IN_REVIEW", "APPROVED", "IN_PRODUCTION"] },
          },
        }),
        db.customer.count({ where: { workspaceId } }),
        db.invoice.count({ where: { project: { workspaceId } } }),
        db.design.count({ where: { project: { workspaceId } } }),
      ]);
      return { activeProjects, customers, invoices, designs };
    },
    [`dashboard-stats-${workspaceId}`],
    { revalidate: 30, tags: [dashboardStatsTag(workspaceId)] },
  )();

export async function getDashboardStats(): Promise<DashboardStats> {
  const workspaceId = await requireWorkspaceId();
  return getStatsForWorkspace(workspaceId);
}
