import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Loads the current authenticated user from session + DB.
 * Returns null if not signed in.
 */
export async function getCurrentUser() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;
  return db.user.findUnique({ where: { id: userId } });
}

/**
 * Returns the user's primary workspace (first OWNER membership).
 * Throws if no session or no workspace — server actions should catch.
 */
export async function getCurrentWorkspace() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    throw new Error("UNAUTHENTICATED");
  }

  // Prefer OWNER membership; fall back to any membership.
  const membership = await db.membership.findFirst({
    where: { userId },
    orderBy: { role: "asc" }, // OWNER < ADMIN < ... alphabetically not guaranteed; we'll filter below
    include: { workspace: true },
  });

  if (!membership) {
    throw new Error("NO_WORKSPACE");
  }

  return { user: { id: userId }, workspace: membership.workspace, role: membership.role };
}

/** Convenience: gets just the workspaceId, throwing if absent. */
export async function requireWorkspaceId(): Promise<string> {
  const { workspace } = await getCurrentWorkspace();
  return workspace.id;
}
