"use client";

import * as React from "react";
import { RotateCw, Trash2, Move } from "lucide-react";
import type { DesignerUnit } from "./types";
import { Input } from "@/components/ui/input";

export function Inspector({
  unit,
  onUpdate,
  onDelete,
  onRotate,
}: {
  unit: DesignerUnit | null;
  onUpdate: (patch: Partial<DesignerUnit>) => void;
  onDelete: () => void;
  onRotate: () => void;
}) {
  if (!unit) {
    return (
      <div className="grid h-full place-items-center px-4 text-center text-xs text-muted-foreground">
        <div>
          <Move className="mx-auto mb-2 h-8 w-8 opacity-50" />
          اختر وحدة من الكانفاس لتعديل خصائصها
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/50 px-4 pb-3 pt-1">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          خصائص الوحدة
        </div>
        <div className="mt-1 truncate font-semibold">{unit.templateName}</div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        <Field label="العرض (مم)">
          <Input
            type="number"
            min="50"
            step="10"
            value={unit.width}
            onChange={(e) => onUpdate({ width: Number(e.target.value) || unit.width })}
          />
        </Field>
        <Field label="العمق (مم)">
          <Input
            type="number"
            min="50"
            step="10"
            value={unit.depth}
            onChange={(e) => onUpdate({ depth: Number(e.target.value) || unit.depth })}
          />
        </Field>
        <Field label="الارتفاع (مم)">
          <Input
            type="number"
            min="50"
            step="10"
            value={unit.height}
            onChange={(e) => onUpdate({ height: Number(e.target.value) || unit.height })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="X (مم)">
            <Input
              type="number"
              step="10"
              value={unit.x}
              onChange={(e) => onUpdate({ x: Number(e.target.value) || 0 })}
            />
          </Field>
          <Field label="Y (مم)">
            <Input
              type="number"
              step="10"
              value={unit.y}
              onChange={(e) => onUpdate({ y: Number(e.target.value) || 0 })}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onRotate}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-white/[0.02] py-2 text-xs hover:bg-white/5"
          >
            <RotateCw className="h-3.5 w-3.5" />
            تدوير 90°
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 py-2 text-xs text-rose-200 hover:bg-rose-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
