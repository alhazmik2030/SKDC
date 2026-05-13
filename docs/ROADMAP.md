# SKDC — Roadmap

> Forward-looking plan. Quarters are calendar quarters. Anything beyond Q2 2027 is
> directional and intentionally not date-committed.

---

## Q3 2026 — Mobile + Offline

**Theme:** meet the workshop where it works (the shop floor, often with patchy connectivity).

- **React Native mobile app** for designers and workshop owners. Read-only at launch (view projects, present 3D to a customer, share quote links), then write capability (move units, change materials) by end of quarter.
- **Offline mode for the web app.** Service Worker + IndexedDB cache of the current workspace's templates, materials, customers, and active projects. Designs synced on reconnect with last-write-wins per unit.
- **Tablet-first redesign of the 2D designer** — touch + Apple Pencil / S-Pen support.
- **Reliability:** error monitoring (Sentry), uptime monitoring, automated nightly Postgres snapshots verified by restore-test.

---

## Q4 2026 — Adjacent Verticals + Photo-to-Design

**Theme:** reuse the SaaS platform to capture neighboring product categories.

- **Wardrobes module.** Same engine, new template library (sliding doors, walk-in closet primitives, drawer banks, jewelry inserts).
- **Bathroom vanities module.** Plumbing-aware unit primitives (drain offsets, faucet zones), countertop integration.
- **Photo-to-design AI (computer vision MVP).** Customer uploads a photo of an existing kitchen or a Pinterest reference + room dimensions; pipeline returns an editable 3D design (target accuracy 70–80% at MVP, refined by user feedback loop). Powered by a vision LLM with structured JSON output, matched against the template library via embeddings.
- **MCP tool expansion** to cover invoice generation, machine export, and template clone — bringing the AI surface from 6 to ~12 tools.

---

## Q1 2027 — Internationalization & Factory Integration

**Theme:** make SKDC operational in any market and wire it into real factory equipment.

- **Multi-currency** (SAR, USD, EUR, CNY, AED, EGP) with workspace-level default and per-invoice override.
- **Multi-VAT engine.** Configurable per workspace (KSA 15%, UAE 5%, EU per-country, China 13%, exempt).
- **Chinese factory integration.** Real-time order push from a Saudi workshop's SKDC project to a partnered Foshan / Shunde factory using a typed JSON contract and webhook acknowledgements.
- **Direct machine channels go live.** Promote REST_API and FTP_UPLOAD adapters from "declared" to "READY" (starting with the most common Chinese CNC routers and Homag beam saws).
- **Expanded MCP tools** including `generate_invoice`, `export_to_machine`, `apply_template_pack` — unlocking full automation flows where an AI agent can take a project from blank to cut-ready.

---

## Q2 2027 — Enterprise + Photorealism

**Theme:** capture the enterprise segment and lift visual quality to closing-deal level.

- **White-label option.** Enterprise workshops can run SKDC under their own subdomain, logo, and theme palette. Includes per-tenant template libraries and shared materials catalogs.
- **Advanced 3D rendering.** Path-traced "V-Ray-style" output for hero shots and customer presentations. Likely a background-job render farm with a credits model; real-time viewport remains rasterized.
- **SSO (SAML / OIDC)** for enterprise teams.
- **Audit log surface** in the UI (Settings → Activity) over what is already logged server-side.
- **Granular role permissions** beyond the four enum values (per-module access, approval workflows).

---

## Beyond — Marketplace & AI Co-Designer

> Directional only; not date-committed.

- **Marketplace** for designer-built template packs and material libraries. Workshops buy, sell, or share. Revenue share with creators.
- **AI design assistant** ("design my kitchen for me") — natural-language brief in, complete editable design out, leveraging both the MCP tool surface and the photo-to-design pipeline.
- **AR preview** — customer points a phone at their actual kitchen space and sees the SKDC design overlaid in place.
- **Procurement integration** — auto-generated bill of materials with one-click ordering from preferred suppliers.
- **Embedded analytics** — workshop owner sees conversion rate from design → invoice → paid, time-per-design trends, most-used templates, material waste percentages.
