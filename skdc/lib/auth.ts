import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { db } from "@/lib/db";
import { providers } from "@/lib/auth.config";

/**
 * NextAuth v5 (Auth.js) configuration for SKDC.
 *
 * - Database session strategy (so we can use Prisma adapter & enrich session).
 * - Magic-link email sign-in (console provider for dev).
 * - Auto-creates an owning Workspace + Membership for every new user.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers,
  session: { strategy: "database" },
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/verify-request",
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;

      const slug = `ws-${user.id.slice(-8)}`;

      // Pick a friendly workspace name based on what we know about the user.
      const displayName =
        (user.name && user.name.trim()) ||
        (user.email ? user.email.split("@")[0] : null);

      const workspaceName = displayName
        ? `مساحة ${displayName}`
        : "مساحتي";

      try {
        await db.workspace.create({
          data: {
            name: workspaceName,
            slug,
            members: {
              create: {
                userId: user.id,
                role: "OWNER",
              },
            },
          },
        });
      } catch (err) {
        // Don't break sign-in if workspace bootstrap fails — surface in logs.
        // eslint-disable-next-line no-console
        console.error("[auth.createUser] failed to bootstrap workspace:", err);
      }
    },
  },
});
