# SKDC — Security Posture

> Snapshot of the security model in production at https://skdc-production.up.railway.app
> as of 2026-05-13. Items flagged "future hardening" are known gaps with planned work.

---

## 1. Authentication

- **Library:** NextAuth v5 (Auth.js) with `@auth/prisma-adapter`.
- **Providers:**
  - Email + password (credentials provider) — passwords hashed with **bcryptjs** at the conventional cost factor (12 rounds in production). Plaintext passwords are never logged or persisted.
  - Magic-link email via Resend (verification tokens persisted to `VerificationToken`, single-use, expiring).
  - Google OAuth 2.0.
- **Sessions:** JWT strategy. Tokens are signed with `AUTH_SECRET` and stored in HTTP-only, Secure, SameSite=Lax cookies.
- **CSRF protection:** built into NextAuth — every state-changing form posts an anti-CSRF token; cookies are SameSite=Lax by default.
- **Workspace bootstrap:** wrapped in try/catch so a failure during workspace creation never leaks an authenticated session into a half-provisioned state and never blocks sign-in.

Files: `skdc/lib/auth.ts`, `skdc/lib/auth.config.ts`, `skdc/lib/actions/register.ts`, `skdc/middleware.ts`.

---

## 2. Route Protection

- All routes under `/dashboard/*` are gated by `skdc/middleware.ts` using the NextAuth `auth()` wrapper. Unauthenticated requests are redirected to `/sign-in?from=<original>`.
- Server actions begin with `requireWorkspaceId()` from `skdc/lib/auth-helpers.ts` — there is no "current user" without a workspace membership; missing membership throws.
- Public routes: `/`, `/sign-in`, `/sign-up`, `/verify-request`, `/api/auth/*`, `/api/mcp` (auth handled inline).

---

## 3. Secrets Management

- All secrets are environment-only:
  - `DATABASE_URL` (Supabase pooler)
  - `DIRECT_URL` (Supabase direct, for Prisma migrations)
  - `AUTH_SECRET` (JWT signing)
  - `NEXTAUTH_URL`
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `RESEND_API_KEY`
- `.env` and `.env.local` are gitignored. Verified: no secret values appear in version control.
- **Gap:** the repository does not currently ship a `.env.example` listing the expected variable names. Adding one is a small task that improves onboarding without exposing values. **Future hardening.**

---

## 4. API Tokens (MCP)

- Tokens are **generated server-side** using `crypto.randomBytes(24).toString("base64url")` with a `skdc_` prefix.
- Only the **SHA-256 hash** is persisted (`ApiToken.hash`, uniquely indexed). The plaintext is shown to the user **exactly once** at creation time; there is no recovery path.
- A non-secret 12-character prefix (`ApiToken.prefix`) is stored for display ("skdc_xxxxxxxx…").
- Tokens are workspace-scoped — every Bearer-token call resolves the workspace from the token, not from a session.
- Tokens can be revoked (`revokedAt`); revoked tokens fail verification.
- `lastUsedAt` is updated on each verification for observability.

Files: `skdc/lib/api-tokens.ts`, `skdc/lib/actions/api-tokens.ts`, `skdc/components/api/api-tokens-card.tsx`.

---

## 5. Multi-Tenancy Isolation

- Every domain table carries `workspaceId` and every query path scopes by it. Cross-tenant queries are not possible from the application surface — the only API to enter a query is via server actions that require a resolved workspace context.
- `Membership` enforces `@@unique([userId, workspaceId])` so a user cannot accidentally be double-bound.
- **Database-level RLS (Row Level Security):** **not yet enabled** on Supabase. The application-layer scoping is the current isolation guarantee. **Future hardening:** enable Postgres RLS policies as a defense-in-depth layer so even a hypothetical leaky query path cannot escape the tenant.

---

## 6. Transport Security

- Railway terminates HTTPS for the production host (`skdc-production.up.railway.app`). HTTP→HTTPS redirect is enforced.
- Cookies are set `Secure` in production (NextAuth default when `NEXTAUTH_URL` is HTTPS).
- Prisma → Supabase traffic is over Postgres-wire TLS.

---

## 7. HTTP Headers

- **Current:** Next.js defaults plus framework-set headers. NextAuth sets `Set-Cookie` with `HttpOnly; Secure; SameSite=Lax` on session cookies.
- **Gap:** no explicit Content-Security-Policy is configured yet. The 3D + Konva surface uses `eval`-free build output, so a moderate CSP (`default-src 'self'; img-src 'self' data: blob:; script-src 'self' 'unsafe-inline'`) is achievable as a near-term task. **Future hardening.**
- **Gap:** `Strict-Transport-Security`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` should be configured in `next.config.ts`. **Future hardening.**

---

## 8. Database

- Postgres 15 on Supabase (region `ap-southeast-1`).
- Connections through pgBouncer (`:6543`) for application queries; direct (`:5432`) for migrations only.
- Backups: Supabase manages automated daily snapshots; **adding restore-test verification** is on the Q3 2026 roadmap (see ROADMAP.md).
- Migrations are tracked in `skdc/prisma/schema.prisma` with Prisma Migrate; the `seed.ts` is idempotent.

---

## 9. Dependency Hygiene

- `package-lock.json` is committed (deterministic installs).
- Stack pinned to recent stable versions: Next 16.2.6, React 19.2.4, Prisma 6.19.3, NextAuth 5 (beta), Tailwind v4, `@modelcontextprotocol/sdk` 1.29.
- `npm audit` should be part of the CI pre-deploy gate — **enable on Railway pipeline as a near-term hardening item**.
- Dependabot / Renovate not yet configured — **future hardening**.

---

## 10. Audit Trails

- `MachineExport` rows record every export attempt (status, format, adapter, file, optional job id, error message). This is the production audit log for cut-plan emission.
- `ApiToken.lastUsedAt` records the last time each token was used.
- **Gap:** there is no user-facing audit log surface yet (admins cannot see "who changed what" in the UI). Server-side logs are available via Railway. **Future hardening — Q2 2027 roadmap.**

---

## 11. Known Future Hardening (Summary)

| # | Item | Priority |
|---|---|---|
| 1 | Add `.env.example` listing expected variable names | Low |
| 2 | Enable Supabase RLS policies on tenant tables | High |
| 3 | Configure CSP, HSTS, X-Frame-Options, Referrer-Policy in `next.config.ts` | High |
| 4 | Verify Postgres backup restore in CI | Medium |
| 5 | Enable `npm audit` (and Dependabot) in Railway pipeline | Medium |
| 6 | User-facing audit log UI (Settings → Activity) | Low (planned Q2 2027) |
| 7 | OAuth 2.1 + PKCE on `/api/mcp` (currently Bearer + session fallback) | Medium |
| 8 | Per-workspace rate limiting on `/api/mcp` | Medium |
