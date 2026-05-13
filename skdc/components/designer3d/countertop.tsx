"use client";

import * as React from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// ============================================================
// Types
// ============================================================
export type CountertopMaterial =
  | "marble-carrara"
  | "marble-calacatta"
  | "quartz-white"
  | "granite-black"
  | "wood-oak"
  | "concrete";

export interface CountertopProps {
  /** Center position in scene-meters. */
  position: [number, number, number];
  /** Width (X) in meters. */
  width: number;
  /** Depth (Z) in meters. */
  depth: number;
  /** Slab thickness (default 0.04 m = 40mm). */
  thickness?: number;
  /** Visual material preset. */
  material?: CountertopMaterial;
  /** Optional rotation in radians around Y. */
  rotationY?: number;
}

// ============================================================
// Material colour / finish presets
// ============================================================
interface MaterialPreset {
  base: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
}

const MATERIAL_PRESETS: Record<CountertopMaterial, MaterialPreset> = {
  "marble-carrara": {
    base: "#ece4d4",
    roughness: 0.12,
    metalness: 0.0,
    clearcoat: 0.4,
    clearcoatRoughness: 0.1,
  },
  "marble-calacatta": {
    base: "#f4eee0",
    roughness: 0.12,
    metalness: 0.0,
    clearcoat: 0.4,
    clearcoatRoughness: 0.1,
  },
  "quartz-white": {
    base: "#f8f4ec",
    roughness: 0.15,
    metalness: 0.0,
    clearcoat: 0.25,
    clearcoatRoughness: 0.15,
  },
  "granite-black": {
    base: "#1a1a1c",
    roughness: 0.3,
    metalness: 0.1,
    clearcoat: 0.2,
    clearcoatRoughness: 0.2,
  },
  "wood-oak": {
    base: "#b88a52",
    roughness: 0.45,
    metalness: 0.0,
    clearcoat: 0.25,
    clearcoatRoughness: 0.2,
  },
  concrete: {
    base: "#9a9694",
    roughness: 0.7,
    metalness: 0.0,
    clearcoat: 0.0,
    clearcoatRoughness: 0.0,
  },
};

// ============================================================
// Procedural canvas textures (module-level cache)
// ============================================================
type ProceduralTexture = { map: THREE.Texture; roughnessMap?: THREE.Texture };

const TEXTURE_CACHE = new Map<CountertopMaterial, ProceduralTexture>();
const TEX_SIZE = 512;

function getCanvas2D(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  return { canvas, ctx };
}

function toCanvasTexture(canvas: HTMLCanvasElement, repeat: number = 1): THREE.Texture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** A simple pseudo-random number generator for repeatable textures. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Paint marble veins by drawing meandering thin curves. */
function paintMarble(
  ctx: CanvasRenderingContext2D,
  base: string,
  veinColor: string,
  seed: number,
  intensity: number = 1,
): void {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  const rng = mulberry32(seed);
  const veinCount = Math.floor(8 * intensity);
  for (let v = 0; v < veinCount; v++) {
    ctx.beginPath();
    let x = rng() * TEX_SIZE;
    let y = rng() * TEX_SIZE;
    ctx.moveTo(x, y);
    const segments = 30 + Math.floor(rng() * 30);
    const dirAngle = rng() * Math.PI * 2;
    let dx = Math.cos(dirAngle);
    let dy = Math.sin(dirAngle);
    for (let s = 0; s < segments; s++) {
      // wobble direction slightly
      dx += (rng() - 0.5) * 0.4;
      dy += (rng() - 0.5) * 0.4;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
      const step = 8 + rng() * 14;
      x += dx * step;
      y += dy * step;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = veinColor;
    ctx.lineWidth = 0.5 + rng() * 1.5;
    ctx.globalAlpha = 0.25 + rng() * 0.55;
    ctx.stroke();
  }

  // subtle hairline veins for realism
  ctx.globalAlpha = 0.15;
  const hairlines = 60;
  for (let i = 0; i < hairlines; i++) {
    ctx.beginPath();
    const x1 = rng() * TEX_SIZE;
    const y1 = rng() * TEX_SIZE;
    const angle = rng() * Math.PI * 2;
    const len = 20 + rng() * 60;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + Math.cos(angle) * len, y1 + Math.sin(angle) * len);
    ctx.strokeStyle = veinColor;
    ctx.lineWidth = 0.3;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** Speckled stone (granite). */
function paintGranite(ctx: CanvasRenderingContext2D, base: string, seed: number): void {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
  const rng = mulberry32(seed);
  const count = 6000;
  for (let i = 0; i < count; i++) {
    const x = rng() * TEX_SIZE;
    const y = rng() * TEX_SIZE;
    const r = rng();
    let col: string;
    if (r < 0.6) col = `rgba(80,80,82,${0.3 + rng() * 0.4})`;
    else if (r < 0.9) col = `rgba(180,180,180,${0.15 + rng() * 0.3})`;
    else col = `rgba(220,210,180,${0.2 + rng() * 0.3})`;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x, y, 0.5 + rng() * 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Quartz — subtle uniform sparkle. */
function paintQuartz(ctx: CanvasRenderingContext2D, base: string, seed: number): void {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
  const rng = mulberry32(seed);
  for (let i = 0; i < 2000; i++) {
    const x = rng() * TEX_SIZE;
    const y = rng() * TEX_SIZE;
    ctx.fillStyle = `rgba(255,255,255,${0.05 + rng() * 0.2})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.3 + rng() * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Oak wood — horizontal grain. */
function paintWood(ctx: CanvasRenderingContext2D, seed: number): void {
  const grad = ctx.createLinearGradient(0, 0, 0, TEX_SIZE);
  grad.addColorStop(0, "#b88a52");
  grad.addColorStop(0.5, "#a07640");
  grad.addColorStop(1, "#b88a52");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  const rng = mulberry32(seed);
  // grain lines
  for (let i = 0; i < 80; i++) {
    const y = rng() * TEX_SIZE;
    ctx.beginPath();
    ctx.moveTo(0, y);
    // wavy horizontal line
    for (let x = 0; x <= TEX_SIZE; x += 16) {
      const wy = y + Math.sin(x * 0.02 + rng() * Math.PI) * 2.5;
      ctx.lineTo(x, wy);
    }
    ctx.strokeStyle = `rgba(60,40,20,${0.1 + rng() * 0.25})`;
    ctx.lineWidth = 0.5 + rng() * 1.0;
    ctx.stroke();
  }
  // knots
  for (let k = 0; k < 4; k++) {
    const cx = rng() * TEX_SIZE;
    const cy = rng() * TEX_SIZE;
    const r = 6 + rng() * 14;
    const knot = ctx.createRadialGradient(cx, cy, 1, cx, cy, r);
    knot.addColorStop(0, "rgba(50,30,15,0.9)");
    knot.addColorStop(1, "rgba(80,55,30,0)");
    ctx.fillStyle = knot;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Concrete — uneven splotches + tiny pores. */
function paintConcrete(ctx: CanvasRenderingContext2D, base: string, seed: number): void {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
  const rng = mulberry32(seed);
  // large smudges
  for (let i = 0; i < 40; i++) {
    const cx = rng() * TEX_SIZE;
    const cy = rng() * TEX_SIZE;
    const r = 30 + rng() * 100;
    const grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, r);
    const tone = 130 + Math.floor(rng() * 40);
    grad.addColorStop(0, `rgba(${tone},${tone},${tone},${0.15 + rng() * 0.2})`);
    grad.addColorStop(1, `rgba(${tone},${tone},${tone},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // pores
  for (let i = 0; i < 1500; i++) {
    const x = rng() * TEX_SIZE;
    const y = rng() * TEX_SIZE;
    ctx.fillStyle = `rgba(60,60,60,${0.1 + rng() * 0.25})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.4 + rng() * 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function buildTexture(material: CountertopMaterial): ProceduralTexture | null {
  const cached = TEXTURE_CACHE.get(material);
  if (cached) return cached;
  const c = getCanvas2D();
  if (!c) return null;
  const { canvas, ctx } = c;

  switch (material) {
    case "marble-carrara":
      paintMarble(ctx, "#ece4d4", "#7d7c78", 1337);
      break;
    case "marble-calacatta":
      paintMarble(ctx, "#f4eee0", "#b89055", 4242, 1.1);
      break;
    case "quartz-white":
      paintQuartz(ctx, "#f8f4ec", 999);
      break;
    case "granite-black":
      paintGranite(ctx, "#1a1a1c", 7);
      break;
    case "wood-oak":
      paintWood(ctx, 314);
      break;
    case "concrete":
      paintConcrete(ctx, "#9a9694", 2024);
      break;
  }

  const map = toCanvasTexture(canvas, 1);
  const entry: ProceduralTexture = { map };
  TEXTURE_CACHE.set(material, entry);
  return entry;
}

// ============================================================
// Component
// ============================================================
export function Countertop(props: CountertopProps): React.JSX.Element {
  const {
    position,
    width,
    depth,
    thickness = 0.04,
    material = "marble-carrara",
    rotationY = 0,
  } = props;

  // Bevelled slab geometry — radius ~4mm, smoothness 2.
  const geometry = React.useMemo(() => {
    return new RoundedBoxGeometry(width, thickness, depth, 2, 0.004);
  }, [width, thickness, depth]);

  // Dispose geometry when it changes / component unmounts.
  React.useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  const preset = MATERIAL_PRESETS[material];
  const texture = React.useMemo(() => buildTexture(material), [material]);

  return (
    <mesh
      position={position}
      rotation={[0, rotationY, 0]}
      geometry={geometry}
      castShadow
      receiveShadow
    >
      <meshPhysicalMaterial
        color={preset.base}
        map={texture?.map ?? null}
        roughness={preset.roughness}
        metalness={preset.metalness}
        clearcoat={preset.clearcoat}
        clearcoatRoughness={preset.clearcoatRoughness}
      />
    </mesh>
  );
}
