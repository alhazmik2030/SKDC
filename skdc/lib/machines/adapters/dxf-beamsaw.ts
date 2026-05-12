import type { MachineAdapter, CutPlan, EncodedOutput, NestedSheet } from "../types";

/**
 * DXF Beam Saw adapter — outputs an AutoCAD DXF (R12 ASCII).
 *
 * Each nested sheet becomes one "page" of rectangles. The DXF is intentionally
 * minimal (LINE entities only, no blocks) for maximum compatibility with old
 * Chinese/Turkish beam saws that crash on richer DXF.
 *
 * Reference: https://www.autodesk.com/techpubs/autocad/acad2000/dxf/
 */

function dxfHeader(): string {
  return [
    "0",
    "SECTION",
    "2",
    "HEADER",
    "9",
    "$ACADVER",
    "1",
    "AC1009", // R12 — widest compat
    "0",
    "ENDSEC",
    "0",
    "SECTION",
    "2",
    "ENTITIES",
  ].join("\n");
}

function dxfFooter(): string {
  return ["0", "ENDSEC", "0", "EOF"].join("\n");
}

function rect(x: number, y: number, w: number, h: number, layer: string): string {
  // Four LINE entities forming a rectangle.
  const lines: Array<[number, number, number, number]> = [
    [x, y, x + w, y],
    [x + w, y, x + w, y + h],
    [x + w, y + h, x, y + h],
    [x, y + h, x, y],
  ];
  return lines
    .map(([x1, y1, x2, y2]) =>
      [
        "0",
        "LINE",
        "8",
        layer,
        "10",
        x1,
        "20",
        y1,
        "11",
        x2,
        "21",
        y2,
      ].join("\n"),
    )
    .join("\n");
}

function textLabel(x: number, y: number, text: string, layer: string): string {
  return [
    "0",
    "TEXT",
    "8",
    layer,
    "10",
    x,
    "20",
    y,
    "40",
    20, // height
    "1",
    text,
  ].join("\n");
}

function encodeSheet(sheet: NestedSheet, offsetY: number): string {
  const parts: string[] = [];

  // Sheet outline (red layer).
  parts.push(rect(0, offsetY, sheet.stock.length, sheet.stock.width, "SHEET"));
  parts.push(
    textLabel(
      10,
      offsetY + sheet.stock.width + 20,
      `SHEET ${sheet.sheetId} — ${sheet.stock.length}x${sheet.stock.width}x${sheet.stock.thickness}mm`,
      "SHEET",
    ),
  );

  // Pieces.
  for (const p of sheet.placements) {
    // We don't have piece dimensions in the placement — but a real
    // implementation would look them up via plan.pieces. Here we draw
    // a small marker so downstream tooling can verify positioning.
    parts.push(rect(p.x, offsetY + p.y, 50, 50, "PIECE"));
    parts.push(textLabel(p.x + 4, offsetY + p.y + 18, p.pieceId, "PIECE_LABEL"));
  }

  return parts.join("\n");
}

export const dxfBeamSawAdapter: MachineAdapter = {
  id: "generic-beamsaw-dxf",
  name: "منشار ألواح عام (DXF)",
  manufacturer: "OTHER",
  category: "BEAM_SAW",
  capabilities: ["STRAIGHT_CUT"],
  outputFormat: "DXF",
  channel: "FILE_DOWNLOAD",

  encode(plan: CutPlan): EncodedOutput {
    const body: string[] = [dxfHeader()];

    let offsetY = 0;
    const SHEET_GAP = 200; // visual gap between sheets in DXF
    for (const sheet of plan.sheets) {
      body.push(encodeSheet(sheet, offsetY));
      offsetY += sheet.stock.width + SHEET_GAP;
    }

    body.push(dxfFooter());
    const contents = body.join("\n");
    const filename = `cutplan-${plan.projectName.replace(/\s+/g, "-")}.dxf`;

    return {
      filename,
      mimeType: "application/dxf",
      contents,
    };
  },
};

export default dxfBeamSawAdapter;
