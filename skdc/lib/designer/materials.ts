/**
 * SKDC — Photoreal material preset library for the 3D designer.
 *
 * Each preset returns a freshly-built `MeshPhysicalMaterial` so callers can
 * safely mutate per-instance properties (color tint, envMapIntensity, etc.)
 * without leaking state across cabinets.
 *
 * Procedural textures (wood grain, marble veins) are painted to a 512×512
 * canvas ONCE per recipe and cached in module scope — this keeps the GPU
 * happy when the scene contains dozens of cabinets sharing the same finish.
 *
 * The presets intentionally use real-world PBR values (roughness/metalness/
 * clearcoat) sourced from the equivalent Babylon mockup at
 * `public/studio-mockups/babylon-webgpu-demo-v2-photoreal.html`.
 */

import * as THREE from "three";

export type MaterialPreset = {
  id: string;
  /** i18n translation key, e.g. "material.preset.oak". */
  nameKey: string;
  /** Hex string we surface to the 2D designer's color picker. */
  swatch: string;
  /** Build a fresh material instance configured for cabinet surfaces. */
  build: (T: typeof import("three")) => THREE.MeshPhysicalMaterial;
};

// ============================================================
// Canvas cache — same recipe ⇒ same GPU upload.
// ============================================================

type CanvasKey = string;
const canvasCache = new Map<CanvasKey, HTMLCanvasElement>();
const textureCache = new Map<CanvasKey, THREE.CanvasTexture>();

/**
 * Resolve (or create) a CanvasTexture for a given recipe key. The texture is
 * configured for tile-able cabinet surfaces (repeat wrap + sRGB color space).
 */
function getCachedTexture(
  key: CanvasKey,
  draw: () => HTMLCanvasElement,
  repeat: [number, number] = [2, 2],
): THREE.CanvasTexture | null {
  // SSR / non-browser: bail — Three will accept a null map.
  if (typeof document === "undefined") return null;

  let tex = textureCache.get(key);
  if (tex) return tex;

  let canvas = canvasCache.get(key);
  if (!canvas) {
    canvas = draw();
    canvasCache.set(key, canvas);
  }

  tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  textureCache.set(key, tex);
  return tex;
}

// ============================================================
// Procedural wood
// ============================================================
function makeWoodCanvas(baseHex: string, grainHex: string): HTMLCanvasElement {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Warm vertical gradient base (simulates plank stain transition).
  const base = new THREE.Color(baseHex);
  const grain = new THREE.Color(grainHex);
  const lighter = base.clone().lerp(new THREE.Color("#ffffff"), 0.12);
  const darker = base.clone().lerp(new THREE.Color("#000000"), 0.18);

  const gradient = ctx.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, `#${lighter.getHexString()}`);
  gradient.addColorStop(0.5, `#${base.getHexString()}`);
  gradient.addColorStop(1, `#${darker.getHexString()}`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Vertical fibre noise — many faint stripes for soft grain.
  for (let x = 0; x < size; x += 1) {
    const noise = (Math.sin(x * 0.07) + Math.sin(x * 0.31) + Math.sin(x * 1.1)) / 3;
    const alpha = 0.05 + Math.abs(noise) * 0.06;
    ctx.fillStyle = `rgba(0,0,0,${alpha.toFixed(3)})`;
    ctx.fillRect(x, 0, 1, size);
  }

  // Dark grain lines — irregular sinusoidal curves.
  ctx.strokeStyle = `#${grain.getHexString()}`;
  ctx.lineWidth = 1;
  const lineCount = 28;
  for (let i = 0; i < lineCount; i += 1) {
    const baseX = (i / lineCount) * size + (Math.random() * 18 - 9);
    ctx.globalAlpha = 0.18 + Math.random() * 0.22;
    ctx.beginPath();
    for (let y = 0; y <= size; y += 4) {
      const wobble =
        Math.sin(y * 0.018 + i * 1.7) * 6 +
        Math.sin(y * 0.005 + i * 0.4) * 14;
      const x = baseX + wobble;
      if (y === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // A few darker knots.
  ctx.globalAlpha = 0.35;
  for (let k = 0; k < 4; k += 1) {
    const kx = Math.random() * size;
    const ky = Math.random() * size;
    const kr = 4 + Math.random() * 6;
    const knot = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr * 3);
    knot.addColorStop(0, `#${grain.clone().multiplyScalar(0.4).getHexString()}`);
    knot.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = knot;
    ctx.beginPath();
    ctx.arc(kx, ky, kr * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  return canvas;
}

// ============================================================
// Procedural marble
// ============================================================
function makeMarbleCanvas(
  baseHex: string,
  veinHex: string,
  veinCount = 3,
): HTMLCanvasElement {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Soft mottled base — radial gradients layered over a solid fill.
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, size, size);

  const base = new THREE.Color(baseHex);
  const cloudHex = `#${base.clone().lerp(new THREE.Color("#ffffff"), 0.18).getHexString()}`;
  const shadowHex = `#${base.clone().lerp(new THREE.Color("#000000"), 0.08).getHexString()}`;

  for (let i = 0; i < 14; i += 1) {
    const cx = Math.random() * size;
    const cy = Math.random() * size;
    const cr = 80 + Math.random() * 160;
    const cloud = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
    cloud.addColorStop(0, i % 2 === 0 ? cloudHex : shadowHex);
    cloud.addColorStop(1, "rgba(255,255,255,0)");
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = cloud;
    ctx.fillRect(0, 0, size, size);
  }

  ctx.globalAlpha = 1;

  // Veins — wandering polylines with noisy perpendicular displacement.
  ctx.strokeStyle = veinHex;
  for (let v = 0; v < veinCount; v += 1) {
    const startX = Math.random() * size;
    const startY = Math.random() * size;
    const dirX = Math.cos((v / veinCount) * Math.PI * 2 + Math.random());
    const dirY = Math.sin((v / veinCount) * Math.PI * 2 + Math.random());
    // Main vein
    ctx.globalAlpha = 0.4 + Math.random() * 0.35;
    ctx.lineWidth = 1.2 + Math.random() * 1.4;
    ctx.beginPath();
    let x = startX;
    let y = startY;
    ctx.moveTo(x, y);
    for (let step = 0; step < 220; step += 1) {
      x += dirX * 3 + (Math.random() - 0.5) * 6;
      y += dirY * 3 + (Math.random() - 0.5) * 6;
      ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Hair-line branches
    ctx.lineWidth = 0.6;
    ctx.globalAlpha = 0.2;
    for (let b = 0; b < 4; b += 1) {
      ctx.beginPath();
      let bx = startX + (Math.random() - 0.5) * size * 0.5;
      let by = startY + (Math.random() - 0.5) * size * 0.5;
      ctx.moveTo(bx, by);
      for (let step = 0; step < 60; step += 1) {
        bx += dirX * 1.5 + (Math.random() - 0.5) * 4;
        by += dirY * 1.5 + (Math.random() - 0.5) * 4;
        ctx.lineTo(bx, by);
      }
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
  return canvas;
}

// ============================================================
// Procedural granite (fine speckle)
// ============================================================
function makeGraniteCanvas(baseHex: string): HTMLCanvasElement {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, size, size);

  // Dense speckle — mix of light and dark grains.
  const grains = 9000;
  for (let i = 0; i < grains; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const shade = Math.random();
    if (shade < 0.55) {
      ctx.fillStyle = `rgba(255,255,255,${(0.05 + Math.random() * 0.18).toFixed(3)})`;
    } else if (shade < 0.85) {
      ctx.fillStyle = `rgba(40,40,40,${(0.1 + Math.random() * 0.2).toFixed(3)})`;
    } else {
      // Sparse warm/cool crystal flecks.
      ctx.fillStyle = `rgba(${120 + Math.random() * 80},${90 + Math.random() * 80},${60 + Math.random() * 70},${(0.25).toFixed(3)})`;
    }
    ctx.fillRect(x, y, 1.2, 1.2);
  }
  return canvas;
}

// ============================================================
// Preset definitions
// ============================================================

const PRESETS_INTERNAL: MaterialPreset[] = [
  {
    id: "oak",
    nameKey: "material.preset.oak",
    swatch: "#b88a5a",
    build: (T) => {
      const map = getCachedTexture("wood:oak", () => makeWoodCanvas("#c39466", "#5a3a1d"), [2, 1]);
      const m = new T.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.55,
        metalness: 0.0,
        clearcoat: 0.4,
        clearcoatRoughness: 0.35,
        envMapIntensity: 1.2,
      });
      if (map) m.map = map;
      return m;
    },
  },
  {
    id: "walnut",
    nameKey: "material.preset.walnut",
    swatch: "#4a2c1a",
    build: (T) => {
      const map = getCachedTexture("wood:walnut", () => makeWoodCanvas("#5a3320", "#2a1408"), [2, 1]);
      const m = new T.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.0,
        clearcoat: 0.45,
        clearcoatRoughness: 0.3,
        envMapIntensity: 1.2,
      });
      if (map) m.map = map;
      return m;
    },
  },
  {
    id: "teak",
    nameKey: "material.preset.teak",
    swatch: "#a06a3a",
    build: (T) => {
      const map = getCachedTexture("wood:teak", () => makeWoodCanvas("#a8714a", "#4a2a14"), [2, 1]);
      const m = new T.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.6,
        metalness: 0.0,
        clearcoat: 0.4,
        clearcoatRoughness: 0.35,
        envMapIntensity: 1.2,
      });
      if (map) m.map = map;
      return m;
    },
  },
  {
    id: "white-lacquer",
    nameKey: "material.preset.whiteLacquer",
    swatch: "#f4f4f4",
    build: (T) =>
      new T.MeshPhysicalMaterial({
        color: 0xf4f4f4,
        roughness: 0.22,
        metalness: 0.05,
        clearcoat: 0.6,
        clearcoatRoughness: 0.15,
        envMapIntensity: 1.2,
      }),
  },
  {
    id: "black-matte",
    nameKey: "material.preset.blackMatte",
    swatch: "#1a1a1a",
    build: (T) =>
      new T.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        roughness: 0.4,
        metalness: 0.15,
        clearcoat: 0.0,
        envMapIntensity: 1.0,
      }),
  },
  {
    id: "marble-carrara",
    nameKey: "material.preset.marbleCarrara",
    swatch: "#ececec",
    build: (T) => {
      const map = getCachedTexture(
        "marble:carrara",
        () => makeMarbleCanvas("#ececec", "#5d6b78", 4),
        [1, 1],
      );
      const m = new T.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.12,
        metalness: 0.0,
        clearcoat: 0.4,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.3,
      });
      if (map) m.map = map;
      return m;
    },
  },
  {
    id: "marble-calacatta",
    nameKey: "material.preset.marbleCalacatta",
    swatch: "#f3ecdf",
    build: (T) => {
      const map = getCachedTexture(
        "marble:calacatta",
        () => makeMarbleCanvas("#f4ecdc", "#b48a3a", 3),
        [1, 1],
      );
      const m = new T.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.14,
        metalness: 0.02,
        clearcoat: 0.45,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.3,
      });
      if (map) m.map = map;
      return m;
    },
  },
  {
    id: "granite-black",
    nameKey: "material.preset.graniteBlack",
    swatch: "#1f1f22",
    build: (T) => {
      const map = getCachedTexture(
        "granite:black",
        () => makeGraniteCanvas("#1f1f22"),
        [2, 2],
      );
      const m = new T.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.1,
        clearcoat: 0.3,
        clearcoatRoughness: 0.25,
        envMapIntensity: 1.2,
      });
      if (map) m.map = map;
      return m;
    },
  },
  {
    id: "quartz-white",
    nameKey: "material.preset.quartzWhite",
    swatch: "#fafaf6",
    build: (T) => {
      const map = getCachedTexture(
        "quartz:white",
        () => makeGraniteCanvas("#fafaf6"),
        [3, 3],
      );
      const m = new T.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.15,
        metalness: 0.0,
        clearcoat: 0.35,
        clearcoatRoughness: 0.12,
        sheen: 0.2,
        sheenColor: new T.Color("#ffffff"),
        envMapIntensity: 1.25,
      });
      if (map) m.map = map;
      return m;
    },
  },
  {
    id: "hpl-glossy",
    nameKey: "material.preset.hplGlossy",
    swatch: "#dcdcdc",
    build: (T) =>
      new T.MeshPhysicalMaterial({
        color: 0xdcdcdc,
        roughness: 0.18,
        metalness: 0.05,
        clearcoat: 0.8,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.3,
      }),
  },
  {
    id: "uv-lack-matte",
    nameKey: "material.preset.uvLackMatte",
    swatch: "#cfcfcf",
    build: (T) =>
      new T.MeshPhysicalMaterial({
        color: 0xcfcfcf,
        roughness: 0.6,
        metalness: 0.0,
        clearcoat: 0.0,
        envMapIntensity: 0.9,
      }),
  },
  {
    id: "polylack-pearl",
    nameKey: "material.preset.polylackPearl",
    swatch: "#ece6d8",
    build: (T) =>
      new T.MeshPhysicalMaterial({
        color: 0xece6d8,
        roughness: 0.32,
        metalness: 0.08,
        clearcoat: 0.5,
        clearcoatRoughness: 0.2,
        sheen: 0.4,
        sheenColor: new T.Color("#fff5e6"),
        envMapIntensity: 1.2,
      }),
  },
  // ============================================================
  // Extended palette — added for the full designer experience.
  // ============================================================
  {
    id: "maple",
    nameKey: "material.preset.maple",
    swatch: "#d8b87a",
    build: (T) => {
      const map = getCachedTexture("wood:maple", () => makeWoodCanvas("#e1c08c", "#856334"), [2, 1]);
      const m = new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.48, metalness: 0, clearcoat: 0.45, clearcoatRoughness: 0.3, envMapIntensity: 1.2 });
      if (map) m.map = map;
      return m;
    },
  },
  {
    id: "mahogany",
    nameKey: "material.preset.mahogany",
    swatch: "#5a2a1a",
    build: (T) => {
      const map = getCachedTexture("wood:mahogany", () => makeWoodCanvas("#6a3020", "#2a0d05"), [2, 1]);
      const m = new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.42, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.22, envMapIntensity: 1.25 });
      if (map) m.map = map;
      return m;
    },
  },
  {
    id: "wenge",
    nameKey: "material.preset.wenge",
    swatch: "#2c1d14",
    build: (T) => {
      const map = getCachedTexture("wood:wenge", () => makeWoodCanvas("#332218", "#0d0805"), [2, 1]);
      const m = new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0, clearcoat: 0.4, clearcoatRoughness: 0.3, envMapIntensity: 1.15 });
      if (map) m.map = map;
      return m;
    },
  },
  {
    id: "bamboo",
    nameKey: "material.preset.bamboo",
    swatch: "#c6a665",
    build: (T) => {
      const map = getCachedTexture("wood:bamboo", () => makeWoodCanvas("#d4b478", "#7a5c2e"), [3, 1]);
      const m = new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.3, envMapIntensity: 1.15 });
      if (map) m.map = map;
      return m;
    },
  },
  {
    id: "navy-blue",
    nameKey: "material.preset.navyBlue",
    swatch: "#1a2942",
    build: (T) =>
      new T.MeshPhysicalMaterial({ color: 0x1a2942, roughness: 0.28, metalness: 0.08, clearcoat: 0.65, clearcoatRoughness: 0.15, envMapIntensity: 1.3 }),
  },
  {
    id: "sage-green",
    nameKey: "material.preset.sageGreen",
    swatch: "#8a9e7c",
    build: (T) =>
      new T.MeshPhysicalMaterial({ color: 0x8a9e7c, roughness: 0.4, metalness: 0.04, clearcoat: 0.5, clearcoatRoughness: 0.2, envMapIntensity: 1.15 }),
  },
  {
    id: "terracotta",
    nameKey: "material.preset.terracotta",
    swatch: "#b65a3a",
    build: (T) =>
      new T.MeshPhysicalMaterial({ color: 0xb65a3a, roughness: 0.5, metalness: 0.02, clearcoat: 0.3, clearcoatRoughness: 0.3, envMapIntensity: 1.1 }),
  },
  {
    id: "charcoal",
    nameKey: "material.preset.charcoal",
    swatch: "#2a2a2e",
    build: (T) =>
      new T.MeshPhysicalMaterial({ color: 0x2a2a2e, roughness: 0.35, metalness: 0.12, clearcoat: 0.55, clearcoatRoughness: 0.18, envMapIntensity: 1.2 }),
  },
  {
    id: "cream-glossy",
    nameKey: "material.preset.creamGlossy",
    swatch: "#f0e6d2",
    build: (T) =>
      new T.MeshPhysicalMaterial({ color: 0xf0e6d2, roughness: 0.18, metalness: 0.06, clearcoat: 0.75, clearcoatRoughness: 0.08, envMapIntensity: 1.35 }),
  },
  {
    id: "marble-emperador",
    nameKey: "material.preset.marbleEmperador",
    swatch: "#5a3a2a",
    build: (T) => {
      const map = getCachedTexture("marble:emperador", () => makeMarbleCanvas("#5a3a2a", "#d4b87a", 5), [1, 1]);
      const m = new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.16, metalness: 0.02, clearcoat: 0.5, clearcoatRoughness: 0.1, envMapIntensity: 1.35 });
      if (map) m.map = map;
      return m;
    },
  },
  {
    id: "granite-white",
    nameKey: "material.preset.graniteWhite",
    swatch: "#ededed",
    build: (T) => {
      const map = getCachedTexture("granite:white", () => makeGraniteCanvas("#ededed"), [2, 2]);
      const m = new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.06, clearcoat: 0.4, clearcoatRoughness: 0.18, envMapIntensity: 1.25 });
      if (map) m.map = map;
      return m;
    },
  },
  {
    id: "travertine",
    nameKey: "material.preset.travertine",
    swatch: "#d6c4a4",
    build: (T) => {
      const map = getCachedTexture("stone:travertine", () => makeMarbleCanvas("#d6c4a4", "#8a6f44", 2), [1, 1]);
      const m = new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.45, metalness: 0, clearcoat: 0.2, clearcoatRoughness: 0.3, envMapIntensity: 1.15 });
      if (map) m.map = map;
      return m;
    },
  },
  {
    id: "brushed-steel",
    nameKey: "material.preset.brushedSteel",
    swatch: "#bdbdbd",
    build: (T) => {
      const m = new T.MeshPhysicalMaterial({ color: 0xbdbdbd, roughness: 0.28, metalness: 0.95, clearcoat: 0.25, clearcoatRoughness: 0.2, envMapIntensity: 1.5 });
      if ("anisotropy" in m) {
        (m as THREE.MeshPhysicalMaterial).anisotropy = 0.6;
        (m as THREE.MeshPhysicalMaterial).anisotropyRotation = 0;
      }
      return m;
    },
  },
  {
    id: "brass-aged",
    nameKey: "material.preset.brassAged",
    swatch: "#b5894a",
    build: (T) =>
      new T.MeshPhysicalMaterial({ color: 0xb5894a, roughness: 0.4, metalness: 0.85, clearcoat: 0.2, clearcoatRoughness: 0.3, envMapIntensity: 1.4 }),
  },
  {
    id: "copper-brushed",
    nameKey: "material.preset.copperBrushed",
    swatch: "#b87333",
    build: (T) =>
      new T.MeshPhysicalMaterial({ color: 0xb87333, roughness: 0.35, metalness: 0.9, clearcoat: 0.25, clearcoatRoughness: 0.22, envMapIntensity: 1.45 }),
  },
  {
    id: "frosted-glass",
    nameKey: "material.preset.frostedGlass",
    swatch: "#e8edf2",
    build: (T) =>
      new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.35, metalness: 0, transmission: 0.85, opacity: 0.5, transparent: true, thickness: 0.02, ior: 1.45, envMapIntensity: 1.2 }),
  },
];

export const MATERIAL_PRESETS: MaterialPreset[] = PRESETS_INTERNAL;

export function getPresetById(id: string): MaterialPreset | undefined {
  return PRESETS_INTERNAL.find((p) => p.id === id);
}

// ============================================================
// Color → preset best-effort mapping
// ============================================================

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function colorDistance(a: [number, number, number], b: [number, number, number]): number {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return dr * dr + dg * dg + db * db;
}

const PRESET_RGB: { id: string; rgb: [number, number, number] }[] = PRESETS_INTERNAL.map(
  (p) => {
    const rgb = hexToRgb(p.swatch) ?? [128, 128, 128];
    return { id: p.id, rgb };
  },
);

/**
 * Best-effort mapping from a unit's `unit.color` hex back to the closest
 * preset id. Falls back to a category-aware default (white lacquer for
 * cabinets, marble-carrara for countertop-ish categories) so the scene
 * never goes blank if the picker hands us an unknown color.
 */
export function presetIdForUnit(unit: { color?: string; category: string }): string {
  const cat = (unit.category || "").toUpperCase();
  const categoryDefault =
    cat.includes("COUNTER") || cat.includes("WORKTOP") || cat.includes("STONE")
      ? "marble-carrara"
      : "white-lacquer";

  const rgb = unit.color ? hexToRgb(unit.color) : null;
  if (!rgb) return categoryDefault;

  let bestId = categoryDefault;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const p of PRESET_RGB) {
    const d = colorDistance(rgb, p.rgb);
    if (d < bestDist) {
      bestDist = d;
      bestId = p.id;
    }
  }
  // If even the closest preset is more than ~70 units off per channel
  // (~14700 sqd), let the caller fall back to a tinted basic PBR.
  if (bestDist > 14700) return categoryDefault;
  return bestId;
}

/**
 * Build a fallback `MeshPhysicalMaterial` when `unit.color` doesn't match any
 * preset closely. Keeps the surface neutral-glossy so it still reads as a
 * painted cabinet rather than a flat-shaded prop.
 */
export function buildFallbackMaterial(hex: string): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(hex),
    roughness: 0.35,
    metalness: 0.05,
    clearcoat: 0.35,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.2,
  });
}
