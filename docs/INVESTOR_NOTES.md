# SKDC — Investor Dossier

> Smart Kitchen Design Cloud — a cloud-native SaaS replacing the SketchUp +
> MHDesign-EG workflow used by kitchen workshops in Saudi Arabia and China.
> Live at https://skdc-production.up.railway.app · 2026-05-13

---

## Problem

Kitchen workshops in Saudi Arabia and China currently design with **SketchUp + MHDesign-EG**, a desktop combo that is:

- **Desktop-bound** — installed per machine, can't be opened from a phone, tablet, or another workshop laptop.
- **English-first** — Arabic and Mandarin support is bolt-on, not native; RTL layout is broken.
- **Single-license** — every designer needs a paid seat; no real-time collaboration; no centralized customer or project database.
- **Disconnected from production.** Doesn't generate cut lists for the workshop's CNC / beam saw / edge bander, doesn't issue VAT-compliant invoices, doesn't track customers.

The result: a typical workshop owner runs **3 to 5 tools** in parallel (SketchUp + MHDesign-EG + Excel for quotes + WhatsApp for customer comms + a separate accounting app for invoices) and reconciles by hand.

---

## Solution

**SKDC unifies design + customer management + invoicing + machine export in one cloud platform.**

- **Browser-based.** No install, no SketchUp dependency, works on any device.
- **Multi-tenant by workshop.** Every workshop is a Workspace with its own customers, projects, materials, templates, and machines. Members are invited with roles (Owner / Admin / Designer / Viewer).
- **2D + 3D in one tool.** Konva canvas for floor-plan drafting, Three.js for procedural 3D presentation to the end customer.
- **35 ready templates** + custom builder, so a kitchen is assembled in minutes, not hours.
- **VAT-compliant invoices.** KSA 15% baked in; multi-VAT engine planned for Q1 2027.
- **Universal machine adapter framework.** One canonical CutPlan, plug-in adapters per machine brand. Four formats READY today (DXF, G-Code, CSV, JSON), 10 more declared with stubs (Homag, Biesse, SCM, Felder, etc.).
- **Three native languages:** Arabic (RTL, default), English, Mandarin Chinese — the Chinese vocabulary sourced from the actual Foshan/Shunde factory floor, not a dictionary.
- **MCP-native.** Any AI agent (Claude Desktop, Cursor, custom) can drive the platform via 6 tools today, with expansion planned.

---

## Market Sizing

### Saudi Arabia

| Indicator | Value | Source |
|---|---|---|
| Vision 2030 housing target | 70% homeownership by 2030 | Saudi Vision 2030 |
| New housing units pipeline | ~300K/yr | Housing Ministry programs |
| Kitchen replacement cycle | 7–10 years | Industry standard |
| Registered carpentry / kitchen workshops (KSA) | ~3,000+ | Ministry of Commerce records |
| Typical workshop monthly revenue | 50K–500K SAR | Field interviews |

KSA is mid-construction-boom: NEOM, ROSHN, Diriyah Gate, and Red Sea projects each commit thousands of residential units with high-spec kitchens. Each delivered unit is a kitchen sale.

### China (Foshan + Shunde focus)

| Indicator | Value | Source |
|---|---|---|
| China cabinet industry annual revenue | ~100B RMB | China Furniture Association |
| Foshan + Shunde cabinet factories | ~1,000+ | District commerce records |
| Average factory annual output | 5,000–50,000 units | Industry surveys |
| Existing software penetration | Low (Excel + AutoCAD common) | Field observations |

Foshan/Shunde is the world's densest cabinet manufacturing cluster. Most factories still quote in Excel and design in AutoCAD or pirated SketchUp. A modern multi-tenant SaaS with native Chinese terminology is unprecedented in this segment.

---

## Competitive Moat

1. **Industry-accurate Chinese terminology.** ~280 i18n keys × 3 locales; Chinese vocabulary uses Foshan/Shunde factory-floor terms (`刨花板`, `封边条`, `铰链`, etc.) rather than translation-engine output. Local factories instantly recognize the language.
2. **Universal machine adapter framework.** No competitor covers 10 machine categories × 14 formats from one canonical CutPlan. Workshops with mixed-brand equipment (Homag + Chinese CNC + local Beam Saw) are exactly our wedge.
3. **MCP-native.** SKDC ships a JSON-RPC 2.0 MCP server today. Any AI agent — Claude Desktop, Cursor, a custom GPT — can already design kitchens, manage customers, and create projects on the platform. No incumbent has this surface.
4. **Arabic-first, Saudi cultural fit.** RTL is native (not bolt-on). Themes include Saudi Emerald and Royal Gold. Default language Arabic. SAR default currency. KSA 15% VAT pre-wired.
5. **Vertical depth without vertical lock-in.** Same engine extends to wardrobes and bathroom vanities (Q4 2026 roadmap) — one platform, multiple cabinet verticals.

---

## Business Model

| Tier | Price | Target |
|---|---|---|
| Workshop | 500 – 2,000 SAR / month | Small-to-medium kitchen workshops; per-seat or flat |
| Enterprise | 5,000 – 15,000 SAR / month | Multi-branch workshops, factories, white-label |
| Per-export pricing | TBD | High-volume customers who export 100+ cut plans/month |
| Marketplace revenue share | TBD (Beyond roadmap) | Template packs from third-party designers |

Pricing is in SAR for the KSA market; CNY-denominated tiers will be introduced when the Chinese market launch starts.

---

## Traction

- **Pre-revenue.** Production deploy is live (https://skdc-production.up.railway.app) and the founder is in conversation with workshops to onboard the first paying tenants.
- **Codebase value (market research benchmark):**
  - Local Saudi market: **~330,000 SAR**
  - US benchmark: **~$265,000 USD**
- **Built fast.** Phases 1 through 14 (foundation through production deploy with MCP) shipped on a compressed timeline using AI-assisted development.
- **Production inventory at the cutover:** 16 pages, 17 Prisma models, 10 server-action modules, 35 seeded templates, 5 themes, 3 locales, 6 MCP tools, 11 machine adapters, 14 declared output formats.

---

## Ask

**TBD by founder.** The founder will define the raise amount, valuation, and use of funds. Likely buckets:

- Sales & onboarding in KSA (initial 50–100 workshops).
- China market entry (localization audit, Foshan/Shunde sales presence).
- Mobile + offline (Q3 2026 roadmap).
- Photo-to-design AI (Q4 2026 roadmap) — vision-model API costs + training data.

---

## Team

- **Khalid Al-Hazmi** — founder, Saudi Arabia. Direct contact with KSA workshops; first-hand knowledge of the MHDesign-EG + SketchUp workflow we are replacing.
- **AI-assisted development.** Engineering velocity is multiplied by Claude-driven implementation under founder oversight. This is the same operating model that delivered 14 production phases on a compressed schedule.

---

## Why Now

- **Vision 2030 + KSA housing boom** are mid-cycle. Workshops that don't modernize their tooling lose bids to those that quote faster with better visuals.
- **AI agents are mainstream in 2026.** MCP-native SaaS is no longer an experiment — it is a competitive feature. SKDC is one of the first vertical SaaS tools shipping with an MCP surface.
- **Chinese cabinet industry consolidation.** Larger Foshan/Shunde factories are upgrading from Excel + AutoCAD to integrated systems; the window to be the default Chinese-language cloud option is open now.
