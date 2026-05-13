# SKDC — Technical Architecture

> For technical due diligence. Reflects the live production system at
> https://skdc-production.up.railway.app as of 2026-05-13.

---

## 1. Stack Diagram

```
                       ┌──────────────────────────────┐
   Browser  ◄────────► │  Next.js 16 (App Router)     │
   (RSC + Client)      │  React 19 · TypeScript 5     │
                       │  Tailwind v4 · Konva · Three │
                       └──────────────┬───────────────┘
                                      │ Server Actions / fetch
                                      ▼
                       ┌──────────────────────────────┐
                       │  Next.js Runtime (Railway)   │
                       │  NextAuth v5 (JWT sessions)  │
                       │  /api/mcp  (JSON-RPC 2.0)    │
                       │  /api/auth/[...nextauth]     │
                       └──────────────┬───────────────┘
                                      │ Prisma 6
                                      ▼
                       ┌──────────────────────────────┐
                       │  PostgreSQL  (Supabase)      │
                       │  pgBouncer pooler + direct   │
                       └──────────────────────────────┘

   External: Resend (transactional email) · Google OAuth · Claude / Cursor (MCP clients)
```

---

## 2. Multi-Tenancy Model

Tenant boundary = **Workspace**. Every domain row carries `workspaceId` and every server action begins with `requireWorkspaceId()`.

```
User ──┐
       │  Membership (role: OWNER | ADMIN | DESIGNER | VIEWER)
       └──► Workspace ──► Customer, Material, Template, Project, Machine, ApiToken
                                                     │
                                                     ▼
                                                  Design ──► Unit (templateId, materialId)
                                                     │
                                                     ▼
                                                  Invoice, MachineExport
```

- **Workspace bootstrap:** triggered in `auth.ts` → `events.createUser` on first sign-in. Creates a Workspace + Membership(role=OWNER) with a unique slug. Idempotent and best-effort (sign-in never blocked on bootstrap failure).
- **Role enforcement:** roles are stored but currently UI-permissive; back-end queries always scope by `workspaceId`, so cross-tenant leakage is structurally prevented.
- **Templates:** `workspaceId` is nullable — `NULL` means global template (system-seeded).

Files: `skdc/lib/auth-helpers.ts`, `skdc/lib/auth.ts`.

---

## 3. Auth Flow

```
1. User submits /sign-in (email+password)  OR  /sign-up  OR  Google OAuth
2. NextAuth credentials/oauth provider validates
3. PrismaAdapter persists User / Account / VerificationToken
4. JWT session cookie issued (signed, edge-runtime compatible)
5. Middleware (skdc/middleware.ts) gates /dashboard/*  via  auth() wrapper
6. Server actions resolve current user from auth() and resolve workspace via membership
```

- **Session strategy:** `jwt` (works in Edge runtime → middleware can read it without DB hit).
- **Password storage:** bcryptjs, default 10–12 rounds.
- **Magic links:** Resend transport, falls back to console in dev.
- **`trustHost: true`** so Railway's dynamic `*.up.railway.app` host is accepted.

Files: `skdc/lib/auth.ts`, `skdc/lib/auth.config.ts`, `skdc/middleware.ts`, `skdc/lib/actions/register.ts`.

---

## 4. MCP API Contract

**Endpoint:** `POST /api/mcp`
**Protocol:** JSON-RPC 2.0 over HTTP (MCP `2025-06-18`)
**Auth:** `Authorization: Bearer skdc_<base64url>`, falls back to NextAuth session cookie when present.

**Supported methods:**

| Method | Purpose |
|---|---|
| `initialize` | Returns server info, protocol version, capabilities |
| `tools/list` | Returns the 6 tools and their JSON Schemas (auto-derived from Zod) |
| `tools/call` | Invokes a tool with validated arguments |
| `ping` | Liveness |
| `notifications/initialized` | Acknowledged (no response) |

**Six tools:**

| Tool | Type | Purpose |
|---|---|---|
| `list_templates` | read | Global + workspace templates, optional category filter |
| `list_customers` | read | Workspace customers |
| `list_projects` | read | Workspace projects |
| `create_customer` | write | Create customer |
| `create_project` | write | Create project + optional customer link + room dims |
| `add_unit_to_project` | write | Instantiate a template into a project's design at (x, y) mm |

**Batch support:** clients may send an array of requests; server returns array of responses, suppressing notifications.

Files: `skdc/app/api/mcp/route.ts`, `skdc/lib/mcp/skdc-tools.ts`, `skdc/lib/api-tokens.ts`.

---

## 5. Database Schema Overview

17 Prisma models grouped into three areas:

### Auth (NextAuth-compatible)
`Account`, `Session`, `VerificationToken`, `User`

### Core / Tenancy
`Workspace` (slug, plan: FREE | PRO | ENTERPRISE)
`Membership` (role: OWNER | ADMIN | DESIGNER | VIEWER, unique on `[userId, workspaceId]`)
`ApiToken` (workspace-scoped, hash + prefix only)

### Domain
- `Customer` (workspace-scoped)
- `Material` (enum `MaterialType`: HPL, POLYLACK, UVLACK, MELAMIN, MDF, PLYLACK, WOOD, GLASS, OTHER; glass tint/finish optional)
- `Template` (workspace-nullable for globals; `TemplateCategory` enum; `defaultWidth/Height/Depth` in mm; `options: Json`)
- `Project` (linked to `Customer`, room dims in mm, `DesignStyle` enum: MODERN, CLASSIC, NEO_CLASSIC, INDUSTRIAL, SCANDINAVIAN)
- `Design` (1:1 with Project, holds canonical layout JSON)
- `Unit` (belongs to Design, references `Template` + `Material`, mm coords + rotation)
- `Invoice` (`number` unique-per-project, SAR default, 15% VAT field, line items JSON)

### Machines
- `Machine` (`MachineCategory`, `MachineFormat` preferred, `MachineChannel`, optional `endpoint`+`credentials` JSON)
- `MachineExport` (audit row per export: status, fileUrl, jobId, errorMessage)

Key relations indexed: `(workspaceId)`, `(customerId)`, `(projectId)`, `(adapterId)`, `(status)`.

File: `skdc/prisma/schema.prisma`.

---

## 6. Machine Adapter Pattern

```
                ┌───────────────┐
DesignerState ─►│ designToCutPlan│─► CutPlan (canonical)
                └───────────────┘            │
                                             ▼
                              ┌──────────────────────────┐
                              │  MACHINE_REGISTRY        │
                              │  (id, manufacturer,      │
                              │   category, format,      │
                              │   status, lazy loader)   │
                              └──────────┬───────────────┘
                                         │ load()
                                         ▼
                              ┌──────────────────────────┐
                              │  MachineAdapter.encode() │
                              │   → File / Stream        │
                              └──────────┬───────────────┘
                                         ▼
                              ┌──────────────────────────┐
                              │  Channel: DOWNLOAD / FTP │
                              │  REST / WS / MQTT / OPC  │
                              │  USB_AGENT               │
                              └──────────┬───────────────┘
                                         ▼
                                MachineExport (audit row)
```

- **CutPlan** is the single canonical intermediate — every adapter encodes from CutPlan to a vendor format.
- **Registry is lazy:** `load: () => import('./adapters/<vendor>')` keeps bundle size flat regardless of supported machine count.
- **Status:** `READY | BETA | PLANNED` — adapters can ship as stubs without breaking the UI.
- **READY today:** DXF beam saw, G-Code CNC, Generic CSV, Generic JSON. **Stubs:** Homag (beam saw, BHX, edge bander), Biesse (Selco beam saw, Rover), PDF report.

Files: `skdc/lib/machines/types.ts`, `registry.ts`, `index.ts`, `adapters/*.ts`, `skdc/lib/actions/export.ts`.

---

## 7. i18n Architecture

- **Strategy:** client-side dictionary in `skdc/lib/i18n/translations.ts` (~1,595 lines, three locale objects, ~280 keys each).
- **Provider:** `components/i18n-provider.tsx` holds the locale in React Context; persists to `localStorage`; toggles `<html dir="rtl|ltr">` for Arabic vs. English/Chinese.
- **Lookup:** `<I18nText id="..." />` component or `useI18n().t(...)` hook.
- **Locales:** `ar` (default, RTL), `en` (LTR), `zh` (LTR, Foshan/Shunde factory vocabulary).
- **Future SSR consideration:** today the dictionary is client-bundled, which means landing-page locale is hydrated post-mount. Migrating to `next-intl` (already a dependency) for SSR-resolved locale + per-route message splitting is the planned upgrade.

Files: `skdc/lib/i18n/translations.ts`, `skdc/components/i18n-provider.tsx`, `skdc/components/i18n-text.tsx`, `skdc/components/language-switcher.tsx`.

---

## 8. Theme Architecture

- **Storage:** `localStorage["skdc-theme"]` holds one of `aurora-violet | saudi-emerald | pearl-mono | royal-gold | cyber-cyan`.
- **Application:** on theme select, `document.documentElement.style` is mutated to update CSS custom properties: `--theme-stop-1/2/3`, `--theme-halo`, `--theme-accent`.
- **Consumption:** Tailwind utilities (`text-gradient-aurora`, `text-shine-aurora`, etc.) reference the CSS vars — every themed element reacts instantly, no re-render.
- **Default:** Aurora Violet. SSR hydration writes the saved theme to the document root before first paint to prevent flash.

Files: `skdc/lib/themes.ts`, `skdc/components/theme-provider.tsx`, `skdc/components/theme-switcher.tsx`, `skdc/app/globals.css`.

---

## 9. Deployment Topology

```
┌─────────────────────────────────────────────────────────────┐
│ Railway (skdc-production)                                   │
│ ─ Node 24 LTS runtime                                       │
│ ─ railpack.json build manifest                              │
│ ─ environment: DATABASE_URL, DIRECT_URL, AUTH_SECRET,       │
│   NEXTAUTH_URL, GOOGLE_*, RESEND_API_KEY, …                 │
│ ─ public host: skdc-production.up.railway.app (HTTPS)       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Postgres wire-protocol (TLS)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Supabase (region: ap-southeast-1)                           │
│ ─ Postgres 15                                               │
│ ─ pgBouncer pooler on :6543 (application queries)           │
│ ─ direct connection on :5432 (Prisma migrations / seed)     │
└─────────────────────────────────────────────────────────────┘

       External vendors
       ───────────────
       • Resend          ─ transactional / magic-link email
       • Google OAuth    ─ federated sign-in
       • MCP clients     ─ Claude Desktop, Cursor, custom AI agents
```

Build manifest: `skdc/railpack.json`.
Live URL: https://skdc-production.up.railway.app.
