/**
 * SKDC — Expanded material library for the Sprint 1 material picker.
 *
 * Each entry is a *data-only* PBR descriptor (no Three.js imports here) so
 * the picker can render thumbnails on the server/client without pulling in
 * the renderer bundle. `unit-3d.tsx` looks the entry up at render time and
 * applies its color/roughness/metalness/clearcoat to the cabinet body and
 * facade materials.
 *
 * Layout: four groups (WOOD, STONE, METAL, PAINT). Thumbnails are CSS
 * gradients so the picker grid stays lightweight and fully offline.
 */

export type MaterialGroup = "WOOD" | "STONE" | "METAL" | "PAINT";

export type LibraryMaterial = {
  /** Stable id stored on `DesignerUnit.materialId`. */
  id: string;
  group: MaterialGroup;
  /** Arabic display name (RTL, designer-facing). */
  nameAr: string;
  /** English fallback. */
  nameEn: string;
  /** Base hex color used by the 3D PBR shader. */
  color: string;
  /** PBR roughness (0 = mirror, 1 = chalk). */
  roughness: number;
  /** PBR metalness (0 = dielectric, 1 = metal). */
  metalness: number;
  /** Optional clearcoat lacquer layer (0..1). */
  clearcoat?: number;
  /** Roughness of the clearcoat lacquer layer (0..1). */
  clearcoatRoughness?: number;
  /** Optional fabric-like sheen (0..1) for matte paints / pearl finishes. */
  sheen?: number;
  /**
   * CSS background string used by the picker thumbnail. Must paint a square
   * 1:1 swatch and stand on its own (no extra layers required by the host).
   */
  thumbnail: string;
};

// ============================================================
// WOOD (8) — warm grain gradients with a darker diagonal streak
// to suggest plank direction in the thumbnail.
// ============================================================
const WOODS: LibraryMaterial[] = [
  {
    id: "wood.oak-natural",
    group: "WOOD",
    nameAr: "بلوط طبيعي",
    nameEn: "Natural oak",
    color: "#c39466",
    roughness: 0.55,
    metalness: 0,
    clearcoat: 0.4,
    clearcoatRoughness: 0.35,
    thumbnail:
      "linear-gradient(135deg, #d8a878 0%, #c39466 45%, #8a6238 100%), repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0 2px, transparent 2px 6px)",
  },
  {
    id: "wood.oak-dark",
    group: "WOOD",
    nameAr: "بلوط داكن",
    nameEn: "Dark oak",
    color: "#6b4a2b",
    roughness: 0.5,
    metalness: 0,
    clearcoat: 0.45,
    clearcoatRoughness: 0.3,
    thumbnail:
      "linear-gradient(135deg, #8a6238 0%, #6b4a2b 45%, #3d2814 100%), repeating-linear-gradient(90deg, rgba(0,0,0,0.10) 0 2px, transparent 2px 6px)",
  },
  {
    id: "wood.walnut",
    group: "WOOD",
    nameAr: "جوز",
    nameEn: "Walnut",
    color: "#5a3320",
    roughness: 0.5,
    metalness: 0,
    clearcoat: 0.45,
    clearcoatRoughness: 0.3,
    thumbnail:
      "linear-gradient(135deg, #7a4a30 0%, #5a3320 45%, #2a1408 100%), repeating-linear-gradient(90deg, rgba(0,0,0,0.10) 0 2px, transparent 2px 7px)",
  },
  {
    id: "wood.mahogany",
    group: "WOOD",
    nameAr: "ماهوجني",
    nameEn: "Mahogany",
    color: "#5e2a1d",
    roughness: 0.45,
    metalness: 0,
    clearcoat: 0.55,
    clearcoatRoughness: 0.25,
    thumbnail:
      "linear-gradient(135deg, #823a2a 0%, #5e2a1d 45%, #2e1208 100%), repeating-linear-gradient(90deg, rgba(0,0,0,0.10) 0 2px, transparent 2px 6px)",
  },
  {
    id: "wood.ash",
    group: "WOOD",
    nameAr: "دردار (آش)",
    nameEn: "Ash",
    color: "#d8c79e",
    roughness: 0.58,
    metalness: 0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.35,
    thumbnail:
      "linear-gradient(135deg, #ecdcb4 0%, #d8c79e 45%, #a08858 100%), repeating-linear-gradient(90deg, rgba(0,0,0,0.07) 0 2px, transparent 2px 6px)",
  },
  {
    id: "wood.white-oak",
    group: "WOOD",
    nameAr: "بلوط أبيض",
    nameEn: "White oak",
    color: "#e3cfa9",
    roughness: 0.55,
    metalness: 0,
    clearcoat: 0.4,
    clearcoatRoughness: 0.3,
    thumbnail:
      "linear-gradient(135deg, #efe0c0 0%, #e3cfa9 45%, #b59a72 100%), repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0 2px, transparent 2px 6px)",
  },
  {
    id: "wood.ebony",
    group: "WOOD",
    nameAr: "أبنوس",
    nameEn: "Ebony",
    color: "#1d150e",
    roughness: 0.4,
    metalness: 0.02,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
    thumbnail:
      "linear-gradient(135deg, #2e231a 0%, #1d150e 45%, #060403 100%), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 7px)",
  },
  {
    id: "wood.teak",
    group: "WOOD",
    nameAr: "ساج",
    nameEn: "Teak",
    color: "#a8714a",
    roughness: 0.6,
    metalness: 0,
    clearcoat: 0.4,
    clearcoatRoughness: 0.35,
    thumbnail:
      "linear-gradient(135deg, #c08960 0%, #a8714a 45%, #6c4424 100%), repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0 2px, transparent 2px 6px)",
  },
];

// ============================================================
// STONE (6) — soft mottled bases with thin veins for marbles.
// ============================================================
const STONES: LibraryMaterial[] = [
  {
    id: "stone.marble-carrara",
    group: "STONE",
    nameAr: "رخام كاراره أبيض",
    nameEn: "Carrara white marble",
    color: "#ececec",
    roughness: 0.12,
    metalness: 0,
    clearcoat: 0.4,
    clearcoatRoughness: 0.1,
    thumbnail:
      "linear-gradient(135deg, #f8f8f8 0%, #ececec 60%, #c9d2d8 100%), repeating-linear-gradient(45deg, transparent 0 14px, rgba(93,107,120,0.12) 14px 15px)",
  },
  {
    id: "stone.marble-black",
    group: "STONE",
    nameAr: "رخام أسود",
    nameEn: "Black marble",
    color: "#1a1a1c",
    roughness: 0.18,
    metalness: 0.05,
    clearcoat: 0.5,
    clearcoatRoughness: 0.12,
    thumbnail:
      "linear-gradient(135deg, #2a2a2e 0%, #1a1a1c 60%, #050505 100%), repeating-linear-gradient(45deg, transparent 0 14px, rgba(255,255,255,0.10) 14px 15px)",
  },
  {
    id: "stone.quartz-white",
    group: "STONE",
    nameAr: "كوارتز أبيض",
    nameEn: "White quartz",
    color: "#fafaf6",
    roughness: 0.15,
    metalness: 0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.12,
    sheen: 0.2,
    thumbnail:
      "radial-gradient(circle at 30% 30%, #ffffff 0%, #fafaf6 50%, #d7d4c8 100%)",
  },
  {
    id: "stone.granite-black",
    group: "STONE",
    nameAr: "جرانيت أسود",
    nameEn: "Black granite",
    color: "#1f1f22",
    roughness: 0.3,
    metalness: 0.1,
    clearcoat: 0.3,
    clearcoatRoughness: 0.25,
    thumbnail:
      "radial-gradient(circle at 30% 30%, #3a3a3e 0%, #1f1f22 60%, #0a0a0c 100%)",
  },
  {
    id: "stone.granite-white",
    group: "STONE",
    nameAr: "جرانيت أبيض",
    nameEn: "White granite",
    color: "#d8d6cf",
    roughness: 0.32,
    metalness: 0.05,
    clearcoat: 0.25,
    clearcoatRoughness: 0.25,
    thumbnail:
      "radial-gradient(circle at 30% 30%, #f0eee6 0%, #d8d6cf 60%, #a8a69e 100%)",
  },
  {
    id: "stone.travertine-beige",
    group: "STONE",
    nameAr: "ترافرتين بيج",
    nameEn: "Beige travertine",
    color: "#d4bf95",
    roughness: 0.4,
    metalness: 0,
    clearcoat: 0.2,
    clearcoatRoughness: 0.3,
    thumbnail:
      "linear-gradient(135deg, #ead4a8 0%, #d4bf95 60%, #9e8456 100%), repeating-linear-gradient(0deg, transparent 0 10px, rgba(0,0,0,0.08) 10px 11px)",
  },
];

// ============================================================
// METAL (5) — high metalness, low roughness for polished finishes.
// ============================================================
const METALS: LibraryMaterial[] = [
  {
    id: "metal.brushed-steel",
    group: "METAL",
    nameAr: "ستيل مصقول",
    nameEn: "Brushed steel",
    color: "#bcbcc0",
    roughness: 0.35,
    metalness: 0.9,
    clearcoat: 0.2,
    clearcoatRoughness: 0.25,
    thumbnail:
      "linear-gradient(180deg, #dcdce0 0%, #bcbcc0 50%, #88888c 100%), repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.08) 2px 3px)",
  },
  {
    id: "metal.polished-steel",
    group: "METAL",
    nameAr: "ستيل لامع",
    nameEn: "Polished steel",
    color: "#d4d4d8",
    roughness: 0.12,
    metalness: 0.95,
    clearcoat: 0.4,
    clearcoatRoughness: 0.08,
    thumbnail:
      "linear-gradient(135deg, #ffffff 0%, #d4d4d8 50%, #7a7a82 100%)",
  },
  {
    id: "metal.copper",
    group: "METAL",
    nameAr: "نحاس",
    nameEn: "Copper",
    color: "#b87333",
    roughness: 0.28,
    metalness: 0.9,
    clearcoat: 0.3,
    clearcoatRoughness: 0.18,
    thumbnail:
      "linear-gradient(135deg, #e09a5a 0%, #b87333 50%, #6e4218 100%)",
  },
  {
    id: "metal.brass",
    group: "METAL",
    nameAr: "نحاس أصفر (براس)",
    nameEn: "Brass",
    color: "#c9a356",
    roughness: 0.25,
    metalness: 0.9,
    clearcoat: 0.35,
    clearcoatRoughness: 0.15,
    thumbnail:
      "linear-gradient(135deg, #ecd28a 0%, #c9a356 50%, #806220 100%)",
  },
  {
    id: "metal.matte-black",
    group: "METAL",
    nameAr: "أسود معدني مات",
    nameEn: "Matte black metal",
    color: "#18181b",
    roughness: 0.55,
    metalness: 0.7,
    clearcoat: 0.1,
    clearcoatRoughness: 0.5,
    thumbnail:
      "linear-gradient(135deg, #2a2a2e 0%, #18181b 50%, #050505 100%)",
  },
];

// ============================================================
// PAINT (6) — lacquered cabinet finishes ranging from matte to gloss.
// ============================================================
const PAINTS: LibraryMaterial[] = [
  {
    id: "paint.matte-white",
    group: "PAINT",
    nameAr: "أبيض مات",
    nameEn: "Matte white",
    color: "#f4f4f4",
    roughness: 0.6,
    metalness: 0,
    clearcoat: 0,
    thumbnail: "linear-gradient(135deg, #ffffff 0%, #f4f4f4 60%, #d8d8d8 100%)",
  },
  {
    id: "paint.glossy-white",
    group: "PAINT",
    nameAr: "أبيض لامع",
    nameEn: "Glossy white",
    color: "#f8f8f8",
    roughness: 0.18,
    metalness: 0.05,
    clearcoat: 0.8,
    clearcoatRoughness: 0.08,
    thumbnail: "linear-gradient(135deg, #ffffff 0%, #f8f8f8 50%, #c8c8d0 100%)",
  },
  {
    id: "paint.navy-blue",
    group: "PAINT",
    nameAr: "أزرق كحلي",
    nameEn: "Navy blue",
    color: "#1e2a4a",
    roughness: 0.3,
    metalness: 0.05,
    clearcoat: 0.55,
    clearcoatRoughness: 0.2,
    thumbnail: "linear-gradient(135deg, #3a4878 0%, #1e2a4a 60%, #0a0e1f 100%)",
  },
  {
    id: "paint.forest-green",
    group: "PAINT",
    nameAr: "أخضر غابي",
    nameEn: "Forest green",
    color: "#2a4632",
    roughness: 0.35,
    metalness: 0.05,
    clearcoat: 0.5,
    clearcoatRoughness: 0.22,
    thumbnail: "linear-gradient(135deg, #4a6c52 0%, #2a4632 60%, #102014 100%)",
  },
  {
    id: "paint.soft-beige",
    group: "PAINT",
    nameAr: "بيج هادئ",
    nameEn: "Soft beige",
    color: "#e6dcc8",
    roughness: 0.4,
    metalness: 0,
    clearcoat: 0.3,
    clearcoatRoughness: 0.25,
    sheen: 0.25,
    thumbnail: "linear-gradient(135deg, #f4ecd8 0%, #e6dcc8 60%, #b8a98a 100%)",
  },
  {
    id: "paint.charcoal-gray",
    group: "PAINT",
    nameAr: "رمادي فحمي",
    nameEn: "Charcoal gray",
    color: "#3a3a3e",
    roughness: 0.45,
    metalness: 0.08,
    clearcoat: 0.4,
    clearcoatRoughness: 0.25,
    thumbnail: "linear-gradient(135deg, #585860 0%, #3a3a3e 60%, #1a1a1e 100%)",
  },
];

// ============================================================
// Public API
// ============================================================

/** All 25 materials in display order (grouped, then alphabetical-ish). */
export const MATERIAL_LIBRARY: LibraryMaterial[] = [
  ...WOODS,
  ...STONES,
  ...METALS,
  ...PAINTS,
];

const BY_ID: Map<string, LibraryMaterial> = new Map(
  MATERIAL_LIBRARY.map((m) => [m.id, m]),
);

export function getLibraryMaterial(id: string): LibraryMaterial | undefined {
  return BY_ID.get(id);
}

export function materialsInGroup(group: MaterialGroup): LibraryMaterial[] {
  return MATERIAL_LIBRARY.filter((m) => m.group === group);
}

export const MATERIAL_GROUPS: MaterialGroup[] = ["WOOD", "STONE", "METAL", "PAINT"];

export const MATERIAL_GROUP_LABEL_AR: Record<MaterialGroup, string> = {
  WOOD: "خشب",
  STONE: "حجر",
  METAL: "معدن",
  PAINT: "دهان",
};

export const MATERIAL_GROUP_LABEL_EN: Record<MaterialGroup, string> = {
  WOOD: "Wood",
  STONE: "Stone",
  METAL: "Metal",
  PAINT: "Paint",
};
