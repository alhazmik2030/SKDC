/**
 * SKDC — Universal Machine Integration Layer
 *
 * Plug-in architecture that lets ANY workshop machine (Beam Saw, CNC Router,
 * Edge Bander, Drilling, Nesting, etc.) consume the same canonical cut-data
 * produced by the designer.
 *
 * The flow:
 *   Project Design → CutPlan (canonical) → MachineAdapter.encode() → File/Stream → Machine
 *
 * To add a new machine:
 *   1. Pick a MachineCapability set.
 *   2. Create an adapter implementing `MachineAdapter`.
 *   3. Register it in `lib/machines/registry.ts`.
 *
 * The same CutPlan is consumable by every adapter — no coupling between
 * designer and machine vendor.
 */

// =====================================================================
// Machine categories (what the machine PHYSICALLY does)
// =====================================================================
export type MachineCategory =
  | "BEAM_SAW" //          منشار ألواح (يقطع الـ raw sheets إلى قطع)
  | "PANEL_SAW" //         منشار بانل (يدوي/شبه آلي — أبسط من Beam Saw)
  | "CNC_ROUTER" //        راوتر CNC (نقش + تفريز + قطع)
  | "NESTING_CNC" //       تفريز ذكي (يقص ويفرز بنفس المرور)
  | "EDGE_BANDER" //       لصق حواف (PVC / ABS)
  | "DRILLING_MACHINE" //  ماكينة ثقب (Dowel / cam-lock)
  | "BORING_MACHINE" //    ماكينة تخريم متعدد (multi-spindle)
  | "MEMBRANE_PRESS" //    مكبس غشاء (Vacuum forming)
  | "POSTFORMING" //       تشكيل سطح كاونتر
  | "MULTI_FUNCTION"; //   ماكينة متعددة الوظائف (combo)

// =====================================================================
// Capabilities — what the machine can DO with the CutPlan
// =====================================================================
export type MachineCapability =
  | "STRAIGHT_CUT" //      قطع مستقيم
  | "CURVED_CUT" //        قطع منحني
  | "BORE" //              ثقب
  | "GROOVE" //            تخديد
  | "EDGE_BAND" //         لصق حواف
  | "POCKET" //            تجويف داخلي
  | "ENGRAVE" //           نقش
  | "LABEL_PRINT"; //      طباعة ملصق (lable on each piece)

// =====================================================================
// Output formats supported by adapters
// =====================================================================
export type MachineFormat =
  | "DXF" //               AutoCAD — أكثر صيغة دعماً
  | "DWG" //               AutoCAD binary
  | "GCODE" //             G-Code (.nc, .gcode) — Generic CNC
  | "WOODWOP_MPR" //       Homag (.mpr / .mpr5)
  | "BIESSE_BPP" //        Biesse BSolid (.bpp)
  | "BIESSE_CIX" //        Biesse iXcube (.cix)
  | "SCM_XXL" //           SCM Maestro (.xxl)
  | "FELDER_PRO" //        Felder (.pro)
  | "HOMAG_BHX" //         Homag drilling (.bhx)
  | "ARDIS_OPTIMIZER" //   Ardis (.ardis)
  | "OPTIMIK" //           Optimik (.opt / .csv)
  | "CSV" //               Generic CSV (للماكينات البسيطة)
  | "JSON" //              Generic JSON (للماكينات الحديثة API-driven)
  | "PDF_REPORT"; //       PDF بشري (للقطع اليدوي)

// =====================================================================
// Direct integration channel — كيف الموقع يتكلم مع الماكينة (مستقبلاً)
// =====================================================================
export type MachineChannel =
  | "FILE_DOWNLOAD" //     المستخدم يحمل الملف ويغذيه يدوياً (الافتراضي)
  | "FILE_UPLOAD_FTP" //   الموقع يرفع لـ FTP الماكينة
  | "REST_API" //          الماكينة عندها REST API
  | "WEBSOCKET" //         اتصال مستمر للماكينات الذكية
  | "MQTT" //              IoT broker (Industry 4.0)
  | "OPC_UA" //            معيار صناعي (PLC machines)
  | "USB_AGENT"; //        agent محلي على PC الورشة يتلقى الملف ويحقنه

// =====================================================================
// Manufacturer registry (للعرض في UI + للملصقات)
// =====================================================================
export type Manufacturer =
  | "HOMAG"
  | "BIESSE"
  | "SCM"
  | "FELDER"
  | "WEINIG"
  | "ALTENDORF"
  | "GIBEN"
  | "HOLZMA"
  | "STRIEBIG"
  | "MARTIN"
  | "GENERIC_CHINESE"
  | "GENERIC_TURKISH"
  | "GENERIC_LOCAL"
  | "OTHER";

// =====================================================================
// Canonical cut data — what the designer produces
// =====================================================================

/** A single cut piece (a flat panel that comes out of the saw). */
export interface CutPiece {
  /** Unique within a CutPlan. */
  id: string;
  /** Human-readable label, e.g. "ضلفة سفلية 02" */
  label: string;
  /** Length and width in millimeters (FINISHED size — after edge banding). */
  length: number;
  width: number;
  /** Thickness in millimeters. */
  thickness: number;
  /** Material name/id — used to group pieces by sheet stock. */
  materialId: string;
  /** Grain direction matters for wood-look panels. */
  grain?: "LENGTH" | "WIDTH" | "NONE";
  /** Quantity of identical pieces. */
  quantity: number;
  /** Edge-banding spec per edge (mm). null = no banding on that edge. */
  edges?: {
    top?: EdgeBand | null;
    bottom?: EdgeBand | null;
    left?: EdgeBand | null;
    right?: EdgeBand | null;
  };
  /** Optional operations on this piece (drilling, grooves). */
  operations?: PieceOperation[];
  /** Source unit id (link back to the kitchen unit it belongs to). */
  sourceUnitId?: string;
}

/** Edge-banding tape spec. */
export interface EdgeBand {
  thicknessMm: number; // typical 0.4 / 1.0 / 2.0
  materialId: string; // matches a Material entry
}

/** An operation performed on a piece (after it's cut). */
export type PieceOperation =
  | { kind: "BORE"; x: number; y: number; depth: number; diameter: number; face: PieceFace }
  | { kind: "GROOVE"; startX: number; startY: number; endX: number; endY: number; depth: number; width: number; face: PieceFace }
  | { kind: "POCKET"; x: number; y: number; w: number; h: number; depth: number; face: PieceFace }
  | { kind: "LABEL"; text: string; x: number; y: number };

export type PieceFace = "TOP" | "BOTTOM" | "FRONT" | "BACK" | "LEFT" | "RIGHT";

/** Raw sheet stock that a Beam Saw chops down. */
export interface SheetStock {
  materialId: string;
  thickness: number;
  width: number; // e.g. 1220 / 2440
  length: number;
  /** Optional waste piece minimum size (anything smaller is offcut). */
  minOffcutMm?: number;
}

/** The canonical plan produced after nesting/optimization. */
export interface CutPlan {
  projectId: string;
  projectName: string;
  workspaceId: string;
  workspaceName: string;
  createdAt: string; // ISO
  /** Pre-nesting list of all pieces. */
  pieces: CutPiece[];
  /** Post-nesting layout: which sheet holds which pieces and where. */
  sheets: NestedSheet[];
  /** Optional aggregated operations for non-cut machines (driller, edge bander). */
  totals?: {
    pieceCount: number;
    sheetCount: number;
    edgeBandingMeters: number;
    boreCount: number;
    estimatedWastePercent: number;
  };
}

/** A single sheet of stock with its placed pieces. */
export interface NestedSheet {
  sheetId: string;
  stock: SheetStock;
  placements: PiecePlacement[];
  /** Wasted area (mm²) for analytics. */
  wasteAreaMm2?: number;
}

export interface PiecePlacement {
  pieceId: string;
  /** Top-left corner on the sheet (in mm), 0,0 = top-left of sheet. */
  x: number;
  y: number;
  /** Rotation: 0 or 90 (most cutting machines only do orthogonal). */
  rotation: 0 | 90;
}

// =====================================================================
// Adapter contract — every machine driver implements this
// =====================================================================
export interface MachineAdapter {
  /** Stable id, e.g. "homag-woodwop-v5". */
  id: string;
  /** Display name in UI. */
  name: string;
  manufacturer: Manufacturer;
  category: MachineCategory;
  capabilities: MachineCapability[];
  outputFormat: MachineFormat;
  channel: MachineChannel;
  /** Optional vendor-specific configuration schema (zod). */
  configSchema?: unknown;

  /**
   * Convert the canonical CutPlan into the machine's native payload.
   * Returns a serializable buffer/string AND a filename.
   */
  encode(plan: CutPlan, config?: Record<string, unknown>): Promise<EncodedOutput> | EncodedOutput;

  /**
   * Optional: send directly to machine if `channel !== FILE_DOWNLOAD`.
   * Returns a tracking handle (job id) so the UI can poll status.
   */
  transmit?(
    encoded: EncodedOutput,
    config: Record<string, unknown>,
  ): Promise<TransmitResult>;
}

export interface EncodedOutput {
  filename: string;
  mimeType: string;
  contents: string | Uint8Array;
  /** Some adapters produce multiple files (e.g. .bhx + .mpr). */
  attachments?: { filename: string; mimeType: string; contents: string | Uint8Array }[];
}

export interface TransmitResult {
  ok: boolean;
  jobId?: string;
  message?: string;
  error?: string;
}

// =====================================================================
// Common errors
// =====================================================================
export class MachineEncodingError extends Error {
  constructor(message: string, public readonly adapterId: string) {
    super(message);
    this.name = "MachineEncodingError";
  }
}

export class UnsupportedCapabilityError extends Error {
  constructor(
    public readonly capability: MachineCapability,
    public readonly adapterId: string,
  ) {
    super(
      `Adapter ${adapterId} does not support capability: ${capability}`,
    );
    this.name = "UnsupportedCapabilityError";
  }
}
