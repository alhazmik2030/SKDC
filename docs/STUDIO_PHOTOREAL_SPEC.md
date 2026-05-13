# Studio Photoreal Spec

## 1. The Problem

The founder's exact words after the first Studio preview:

> "كخامات قوالب حسيت انها كرتونيه مو واقعيه"

Translation: the template materials feel cartoonish, not real. This is the single biggest blocker to converting a Studio preview into a signed quote. A customer who is about to commit 30,000–80,000 SAR on a kitchen needs to *believe* the 3D render. Flat-shaded boxes with solid colors look like a children's game. They do not look like the kitchen that will be installed in their home.

The "cartoonish vs photoreal" gap is not one problem — it is a stack of missing realism cues, each small on its own, but compounding. Real wood has grain and clearcoat. Real marble has veins. Real chrome reflects the room. Real corners are never perfectly sharp. Real rooms have soft contact shadows under every cabinet. Real windows bleed warm light. Our current scene has none of these. This document specifies the four-layer upgrade that closes the gap — all running on the customer's GPU, at zero infrastructure cost to SKDC.

## 2. The Photoreal Stack (4 Layers)

Realism is not one toggle. It is four independent layers stacked together. Each layer alone helps a little; all four together cross the perceptual threshold from "toy" to "kitchen."

### Layer A — PBR Materials with Procedural Textures (`lib/designer/materials.ts` + `unit-3d.tsx`)

We ship 12 production-grade material presets covering every common Saudi/Gulf kitchen finish:

- **Wood:** oak, walnut, teak
- **Lacquer:** white-lacquer, black-matte, polylack-pearl, uv-lack-matte
- **Stone:** marble-carrara, marble-calacatta, granite-black, quartz-white
- **HPL:** hpl-glossy

Every preset is a `MeshPhysicalMaterial` (three.js PBR) with calibrated roughness, metalness, clearcoat, and clearcoatRoughness values — for example, polylack-pearl uses roughness 0.25 with clearcoat 0.6, white-lacquer uses roughness 0.15 with clearcoat 0.9, and oak uses roughness 0.7 with clearcoat 0.1. Wood and marble textures are generated procedurally to a `<canvas>` at runtime (Perlin-style wood grain and turbulence-based marble veins), cached as `THREE.CanvasTexture`, and reused across every instance. **Zero KB of texture binary ships in the JS bundle.**

### Layer B — HDRI Environment & ACES Lighting (`designer3d/scene.tsx`)

PBR materials are only as good as the light hitting them. The lighting rig:

- **drei `<Environment preset="apartment|city|sunset|night">`** — switches per time-of-day. The HDRI provides realistic indirect light + reflection probes for every chrome handle and glossy surface.
- **ACES Filmic tone mapping** on the WebGLRenderer (`renderer.toneMapping = ACESFilmicToneMapping`, exposure 1.0) — this is the same tone-mapping curve used in Hollywood VFX. It is the single biggest reason real renders look real.
- **Sun directional light** — 2048×2048 shadow map, PCFSoft shadows, with four calibrated positions and colour temperatures:
  - Morning: low east, warm 4200 K
  - Noon: high overhead, neutral 5800 K
  - Sunset: low west, deep 2700 K
  - Night: off — moonlight fill only
- **Hemispheric fill** for sky/ground bounce
- **Contact shadows** (drei `<ContactShadows>`, blur 2, opacity 0.6)
- **Emissive window plane** (a flat mesh with `emissiveIntensity` 2.5) that bleeds through the Bloom postprocess

### Layer C — Postprocessing (`designer3d/postfx.tsx`)

Built on `@react-three/postprocessing`:

- **SSAO** — screen-space ambient occlusion. This is the #1 missing realism cue today. It is what makes cabinets *sit* on the floor instead of floating. Radius 0.1, intensity 1.5.
- **Bloom** — applied only to emissive surfaces (windows, future LED strips) via luminance threshold 0.9, intensity 0.6. This is what makes the window feel like *daylight*, not a yellow rectangle.
- **ToneMapping (ACES)** — duplicated in postprocess for consistency
- **HueSaturation + BrightnessContrast** — global colour grading, +0.05 saturation, +0.02 contrast
- **Vignette** — subtle 0.3 darkness, 0.5 offset, for cinematic framing
- **MSAA 4×** on the renderer for clean edges on cabinet silhouettes

### Layer D — Realistic Hardware Geometry (`designer3d/countertop.tsx`, `designer3d/sink-faucet.tsx`)

Materials and lighting cannot save bad geometry. Three geometry upgrades:

- **Countertops** — 40 mm thick slabs with 6 mm rounded edges (RoundedBoxGeometry), in 6 materials: marble Carrara, marble Calacatta, quartz white, granite black, solid wood, polished concrete.
- **Sinks** — procedural geometries for single-bowl, double-bowl, and farmhouse styles. Stainless steel (roughness 0.25, metalness 0.95) or matte black (roughness 0.6, metalness 0.4).
- **Faucets** — procedural single-handle, pull-out, tall-arc (gooseneck), and matte-black variants. Chrome at roughness 0.05, metalness 1.0 — fully reflective of the HDRI.
- **Cabinet bodies + doors** — replaced flat `BoxGeometry` with `RoundedBoxGeometry`, edge radius 4 mm. Real cabinet doors are never knife-sharp; the 4 mm radius catches a highlight along every edge.

## 3. The Visual Before/After

| Element | Before | After |
|---|---|---|
| Cabinet body | flat color box | RoundedBox with PBR wood/marble + clearcoat + envMap reflections |
| Drawers | flat fronts | Bevelled edges + brushed chrome handles with anisotropic reflection |
| Countertop | (none) | 40 mm rounded marble/quartz slab with veins |
| Lighting | one directional + ambient | HDRI environment + sun + hemispheric + contact shadows |
| Time of day | always noon | morning/noon/sunset/night with proper sun colour temperature |
| Window | no window | emissive plane through Bloom, warm-yellow light bleed |
| Postprocess | none | SSAO + Bloom + ACES + Vignette |
| Faucets / sinks | none | procedural chrome/matte fixtures |

## 4. The Zero-Cost Promise (recap)

Every pixel in this stack is computed on the customer's own GPU through WebGL2. SKDC pays nothing per render. The procedural textures are generated in the browser at first load and cached. The drei HDRI presets ship inside the JS bundle (≈300 KB total, gzipped). There are **no external render API calls, no server-side raytracing, no rendered images to host on Storage**. Our marginal cost per Studio preview is exactly zero.

## 5. Future Photoreal Tier (out of scope for now)

When we want to push past WebGL realism into true cinematic stills — for marketing renders, brochure PDFs, or client presentations — three upgrades stand ready, but none of them ship in this iteration:

- **three-gpu-pathtracer** — one-click cinematic render mode. 5–10 s of GPU work for a 4K photoreal still. Browser-only, still zero cost.
- **AI texture synthesis** — StableMaterials API on Hugging Face for one-off custom finishes (e.g. a specific imported Italian marble the customer brought a photo of).
- **Gaussian Splatting backdrop** — customer phone-scans their actual kitchen wall/floor/window, we use it as a backdrop so the rendered cabinets sit inside their real room.

## 6. How to Tell If It Worked

After deploying, open `/dashboard/projects/<id>/studio`. The scene must pass these six checks:

1. **Wood grain visible** on cabinet fronts when you zoom in (oak, walnut, teak)
2. **Subtle ambient occlusion** as dark contact shadows under every cabinet and between adjacent units — the cabinets *sit* on the floor
3. **Window glows softly** with bloom halo, not a flat yellow rectangle
4. **Marble countertop shows veins** that look organic, not tiled or repeating
5. **Chrome handles reflect** the HDRI environment — you can see the room curving across the handle
6. **Switching time-of-day** visibly changes the scene's mood — sunset turns the whole kitchen warm-orange, night turns it cool-blue

If any one of those six fails, the layer responsible for it has regressed.

## 7. Files Map

The upgrade ships across these files. Sibling agents own the implementation; this doc is the contract they build to.

- `skdc/lib/designer/materials.ts` *(new — 12 PBR presets + procedural texture cache)*
- `skdc/components/designer3d/unit-3d.tsx` *(upgraded — RoundedBox + material lookup)*
- `skdc/components/designer3d/scene.tsx` *(upgraded — HDRI, sun, time-of-day, window)*
- `skdc/components/designer3d/postfx.tsx` *(new — SSAO + Bloom + ACES + Vignette)*
- `skdc/components/designer3d/countertop.tsx` *(new — 6-material slab)*
- `skdc/components/designer3d/sink-faucet.tsx` *(new — procedural sinks + faucets)*
- `skdc/app/dashboard/projects/[id]/studio/page.tsx` *(new — Studio entry route)*
- `skdc/components/studio/*.tsx` *(new — Studio shell: toolbar, panels, time-of-day picker, material swatches)*
