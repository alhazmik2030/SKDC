import type { MachineAdapter, Manufacturer, MachineCategory, MachineFormat } from "./types";

/**
 * Central registry of all machine adapters supported by SKDC.
 *
 * Adapters are registered lazily so we don't load vendor-specific code paths
 * unless a workshop actually owns that machine. This keeps bundle size sane.
 *
 * Adding a new machine:
 *   1. Implement `MachineAdapter` in lib/machines/adapters/<vendor>.ts
 *   2. Register it here (id, manufacturer, category, format, loader).
 *   3. Add UI metadata to `MACHINE_CATALOG` below.
 */

type AdapterLoader = () => Promise<MachineAdapter>;

interface RegistryEntry {
  id: string;
  name: string;
  manufacturer: Manufacturer;
  category: MachineCategory;
  outputFormat: MachineFormat;
  /** Short Arabic description for UI. */
  description: string;
  /** Dynamically imports the adapter when needed. */
  load: AdapterLoader;
  /** Indicates if the adapter is implemented or just declared. */
  status: "READY" | "BETA" | "PLANNED";
}

// =====================================================================
// Registry — single source of truth
// =====================================================================
export const MACHINE_REGISTRY: RegistryEntry[] = [
  // ---------- Beam Saws ----------
  {
    id: "generic-beamsaw-dxf",
    name: "منشار ألواح عام (DXF)",
    manufacturer: "OTHER",
    category: "BEAM_SAW",
    outputFormat: "DXF",
    description: "ملف DXF عام يقبله معظم مناشير الألواح في السوق.",
    status: "READY",
    load: async () => (await import("./adapters/dxf-beamsaw")).default,
  },
  {
    id: "homag-beamsaw",
    name: "Homag Beam Saw",
    manufacturer: "HOMAG",
    category: "BEAM_SAW",
    outputFormat: "WOODWOP_MPR",
    description: "ملف WoodWop MPR لمناشير Homag الألمانية.",
    status: "PLANNED",
    load: async () => (await import("./adapters/homag-beamsaw")).default,
  },
  {
    id: "biesse-beamsaw",
    name: "Biesse Selco",
    manufacturer: "BIESSE",
    category: "BEAM_SAW",
    outputFormat: "BIESSE_BPP",
    description: "BPP لـ Biesse Selco beam saws.",
    status: "PLANNED",
    load: async () => (await import("./adapters/biesse-beamsaw")).default,
  },

  // ---------- CNC Routers ----------
  {
    id: "generic-cnc-gcode",
    name: "CNC Router عام (G-Code)",
    manufacturer: "GENERIC_CHINESE",
    category: "CNC_ROUTER",
    outputFormat: "GCODE",
    description: "G-Code قياسي يعمل مع أكثر CNC routers الصينية والمحلية.",
    status: "READY",
    load: async () => (await import("./adapters/gcode-cnc")).default,
  },

  // ---------- Nesting CNC ----------
  {
    id: "biesse-rover-nesting",
    name: "Biesse Rover (Nesting)",
    manufacturer: "BIESSE",
    category: "NESTING_CNC",
    outputFormat: "BIESSE_CIX",
    description: "تفريز ذكي لـ Biesse Rover series.",
    status: "PLANNED",
    load: async () => (await import("./adapters/biesse-rover")).default,
  },

  // ---------- Edge Banders ----------
  {
    id: "homag-edgebander",
    name: "Homag Edge Bander",
    manufacturer: "HOMAG",
    category: "EDGE_BANDER",
    outputFormat: "CSV",
    description: "CSV بقائمة الحواف ومقاساتها.",
    status: "PLANNED",
    load: async () => (await import("./adapters/homag-edgebander")).default,
  },

  // ---------- Drilling ----------
  {
    id: "homag-drilling-bhx",
    name: "Homag Drilling (BHX)",
    manufacturer: "HOMAG",
    category: "DRILLING_MACHINE",
    outputFormat: "HOMAG_BHX",
    description: "ملف BHX للتثقيب المتعدد.",
    status: "PLANNED",
    load: async () => (await import("./adapters/homag-bhx")).default,
  },

  // ---------- Generic fallbacks (universal) ----------
  {
    id: "generic-csv",
    name: "تصدير CSV (جدول قطع)",
    manufacturer: "OTHER",
    category: "MULTI_FUNCTION",
    outputFormat: "CSV",
    description: "جدول قطع بصيغة CSV — يصلح لأي ماكينة تقبل تغذية يدوية.",
    status: "READY",
    load: async () => (await import("./adapters/generic-csv")).default,
  },
  {
    id: "generic-json",
    name: "تصدير JSON (API)",
    manufacturer: "OTHER",
    category: "MULTI_FUNCTION",
    outputFormat: "JSON",
    description: "JSON لاستهلاكه عبر API من نظام الورشة الخاص.",
    status: "READY",
    load: async () => (await import("./adapters/generic-json")).default,
  },
  {
    id: "generic-pdf",
    name: "تقرير PDF (يدوي)",
    manufacturer: "OTHER",
    category: "MULTI_FUNCTION",
    outputFormat: "PDF_REPORT",
    description: "PDF احترافي للورش التي تقطع يدوياً.",
    status: "PLANNED",
    load: async () => (await import("./adapters/pdf-report")).default,
  },
];

// =====================================================================
// Helpers
// =====================================================================
export function listReady(): RegistryEntry[] {
  return MACHINE_REGISTRY.filter((e) => e.status === "READY");
}

export function findAdapter(id: string): RegistryEntry | undefined {
  return MACHINE_REGISTRY.find((e) => e.id === id);
}

export async function loadAdapter(id: string): Promise<MachineAdapter> {
  const entry = findAdapter(id);
  if (!entry) throw new Error(`Unknown adapter: ${id}`);
  if (entry.status === "PLANNED") {
    throw new Error(`Adapter ${id} is planned but not yet implemented.`);
  }
  return entry.load();
}

export function listByCategory(category: MachineCategory): RegistryEntry[] {
  return MACHINE_REGISTRY.filter((e) => e.category === category);
}

export function listByManufacturer(m: Manufacturer): RegistryEntry[] {
  return MACHINE_REGISTRY.filter((e) => e.manufacturer === m);
}
