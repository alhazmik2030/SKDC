"use client";

import * as React from "react";
import { toast } from "sonner";
import { Download, FileCode, FileSpreadsheet, FileJson, Loader2 } from "lucide-react";
import { generateExport } from "@/lib/actions/export";

const ADAPTERS = [
  { id: "generic-beamsaw-dxf", label: "DXF (Beam Saw)", icon: FileCode },
  { id: "generic-cnc-gcode", label: "G-Code (CNC)", icon: FileCode },
  { id: "generic-csv", label: "CSV (جدول قطع)", icon: FileSpreadsheet },
  { id: "generic-json", label: "JSON (API)", icon: FileJson },
];

export function ExportButtons({ projectId }: { projectId: string }) {
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const onExport = async (adapterId: string) => {
    setPendingId(adapterId);
    try {
      const result = await generateExport({ projectId, adapterId });

      // Trigger browser download.
      const blob = new Blob(
        [result.isBase64 ? atob(result.contents) : result.contents],
        { type: result.mimeType },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`تم تصدير ${result.totals?.pieceCount ?? 0} قطعة`);
    } catch (err) {
      toast.error((err as Error).message || "فشل التصدير");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {ADAPTERS.map((a) => {
        const Icon = a.icon;
        const isPending = pendingId === a.id;
        return (
          <button
            key={a.id}
            type="button"
            disabled={isPending}
            onClick={() => onExport(a.id)}
            className="group inline-flex items-center gap-3 rounded-xl border border-border bg-white/[0.02] px-4 py-3 text-sm transition-colors hover:border-violet-400/40 hover:bg-white/[0.04] disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-violet-300" />
            ) : (
              <Icon className="h-4 w-4 text-violet-300" />
            )}
            <span className="flex-1 text-right">{a.label}</span>
            <Download className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5" />
          </button>
        );
      })}
    </div>
  );
}
