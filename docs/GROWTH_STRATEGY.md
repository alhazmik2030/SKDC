# SKDC Growth Strategy & AI Roadmap

> Strategic playbook for becoming the universal layer of kitchen design — from sketch to factory floor.
>
> Owner: Khalid Al-Hazmi (Founder)
> Last updated: 2026-05-13
> Status: Living document — revise quarterly.

---

## Table of Contents

1. [Vision: SKDC as the #1 Reference for Kitchen Designers](#vision)
2. [Geographic Expansion (Phase-gated)](#expansion)
3. [Go-to-Market Tactics](#gtm)
4. [How We Become the #1 Reference](#number-one)
5. [AI Roadmap — From Tool to Autonomous Agent](#ai-roadmap)
6. [Monetization Evolution](#monetization)
7. [5-Year Financial Outlook](#financials)
8. [Risks & Open Questions](#risks)

---

<a id="vision"></a>
## 🎯 Vision: SKDC as the #1 Reference for Kitchen Designers

**Just as Figma became the universal layer where every UI/UX decision happens, SKDC becomes the universal layer where every kitchen design decision happens — from sketch, to cut list, to factory floor.** A designer in Riyadh, a workshop owner in Jeddah, a factory floor manager in Foshan, and a homeowner in Dubai will all open the same browser tab and see the same project — each at their own role-appropriate level of detail, in their own language, with their own currency and tax rules pre-wired.

SketchUp and its plugin ecosystem (including MHDesign-EG) are stuck in a 2010 mental model: desktop-installed, English-first, single-license, file-based. They were built when "the file" was the unit of collaboration. SKDC is built for a world where **the project URL is the unit of collaboration** — every stakeholder lives on the same shared object, in real time.

We can win the position SketchUp couldn't because:

1. **Web-native.** No install, no Windows-only headaches, no "I can't open your file because I don't have plugin X v3.2." Runs on a Chromebook, an iPad, a factory tablet. Instantly shareable via URL.
2. **Multi-tenant by design.** Designers, workshops, factories, and end customers all live inside the same data model — not separate exported files emailed between them. Every cut list traces back to the project that created it.
3. **AI-native, not AI-retrofitted.** We shipped an MCP server with the v1.0 product. Claude, Cursor, and any agentic client can drive SKDC from day one. Competitors are still figuring out where to bolt their "ChatGPT button."
4. **Industry-localized at the vocabulary level.** Arabic-first (RTL primary), with Foshan/Shunde factory Chinese terminology baked in (橱柜, 板材, 开料单, 多排钻, 阻尼铰链). Generic translation tools cannot replicate this — it requires domain knowledge we have and global SaaS competitors do not.
5. **Business workflow integrated end-to-end.** Design → quote → invoice (KSA 15% VAT compliant) → cut list → factory dispatch. No "export to Excel, import to QuickBooks, email the workshop" chain. One platform, one source of truth.

The goal of every decision in the next 24 months is to reinforce this positioning: **the project URL is the universal artifact**, and SKDC is the operating system underneath it.

---

<a id="expansion"></a>
## 🌍 Geographic Expansion (Phase-gated)

Expansion is gated by clear go/no-go ARR milestones. We do not enter Phase N+1 until Phase N hits its retention and ARR floor. This prevents the classic SaaS trap of premature internationalization burning cash before product-market fit is proven.

### Phase 1: Saudi Beachhead (Q3 2026 → Q1 2027)

- **Target:** 30 paying workshops across Riyadh + Jeddah + Khobar.
- **ACV:** 9,600 SAR/year (800 SAR/month average, Workshop Pro tier).
- **ARR target end of phase:** ~290K SAR.
- **Sales motion:** founder-led, direct outreach to workshop owners. Khalid personally closes the first 30 accounts. No SDR team yet — founder-led sales gives us the customer signal needed for product iteration.
- **Anchor event:** INDEX Saudi (Riyadh, October 2026) — booth + live demo.
- **Localization already done:** Arabic-first UI, RTL layout, KSA 15% VAT invoice generator, Hijri/Gregorian calendar, IBAN payment fields, ZATCA-compatible invoice format.
- **Go/no-go to Phase 2:** ≥25 paying customers retained for ≥3 months AND NPS ≥40.

### Phase 2: GCC Expansion (Q2 → Q4 2027)

- **Target geographies:** UAE (Dubai + Sharjah workshops first), then Kuwait, Qatar, Bahrain.
- **ACV:** 4,000 AED/year (~$1,090, ~4,080 SAR) for Pro tier.
- **ARR target end of phase:** ~1.5M SAR cumulative.
- **Localization deltas vs Saudi:** Arabic UI is shared; pricing switches to AED/USD; KSA 15% VAT → UAE 5% VAT; Emirates ID validation patterns; UAE Federal Tax Authority compliance for invoices.
- **Sales motion:** still founder-led but augmented by 1 sales rep based in Dubai (commission-heavy comp).
- **Anchor event:** Dubai INDEX (May 2027).
- **Go/no-go to Phase 3:** ≥150 GCC customers AND gross margin ≥75%.

### Phase 3: China Entry (Q1 2028) — the strategic moat

This is the most defensible phase and the hardest. Most western SaaS fails in China. We have an unusual advantage: the founder built SKDC with Foshan/Shunde factory vocabulary in mind from day one, and we have industry-accurate Chinese already shipped in the product (not Google-translated).

- **Target:** Foshan / Shunde / Zhongshan custom-kitchen factories (~1,000+ qualified targets in the Greater Bay Area).
- **ACV:** 12,000 RMB/year (~6,200 SAR) for AI tier; 60,000 RMB/year (~31K SAR) for Factory Enterprise.
- **ARR target:** 5M+ RMB once 100 factories sign (achievable within 18 months of entry if PMF holds).
- **Why we win here:**
  - Industry-accurate Chinese terminology (橱柜 = cabinet, 板材 = panels, 开料单 = cut list, 多排钻 = multi-row drill, 阻尼铰链 = soft-close hinge, 抽屉滑轨 = drawer slide) — a translated western product cannot pass the "10-second credibility test" with a factory engineer.
  - 14 machine post-processor formats already supported, including formats common in Guangdong factories.
  - Multi-language by design — bilingual quotes/cut lists are a feature, not an afterthought.
- **Sales motion:** distributor partnership in Guangdong. We do NOT try to hire and manage Chinese sales staff directly from Riyadh. We sign a regional distributor who knows the factories personally, give them 30% rev share for the first 2 years, and let them open doors.
- **Anchor event:** China International Furniture Fair (CIFF), Guangzhou, March 2028.
- **Go/no-go to Phase 4:** ≥50 paying factories AND ≥1 large factory (>200 staff) as a flagship case study.

### Phase 4: Global SMB (Q3 2028+)

- **Geographies:** US Pacific Northwest first (high concentration of custom cabinet shops), then EU (Germany + Italy + Spain).
- **ACV:** ~$5,000/year for Pro, ~$15,000/year for AI tier.
- **Localization:** full English (done), then Spanish, French, German, Italian.
- **Sales motion:** product-led growth (free tier funnel) + outbound to mid-market shops. Self-serve dominant.
- **This is the speculative phase.** We do not commit resources here until Phases 1-3 are profitable.

---

<a id="gtm"></a>
## 📣 Go-to-Market Tactics

Each market has a different mix. The order of channels below reflects expected ROI (best first).

### Saudi Arabia

1. **Cabinet & Kitchen exhibitions** — INDEX Saudi, Cityscape Riyadh. Budget: ~50K SAR per booth (10 sqm, basic build-out, brochures, hardware demos). Target ROI per show: ~10 signed leads, ~3 closed customers within 90 days. CAC per customer from exhibitions: ~16K SAR — high, but offset by 2-3 year LTV.
2. **Founder-led direct outreach** — Khalid personally reaches ~200 known workshops via WhatsApp + LinkedIn. Expected funnel: 90% open rate (because Arabic and personalized), 30% reply, 10% book a demo, 5% paid trial, 3-4% close. This is the highest-quality channel in Phase 1 and has near-zero monetary cost — only founder time.
3. **YouTube tutorials in Arabic** — "صمم مطبخ احترافي في 15 دقيقة" (Design a professional kitchen in 15 minutes), "كيف تطلع قائمة قص لمصنعك" (How to generate a cut list for your factory). Captures search intent. Target: 50 videos by end of Phase 1, 10K subscribers, ~5% conversion to free trial.
4. **Saudi Interior Designers Association partnership** — sponsorship + featured workshops. Lower direct conversion, high brand-credibility ROI.
5. **Referral program** — 30% off the next month for every new paid customer referred. 3-tier (referrer gets 30%, referee gets 20% off month 1, both get bonus templates). Designed to be word-of-mouth-native — workshop owners already talk to each other.

### China

1. **Foshan/Shunde distributor partnership** — non-negotiable. Local sales agent + Mandarin support. 30% rev share, 2-year exclusive for the Greater Bay Area.
2. **WeChat Official Account** — content marketing in Chinese. Mini-program embed for live demos. Critical because LinkedIn/Twitter do not work in China.
3. **CIFF Guangzhou** — China International Furniture Fair. Booth + co-branded with distributor. Budget: ~$15K booth + travel. Target: 50 factory leads per show.
4. **Alibaba B2B presence** — listing for international factory buyers searching for design-software partners.
5. **Baidu SEO** — Chinese-language content targeting "橱柜设计软件" and similar queries.

### International (Phase 4)

1. **SEO-driven content** — target "kitchen design software," "cabinet design software," "cut list generator," "Biesse post-processor."
2. **Product Hunt launch** — coordinated with a major feature drop (e.g. Level 4 text-to-design GA).
3. **Designer Twitter/X + Reddit (r/woodworking, r/cabinetmaking)** — community-led growth.
4. **Open-source ecosystem play** — publish `@skdc/sdk` and our MCP server tooling. Get featured in Anthropic's MCP gallery and Cursor's integrations directory. Every Claude user becomes a potential SKDC user.

---

<a id="number-one"></a>
## 🏆 How We Become the #1 Reference

Five pillars. Each pillar has a near-term action that is measurable and time-boxed.

### Pillar 1: Industry Standard Templates

The template library is the product's center of gravity. A designer who finds "their" workflow encoded in a SKDC template stops looking elsewhere.

- **Today:** 35 curated templates.
- **Q4 2026 target:** 200+ templates, organized by region.
- **Regional standards:**
  - KSA modules: 60×72×58 cm base, 30/40/50/60/80/100 cm widths.
  - China modules: 60×72×60 cm, with 35/40/45/50/60/80/90 cm widths.
  - EU modules: 60×72×60 cm (DIN 68901 / 68930).
  - US modules: 24×34×24 inch + face-frame variants.
- **Designer marketplace** (Q2 2027): top designers contribute templates and earn royalties (70% to designer, 30% to SKDC, with quality gating). This is the supply side of a future two-sided network — analogous to Figma Community.

### Pillar 2: Universal Machine Integration

If we are the #1 reference, then no matter which CNC the factory runs, our cut list works.

- **Today:** 14 post-processor formats.
- **Target by Q2 2027:** all major brands — Biesse (BPP, CIX), Homag (BHX, MPR), SCM (XXL), Felder (Pro, F4), Ardis (Optimizer), Microvellum, CabinetVision, Polyboard.
- **Public promise:** "If your machine isn't supported, we add it free within 30 days." Drives word-of-mouth and removes the #1 objection from factory buyers.

### Pillar 3: Standards Body Participation

Credibility compounds. Being cited by a standards body shortcuts months of trust-building.

- Submit to AWMAC (Architectural Woodwork Manufacturers Association of Canada).
- Join AWI (Architectural Woodwork Institute, USA).
- Pursue Saudi Standards (SASO) recognition for cabinet sizing.
- Pursue Chinese national standard GB/T 3324 alignment certification.

### Pillar 4: Education & Certification

We do not just sell software — we train the next generation of designers to design our way.

- **Certified SKDC Designer course** — Arabic-first, then Chinese. 8-week curriculum. Passing the cert earns a public profile badge and listing on the SKDC directory.
- **Bilingual YouTube channel** — 50+ tutorials by Q4 2026 (Arabic + English). Mandarin channel begins Q1 2028.
- **Annual SKDC Design Awards** — recognition drives word-of-mouth and gives us a press cycle each year. Categories: Best Residential, Best Commercial, Best AI-Generated, Best Student.

### Pillar 5: Open Ecosystem

The position we want is not "the best app" — it is "the platform everyone else builds on."

- Public MCP API + npm package — Claude, Cursor, and any agentic client can drive SKDC out of the box.
- Designer SDK in JavaScript (`@skdc/sdk`) for headless workflows — agencies and integrators build custom flows on top.
- Webhooks for factory integration (production stage transitions, invoice events, low-stock alerts).
- Public Postman collection + OpenAPI spec.

---

<a id="ai-roadmap"></a>
## 🤖 AI Roadmap — From Tool to Autonomous Agent

Five evolution levels. Each level subsumes the previous. Each level is shippable independently and monetizable independently.

### Level 1: AI-Assisted (Today — DONE ✅)

- MCP server is live with 6 tools: `list_templates`, `list_customers`, `create_project`, `list_projects`, `add_project_unit`, `generate_invoice`.
- JSON-RPC 2.0, Bearer-token auth, multi-tenant scoped.
- Claude / Cursor / any agentic client can drive SKDC today.
- **Use case (live):** designer asks Claude *"create a new project for محمد العتيبي with a 4×3m room and add 6 base units from the modern template"* → Claude calls MCP → project appears in SKDC.
- **Monetized via:** Workshop Pro tier and above.

### Level 2: AI-Suggested Designs (Q4 2026)

- New MCP tool: `suggest_layout(roomShape, dimensions, style, budget)` returns an array of unit placements.
- Algorithm: heuristic-based greedy module packing + budget constraint solver. Not yet an LLM — deterministic, fast, explainable.
- UI: "✨ Suggest layout" button in the designer canvas. The user can accept, reject, or partially keep the suggestion.
- Ship target: end Q4 2026. Workshop AI tier includes this.

### Level 3: AI-Generated Designs from Photos (Q1 2027)

The founder explicitly requested this:

> "يدعم رفع الصورة لتحويلها الى تصميم مباشر قابل للتعديل بنسبة بسيطة 5%"

Goal: a workshop receives a customer photo of their existing or aspirational kitchen → upload to SKDC → editable 3D project appears, 95% accurate, user refines the remaining 5%.

- New endpoint: `POST /api/ai/photo-to-design`, accepts an image (or multiple — wall A, wall B, plan view).
- Pipeline:
  1. **Detection** — GroundingDINO + SAM2 to segment cabinets, drawers, appliances, countertops.
  2. **Classification** — CLIP-based zero-shot for "base cabinet vs wall cabinet vs tall cabinet vs island."
  3. **Dimension estimation** — monocular depth (DepthAnything v2) + appliance-as-scale-reference (standard fridge widths are known).
  4. **Project synthesis** — assemble detected modules into a SKDC project using existing template metadata.
- Target accuracy: 80%+ at MVP, 95% by end of 2027 (the founder's target).
- Monetized via Workshop AI tier (1,500 SAR/month).

### Level 4: AI-Generated Designs from Text Brief (Q3 2027)

A user types a brief and SKDC produces a complete, priced, manufacturable project within 30 seconds.

- Example input: *"صمم لي مطبخ 4×3 متر بستايل عصري لزوجين شباب، ميزانية 30 ألف ريال، مع جزيرة في المنتصف."*
  ("Design me a 4×3m modern kitchen for a young couple, 30K SAR budget, with a central island.")
- AI orchestration stack:
  - **LLM tool router** (Claude or equivalent) parses the brief into structured fields: room shape, dimensions, style, budget ceiling, special features.
  - **Template selector** queries SKDC's template catalog with the style+region filter.
  - **Layout solver** — CSP solver (constraint satisfaction) places units optimally given room shape + work-triangle ergonomics + island constraint.
  - **Material picker** — constrained optimization stays within budget while maximizing quality score; respects workshop's price list.
  - **Invoice + cut list generation** — uses the already-built Level 1 MCP tools.
- Output: full project ready for review in 30 seconds, including 3D preview, itemized quote, and cut list.
- Built on top of Level 2 (layout solver) + Level 3 (vision, optional sketch input) + LLM orchestration.

### Level 5: Autonomous Design + Production (Q4 2027)

This is the founder's stated end-state vision:

> "يستلم مشاريع بمقاسات وينفذ ويسلم"
> ("Receives projects with dimensions, executes them, and delivers.")

End-to-end autonomous workflow with the workshop owner only intervening at curated checkpoints:

1. **Receive** — customer submits a brief via the workshop's public web form (text and/or photos).
2. **Design** — AI generates the full project (Level 4 pipeline).
3. **Quote** — AI calculates the invoice using the workshop's stored material prices + configured margins + 15% VAT (KSA) or local equivalent.
4. **Approve** — SMS / WhatsApp sent to the customer with a 3D preview link and one-tap approval button.
5. **Execute** — cut plan auto-dispatched to the workshop's machines via the Machine Adapter Framework (already built — Biesse, Homag, SCM formats supported today).
6. **Track** — production timeline auto-updates as the workshop signals stage transitions (or as the machines themselves emit completion events, where instrumentation exists). Customer gets WhatsApp notifications at each milestone.
7. **Deliver** — installation scheduled via calendar integration; final invoice/receipt issued automatically.

**Workshop owner only intervenes for:** out-of-budget designs requiring trade-off discussion, material substitutions due to stock-outs, unusual room shapes the CSP solver flags as low-confidence, and customer disputes.

**Why we can credibly build this:** the foundational systems are already shipped. Multi-tenant DB ✅, MCP API ✅, machine adapter framework with 14 formats ✅, invoice generator with KSA VAT ✅. Levels 2-5 are AI layers built ON TOP of an already-functional product — not a from-scratch moonshot.

---

<a id="monetization"></a>
## 💰 Monetization Evolution

Pricing tiers are stapled to AI capability levels. The price ceiling rises as autonomy rises.

| Tier | AI Level | Capabilities | Price (SAR/month) |
|---|---|---|---|
| **Workshop Free** | L1 | Basic CRUD, manual design, manual invoice, 1 user | 0 |
| **Workshop Pro** | L1+L2 | + Suggest Layout, unlimited templates, invoice generation, 3 users | 800 |
| **Workshop AI** | L3+L4 | + Photo-to-design, text-to-design, 10 users | 1,500 |
| **Workshop Autonomous** | L5 | + End-to-end AI delivery, machine API, WhatsApp/SMS integration, unlimited users | 5,000 (or 2% of project value rev-share) |
| **Factory Enterprise** | L5 | Workshop Autonomous + multi-language UI for staff + bulk seats + dedicated support + custom post-processors | 15,000 (China: ~30,000 RMB) |

Annual prepay discount: 2 months free (16% effective discount). This drives cash flow.

The free tier exists to make SKDC the default tool taught in design schools and used by individual designers before they have a shop. Funnel: free designer → joins a workshop → workshop upgrades to Pro to collaborate with them → Pro upgrades to AI to differentiate vs. competitors → AI upgrades to Autonomous to scale beyond owner-capacity bottleneck.

---

<a id="financials"></a>
## 📊 5-Year Financial Outlook (Illustrative — not commitments)

| Year | Saudi Pro | Saudi AI | GCC (mixed) | China (mixed) | Total ARR (SAR) |
|---|---|---|---|---|---|
| 2026 | 30 × 9.6K | 5 × 18K | – | – | ~378K |
| 2027 | 100 × 9.6K | 30 × 18K | 50 × 13K | 10 × 25K | ~2.4M |
| 2028 | 200 × 9.6K | 100 × 18K | 150 × 13K | 100 × 25K | ~8.2M |
| 2029 | 300 × 9.6K | 200 × 18K | 300 × 13K | 300 × 25K | ~17.5M |
| 2030 | 400 × 9.6K | 350 × 18K | 500 × 13K | 600 × 25K | ~31.7M |

> **Caveat.** This is an illustrative projection used to size the opportunity and stress-test resource allocation. Actual outcomes depend on execution, market adoption, regulatory changes, competitive response, FX movement, and macroeconomic conditions in the target geographies. Investors and stakeholders should treat these numbers as scenarios, not commitments.

Implied gross margins at scale: 78-82% (typical SaaS), with AI inference cost being the main variable that pulls margin down at Levels 3-5 — partially offset by higher ACV at those tiers.

---

<a id="risks"></a>
## ⚠️ Risks & Open Questions (for founder to confirm)

The growth plan above assumes the following — each is a place where Khalid should confirm or correct the assumption:

1. **Distributor model for China.** We assume a 30% rev-share with a Guangdong distributor is acceptable to preserve unit economics. If Khalid prefers direct-China hiring instead, Phase 3 economics and timeline need a full re-model.
2. **Workshop ACV of 800 SAR/month.** This is based on willingness-to-pay benchmarks against alternatives (SketchUp Pro ~1,400 SAR/year + MHDesign-EG ~2,000 SAR/year, combined ~3,400 SAR/year ≈ 285 SAR/month). Our 800 SAR/month implies we deliver ~3× the perceived value. To be validated with the first 10 paying customers in Phase 1.
3. **Level 3 photo-to-design 95% accuracy by end-2027.** This is aggressive. Computer vision for cluttered real-world kitchens (lighting, occlusion, mixed materials) is hard. The founder's stated target is 5% manual refinement — we should plan for 80% MVP and iterate. Worth confirming the threshold below which Level 3 is "unacceptable" vs "useful with caveats."
4. **Founder bandwidth in Phase 1.** Founder-led sales is the right motion for the first 30 customers, but it competes with engineering time. Khalid should plan time allocation explicitly — e.g. 60% engineering / 30% sales / 10% admin during Phase 1.
5. **Marketplace royalty split (70/30).** Pillar 1's designer marketplace assumes a 70% designer / 30% SKDC split. This is consistent with comparable platforms (Figma Community is free; Unity Asset Store is 70/30; Canva is opaque but ~50/50 effectively). To validate with the first 5 contributor designers before public launch.
6. **VAT / regulatory burden in China.** We have not yet researched the full tax compliance stack for invoicing inside China (fapiao 发票 system). Phase 3 requires a tax/legal consultant on retainer before launch. Flag for Khalid: budget ~50K RMB/year for compliance consulting.
7. **AI inference cost at Level 4-5.** A single Level 4 text-to-design run touches an LLM + a vision model + a solver. Estimated marginal cost per project: $0.20-$0.80 depending on model choice. Sustainable at the Workshop AI tier price (1,500 SAR/month, ~$400) — but only if a customer generates fewer than ~500 projects/month. Need to add usage caps or fair-use policy to the tier definition.

---

## Appendix: Source Documents

- `docs/PLAN.md` — the master technical + product plan.
- `docs/ROADMAP.md` — feature roadmap by quarter.
- `docs/INVESTOR_NOTES.md` — financial and fundraising context.
- `docs/ARCHITECTURE.md` — system architecture (multi-tenant, MCP, machine adapters).
- `docs/SECURITY.md` — security and compliance posture.
- `docs/TASKS_COMPLETED.md` — what has shipped to date.

This document supersedes any prior informal growth notes. Revise quarterly at sprint planning.
