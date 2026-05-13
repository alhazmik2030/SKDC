# SKDC — Tasks Completed

> Smart Kitchen Design Cloud (SKDC) — a cloud-native SaaS for kitchen workshops.
> Live at https://skdc-production.up.railway.app
> Phase-by-phase log of what is shipped in production as of 2026-05-13.

---

## Phase 1 — Foundation

**What:** Next.js 16 (App Router) + TypeScript + Tailwind v4 project on Prisma + PostgreSQL (Supabase) with NextAuth v5 wired in.

**Why:** Establish a production-grade SaaS skeleton (server actions, RSC, edge-ready middleware) so every later phase plugs in without rewrites.

**Key files:**
- `skdc/package.json` (Next 16.2.6, React 19.2.4, Prisma 6, NextAuth 5 beta, Tailwind v4)
- `skdc/prisma/schema.prisma` (initial models)
- `skdc/lib/db.ts`, `skdc/lib/auth.ts`, `skdc/lib/auth.config.ts`
- `skdc/middleware.ts` (dashboard route protection)

---

## Phase 2 — Premium Landing

**What:** Marketing landing page with hero, animated aurora gradients, Lenis smooth scroll, and feature panels, all in three languages.

**Why:** SaaS conversion requires a landing that signals quality before sign-up — workshops evaluate tools in seconds.

**Key files:**
- `skdc/app/page.tsx`
- `skdc/components/effects/` (motion + aurora)
- `skdc/app/globals.css` (theme CSS variables)

---

## Phase 3 — Auth Flow

**What:** Email + password sign-up, magic-link sign-in via Resend, Google OAuth, JWT session strategy, automatic workspace bootstrap on first sign-in.

**Why:** Multi-tenancy is the core SaaS primitive — every user must land in their own workspace with zero manual setup.

**Key files:**
- `skdc/app/(auth)/sign-in/page.tsx`, `sign-up/page.tsx`, `verify-request/page.tsx`
- `skdc/lib/auth.ts` (NextAuth handler + `events.createUser` workspace bootstrap)
- `skdc/lib/auth-helpers.ts` (`getCurrentWorkspace`, `requireWorkspaceId`)
- `skdc/lib/actions/register.ts`
- `skdc/app/api/auth/[...nextauth]/route.ts`

---

## Phase 4 — Dashboard Shell

**What:** Authenticated dashboard layout with sidebar, top bar, user menu, language switcher (AR/EN/ZH), theme switcher modal, and KPI home page reading live stats from the database.

**Why:** Workshop owners need a single, opinionated cockpit — the shell is what makes the product feel "real" vs. a prototype.

**Key files:**
- `skdc/app/dashboard/layout.tsx`
- `skdc/app/dashboard/page.tsx`
- `skdc/components/dashboard/`
- `skdc/components/language-switcher.tsx`
- `skdc/components/theme-switcher.tsx`
- `skdc/lib/actions/dashboard-stats.ts`

---

## Phase 5 — Five CRUD Modules

**What:** Full create / read / update / delete (with react-hook-form + zod validation, server actions, dialog UI) for **Customers**, **Materials**, **Projects**, **Templates**, **Machines**.

**Why:** These five entities are the entire data model a workshop touches daily — without them, the design tools are toys.

**Key files:**
- `skdc/lib/actions/customers.ts`, `materials.ts`, `projects.ts`, `templates.ts`, `machines.ts`
- `skdc/components/customers/`, `materials/`, `projects/`, `templates/`, `machines/`
- `skdc/app/dashboard/customers/page.tsx`, `materials/page.tsx`, `projects/page.tsx`, `templates/page.tsx`

---

## Phase 6 — 35 Global Templates + Custom Builder

**What:** 35 kitchen unit templates seeded as global defaults (lower / upper / corner / tall / drawer / appliance / accessory) plus a four-step custom template builder wizard (name & category → dimensions with live preview → options → save).

**Why:** Templates are the speed multiplier — a workshop assembles a kitchen by composing templates, not by drawing from scratch.

**Key files:**
- `skdc/lib/seed-data.ts` (template definitions)
- `skdc/prisma/seed.ts`
- `skdc/app/dashboard/templates/new/page.tsx`
- `skdc/components/templates/templates-grid.tsx`

---

## Phase 7 — 2D Designer

**What:** Konva-based 2D canvas with template palette (left), draggable units with 10mm snap, room outline, undo/redo (50 steps), an inspector panel (dimensions / position / rotation / delete), and JSON design persistence.

**Why:** 2D is the entry point — every workshop already thinks in floor plans, so this is the friction-free first design surface.

**Key files:**
- `skdc/app/dashboard/projects/[id]/designer/page.tsx`
- `skdc/components/designer/canvas-2d.tsx`, `designer-shell.tsx`, `template-palette.tsx`, `inspector.tsx`, `room-shape-picker.tsx`, `types.ts`
- `skdc/lib/designer/room-shapes.ts`

---

## Phase 8 — 3D Designer

**What:** Three.js + React Three Fiber procedural cabinets, doors, drawers, LED grooves, and glass with tint/finish — all generated from the same Unit data structure as 2D. Room scene primitives (walls, floor, window placeholders).

**Why:** 3D sells the kitchen to the end customer. Procedural (vs. asset-based) means infinite size variations with zero asset library to maintain.

**Key files:**
- `skdc/app/dashboard/projects/[id]/3d/page.tsx`
- `skdc/components/designer3d/designer3d-shell.tsx`, `scene.tsx`, `room-scene.tsx`, `unit-3d.tsx`

---

## Phase 9 — Invoice Generator

**What:** Invoice generation from a project: line items per unit, KSA 15% VAT, SAR currency default, human-readable invoice numbers, A4 print-ready layout.

**Why:** KSA workshops are required to issue tax invoices; bundling this in removes their dependence on separate accounting tools.

**Key files:**
- `skdc/app/dashboard/invoices/[id]/page.tsx`
- `skdc/lib/actions/invoices.ts`
- `skdc/components/invoices/print-button.tsx`
- `Invoice` model in `skdc/prisma/schema.prisma`

---

## Phase 10 — Machine Adapters

**What:** Universal adapter pattern: 10 machine categories (BEAM_SAW, PANEL_SAW, CNC_ROUTER, NESTING_CNC, EDGE_BANDER, DRILLING_MACHINE, BORING_MACHINE, MEMBRANE_PRESS, POSTFORMING, MULTI_FUNCTION) and 14 output formats (DXF, DWG, GCODE, WOODWOP_MPR, BIESSE_BPP/CIX, SCM_XXL, FELDER_PRO, HOMAG_BHX, ARDIS_OPTIMIZER, OPTIMIK, CSV, JSON, PDF_REPORT). Four adapters READY today: DXF, G-Code, CSV, JSON. Seven channels declared (FILE_DOWNLOAD, FTP, REST, WebSocket, MQTT, OPC-UA, USB_AGENT). Every export logged in `MachineExport` for audit.

**Why:** Workshops own a chaotic mix of machine brands. A canonical `CutPlan` + plug-in adapter is the moat — no competitor covers all brands.

**Key files:**
- `skdc/lib/machines/types.ts`, `registry.ts`, `index.ts`
- `skdc/lib/machines/adapters/dxf-beamsaw.ts`, `gcode-cnc.ts`, `generic-csv.ts`, `generic-json.ts`
- `skdc/lib/machines/adapters/homag-beamsaw.ts`, `biesse-beamsaw.ts`, `biesse-rover.ts`, `homag-bhx.ts`, `homag-edgebander.ts`, `pdf-report.ts` (stubs)
- `skdc/lib/actions/export.ts` (`designToCutPlan` + `generateExport`)

---

## Phase 11 — i18n (3 Languages)

**What:** Client-side dictionary with ~280 translation keys across Arabic (RTL, default), English, and Mandarin Chinese. Chinese uses industry-accurate Foshan/Shunde factory vocabulary (not Google-translate output). Document `dir` attribute switches with locale.

**Why:** Saudi workshops need Arabic-first; Chinese factories need terminology that matches the production-line vocabulary, not generic dictionary words.

**Key files:**
- `skdc/lib/i18n/translations.ts` (~1,595 lines, three locale objects)
- `skdc/components/i18n-provider.tsx`, `i18n-text.tsx`
- `skdc/components/language-switcher.tsx`

---

## Phase 12 — Five-Theme System

**What:** Runtime-swappable themes — **Aurora Violet** (default), **Saudi Emerald**, **Pearl Mono**, **Royal Gold**, **Cyber Cyan** — driven by CSS custom properties on `document.documentElement` with `localStorage` persistence. No reload, no rerender.

**Why:** Aesthetics drive adoption among small business owners in the Gulf; the Saudi Emerald and Royal Gold variants speak directly to local taste.

**Key files:**
- `skdc/lib/themes.ts` (theme definitions)
- `skdc/components/theme-provider.tsx` (Context + localStorage)
- `skdc/components/theme-switcher.tsx` (picker modal)
- `skdc/app/globals.css` (CSS variable contract)

---

## Phase 13 — MCP API Server

**What:** `/api/mcp` route implementing JSON-RPC 2.0 with `initialize`, `tools/list`, `tools/call`, batch support, and **Bearer token auth** (SHA-256 hashed, plaintext shown once). Six tools exposed: `list_templates`, `list_customers`, `list_projects`, `create_customer`, `create_project`, `add_unit_to_project`. UI for token management in Settings.

**Why:** SKDC is MCP-native — any Claude / Cursor / AI client can drive the platform. No competitor in this market offers a programmable surface.

**Key files:**
- `skdc/app/api/mcp/route.ts`
- `skdc/lib/mcp/skdc-tools.ts`
- `skdc/lib/api-tokens.ts`
- `skdc/lib/actions/api-tokens.ts`
- `skdc/components/api/api-tokens-card.tsx`

---

## Phase 14 — Railway Production Deployment

**What:** Production deploy on Railway with `railpack.json`, PostgreSQL connection via Supabase pooler + direct URL, `trustHost: true` for `*.up.railway.app`, environment variables managed in Railway dashboard.

**Why:** A live URL accelerates investor and customer conversations from "show me" to "let me try it".

**Key files:**
- `skdc/railpack.json`
- `skdc/next.config.ts`
- Live: https://skdc-production.up.railway.app

---

## Recent Fixes & Polish

- **Designer entry bug** — direct deep-link to `/dashboard/projects/[id]/designer` now resolves project + design correctly.
- **Material dropdown** — material-type select now respects GLASS variant with tint/finish metadata.
- **Theme propagation** — theme CSS variables now apply on the document root before first paint to prevent flash.
- **Full i18n coverage** — every dashboard string routed through the dictionary; ~280 keys × 3 locales.
- **Room scene primitives** — 3D walls, floor, and window placeholders aligned with project `roomWidth/Depth/Height`.
- **Template 3D preview** — templates render in 3D using the same procedural pipeline as live units.
- **Mobile responsive audit** — sidebar collapses to drawer, designer canvas reflows, inspector becomes bottom sheet on small screens.
- **Three example kitchens seed** — `skdc/components/example-kitchens.ts` ships three reference projects for new workspaces.

---

## Production Inventory (Snapshot)

| Metric | Value |
|---|---|
| Next.js pages | 16 |
| API routes | 2 (`/api/auth/*`, `/api/mcp`) |
| Prisma models | 17 (Auth + Domain + Machines) |
| Server actions modules | 10 (`lib/actions/*`) |
| Machine adapters | 11 (4 READY, 7 stubs) |
| Machine output formats | 14 |
| Machine channels | 7 |
| Global templates seeded | 35 |
| i18n keys | ~280 per locale |
| Themes | 5 |
| MCP tools | 6 |
| Locales | 3 (ar default RTL, en, zh) |
