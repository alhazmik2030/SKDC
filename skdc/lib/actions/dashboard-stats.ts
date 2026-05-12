"use server";

import { db } from "@/lib/db";
import { requireWorkspaceId } from "@/lib/auth-helpers";

export interface DashboardStats {
  activeProjects: number;
  customers: number;
  invoices: number;
  designs: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const workspaceId = await requireWorkspaceId();

  const [activeProjects, customers, invoices, designs] = await Promise.all([
    db.project.count({
      where: { workspaceId, status: { in: ["DRAFT", "IN_REVIEW", "APPROVED", "IN_PRODUCTION"] } },
    }),
    db.customer.count({ where: { workspaceId } }),
    db.invoice.count({ where: { project: { workspaceId } } }),
    db.design.count({ where: { project: { workspaceId } } }),
  ]);

  return { activeProjects, customers, invoices, designs };
}
