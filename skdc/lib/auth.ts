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
  // JWT session strategy — works in Edge runtime (middleware).
  // User/Account/VerificationToken are still in DB via PrismaAdapter,
  // but the session itself lives in a signed cookie.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/verify-request",
  },
  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, copy the DB user id into the token.
      if (user?.id) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose user.id to the client/session object.
      if (session.user && token.userId) {
        (session.user as { id: string }).id = token.userId as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Workspace bootstrap is best-effort. If ANYTHING fails here,
      // swallow the error so the user can still sign in. We can
      // create the workspace on-demand later from the dashboard.
      try {
        if (!user.id) return;

        // Idempotent: skip if the user already has a membership.
        const existing = await db.membership.findFirst({
          where: { userId: user.id },
        });
        if (existing) return;

        const displayName =
          (user.name && user.name.trim()) ||
          (user.email ? user.email.split("@")[0] : null);

        // Slug must be globally unique on Workspace; suffix with epoch to
        // guarantee uniqueness even across re-attempts.
        const slug = `ws-${user.id.slice(-6)}-${Date.now().toString(36)}`;

        const workspaceName = displayName
          ? `مساحة ${displayName}`
          : "مساحتي";

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
        // eslint-disable-next-line no-console
        console.error("[auth.createUser] workspace bootstrap failed:", err);
        // intentionally swallow — never block sign-in
      }
    },
  },
  // Helpful logging in dev to diagnose token issues
  logger: {
    error(error) {
      // eslint-disable-next-line no-console
      console.error("[next-auth][error]", error);
    },
    warn(code) {
      // eslint-disable-next-line no-console
      console.warn("[next-auth][warn]", code);
    },
  },
});
