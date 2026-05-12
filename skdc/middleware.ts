import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

/**
 * Route protection for SKDC.
 *
 * NOTE: Next.js 16 deprecates `middleware.ts` in favor of `proxy.ts`, but
 *       the file is still respected. We follow the agent spec and keep the
 *       `middleware.ts` name; rename to `proxy.ts` when convenient.
 *
 * We use `auth` from NextAuth v5 as a wrapper, which decorates the request
 * with `req.auth`. If the user is not authenticated, they are redirected to
 * `/sign-in?from=<original-path>`.
 */
export default auth((req) => {
  const isAuthed = !!req.auth;

  if (!isAuthed) {
    const signInUrl = new URL("/sign-in", req.nextUrl);
    // Preserve where the user wanted to go for post-login redirect.
    signInUrl.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

// Only run middleware on protected routes — keep public pages fast.
export const config = {
  matcher: ["/dashboard/:path*"],
};
