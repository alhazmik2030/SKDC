import type { MachineAdapter, CutPlan, EncodedOutput } from "../types";

/**
 * Generic CSV — جدول قطع بصيغة CSV.
 * يصلح لأي ماكينة تقبل قائمة قطع يدوية، أو للورش التي تقطع يدوياً.
 *
 * Columns: Label, Length(mm), Width(mm), Thickness(mm), Material, Grain, Qty, EdgeBanding, Unit
 */

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function edgeSummary(piece: CutPlan["pieces"][number]): string {
  const e = piece.edges;
  if (!e) return "—";
  const parts: string[] = [];
  if (e.top) parts.push(`T:${e.top.thicknessMm}`);
  if (e.bottom) parts.push(`B:${e.bottom.thicknessMm}`);
  if (e.left) parts.push(`L:${e.left.thicknessMm}`);
  if (e.right) parts.push(`R:${e.right.thicknessMm}`);
  return parts.length ? parts.join(" ") : "—";
}

export const genericCsvAdapter: MachineAdapter = {
  id: "generic-csv",
  name: "تصدير CSV",
  manufacturer: "OTHER",
  category: "MULTI_FUNCTION",
  capabilities: ["STRAIGHT_CUT"],
  outputFormat: "CSV",
  channel: "FILE_DOWNLOAD",

  encode(plan: CutPlan): EncodedOutput {
    const header = [
      "Label",
      "Length(mm)",
      "Width(mm)",
      "Thickness(mm)",
      "Material",
      "Grain",
      "Qty",
      "EdgeBanding",
      "SourceUnit",
    ].join(",");

    const rows = plan.pieces.map((p) =>
      [
        escapeCsv(p.label),
        p.length,
        p.width,
        p.thickness,
        escapeCsv(p.materialId),
        p.grain ?? "NONE",
        p.quantity,
        escapeCsv(edgeSummary(p)),
        escapeCsv(p.sourceUnitId ?? ""),
      ].join(","),
    );

    // Why: prefix with UTF-8 BOM so Excel (Windows) opens Arabic / Chinese
    // text correctly. Without it, Excel falls back to Windows-1252 and
    // mangles non-Latin labels into "ط©" / "â€" garbage.
    const contents = "﻿" + [header, ...rows].join("\r\n");
    const filename = `cutlist-${plan.projectName.replace(/\s+/g, "-")}.csv`;

    return {
      filename,
      mimeType: "text/csv;charset=utf-8",
      contents,
    };
  },
};

export default genericCsvAdapter;
