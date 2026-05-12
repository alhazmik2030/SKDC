import type { MachineAdapter, CutPlan, EncodedOutput } from "../types";

/**
 * Generic G-Code adapter — outputs a simple, conservative G-Code program
 * that runs on the vast majority of CNC routers (especially the Chinese
 * ones common in Saudi/Egyptian workshops).
 *
 * Strategy:
 *   - One file per sheet.
 *   - Imperial-free (mm only, G21).
 *   - Absolute coordinates (G90).
 *   - Tool 1 assumed = end mill, with safe Z = 5mm above surface.
 *
 * This is NOT a full nesting CAM — it just translates a pre-computed
 * CutPlan into machine moves. Real nesting/optimization happens upstream
 * in lib/cnc/nesting.
 */

function header(sheetId: string): string[] {
  return [
    `(SKDC G-Code Export — sheet ${sheetId})`,
    "G21",         // mm
    "G90",         // absolute
    "G17",         // XY plane
    "M3 S18000",   // spindle on, 18,000 rpm (typical wood router)
    "G0 Z5.0",     // safe height
  ];
}

function footer(): string[] {
  return [
    "G0 Z5.0",
    "M5",          // spindle off
    "M30",         // end program
  ];
}

/** Cut a rectangle (around a piece) using 4 straight lines. */
function cutRect(x: number, y: number, w: number, h: number, cutDepth: number): string[] {
  return [
    `G0 X${x.toFixed(2)} Y${y.toFixed(2)}`,
    `G1 Z-${cutDepth.toFixed(2)} F600`,
    `G1 X${(x + w).toFixed(2)} F1800`,
    `G1 Y${(y + h).toFixed(2)}`,
    `G1 X${x.toFixed(2)}`,
    `G1 Y${y.toFixed(2)}`,
    "G0 Z5.0",
  ];
}

export const gcodeCncAdapter: MachineAdapter = {
  id: "generic-cnc-gcode",
  name: "CNC Router عام (G-Code)",
  manufacturer: "GENERIC_CHINESE",
  category: "CNC_ROUTER",
  capabilities: ["STRAIGHT_CUT", "BORE"],
  outputFormat: "GCODE",
  channel: "FILE_DOWNLOAD",

  encode(plan: CutPlan): EncodedOutput {
    if (plan.sheets.length === 0) {
      throw new Error("CutPlan has no nested sheets — run nesting first.");
    }

    const sheets = plan.sheets.map((sheet) => {
      const lines: string[] = [];
      lines.push(...header(sheet.sheetId));

      const cutDepth = sheet.stock.thickness + 1; // 1mm overcut

      for (const placement of sheet.placements) {
        // Look up actual piece dimensions from plan.pieces
        const piece = plan.pieces.find((p) => p.id === placement.pieceId);
        if (!piece) continue;

        const w = placement.rotation === 90 ? piece.width : piece.length;
        const h = placement.rotation === 90 ? piece.length : piece.width;
        lines.push(`(piece ${piece.label})`);
        lines.push(...cutRect(placement.x, placement.y, w, h, cutDepth));
      }

      lines.push(...footer());
      return {
        filename: `${sheet.sheetId}.nc`,
        contents: lines.join("\n"),
      };
    });

    // Combine all sheet programs into one master file with a manifest.
    const manifest = [
      `(SKDC G-Code Manifest — ${plan.projectName})`,
      `(Generated: ${new Date().toISOString()})`,
      `(Sheets: ${plan.sheets.length})`,
      "",
      ...sheets.flatMap((s) => [`(--- ${s.filename} ---)`, s.contents, ""]),
    ].join("\n");

    const filename = `cutplan-${plan.projectName.replace(/\s+/g, "-")}.nc`;

    return {
      filename,
      mimeType: "text/plain;charset=utf-8",
      contents: manifest,
      attachments: sheets.map((s) => ({
        filename: s.filename,
        mimeType: "text/plain;charset=utf-8",
        contents: s.contents,
      })),
    };
  },
};

export default gcodeCncAdapter;
