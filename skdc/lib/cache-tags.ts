/**
 * Cache tags shared between read paths (unstable_cache) and write paths
 * (revalidateTag). Plain sync helpers — kept out of any `"use server"`
 * file so they can be imported from both server actions and route handlers.
 */
export function dashboardStatsTag(workspaceId: string): string {
  return `dashboard-stats:${workspaceId}`;
}
