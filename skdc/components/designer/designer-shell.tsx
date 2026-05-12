"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Loader2, Save, Undo2, Redo2 } from "lucide-react";
import type { Template } from "@prisma/client";
import { TemplatePalette, getCategoryColor } from "./template-palette";
import { Inspector } from "./inspector";
import {
  type DesignerState,
  type DesignerUnit,
  type DesignerRoom,
  EMPTY_DESIGN,
} from "./types";
import { saveDesign } from "@/lib/actions/projects";

// Konva is browser-only — avoid SSR.
const Canvas2D = dynamic(() => import("./canvas-2d").then((m) => m.Canvas2D), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-xs text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  ),
});

function makeId() {
  return `u_${Math.random().toString(36).slice(2, 10)}`;
}

export function DesignerShell({
  projectId,
  initialDesign,
  initialRoom,
  templates,
}: {
  projectId: string;
  initialDesign: DesignerState | null;
  initialRoom: Partial<DesignerRoom> | null;
  templates: Template[];
}) {
  const startingDesign: DesignerState = React.useMemo(() => {
    if (initialDesign && Array.isArray(initialDesign.units)) {
      return {
        ...EMPTY_DESIGN,
        ...initialDesign,
        room: { ...EMPTY_DESIGN.room, ...initialDesign.room, ...(initialRoom ?? {}) },
      };
    }
    return {
      ...EMPTY_DESIGN,
      room: { ...EMPTY_DESIGN.room, ...(initialRoom ?? {}) },
    };
  }, [initialDesign, initialRoom]);

  const [design, setDesign] = React.useState<DesignerState>(startingDesign);
  const [history, setHistory] = React.useState<DesignerState[]>([startingDesign]);
  const [histIdx, setHistIdx] = React.useState(0);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [isSaving, startSaving] = React.useTransition();

  const pushHistory = React.useCallback(
    (next: DesignerState) => {
      const trimmed = history.slice(0, histIdx + 1);
      const newHistory = [...trimmed, next].slice(-50);
      setHistory(newHistory);
      setHistIdx(newHistory.length - 1);
      setDesign(next);
    },
    [history, histIdx],
  );

  const onAddTemplate = (template: Template) => {
    const unit: DesignerUnit = {
      id: makeId(),
      templateId: template.id,
      templateName: template.name,
      category: template.category,
      x: 100,
      y: 100,
      width: template.defaultWidth,
      depth: template.defaultDepth,
      height: template.defaultHeight,
      rotation: 0,
      color: getCategoryColor(template.category),
    };
    pushHistory({ ...design, units: [...design.units, unit] });
    setSelectedId(unit.id);
  };

  const onMoveUnit = (id: string, x: number, y: number) => {
    pushHistory({
      ...design,
      units: design.units.map((u) => (u.id === id ? { ...u, x, y } : u)),
    });
  };

  const updateSelected = (patch: Partial<DesignerUnit>) => {
    if (!selectedId) return;
    pushHistory({
      ...design,
      units: design.units.map((u) => (u.id === selectedId ? { ...u, ...patch } : u)),
    });
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    pushHistory({
      ...design,
      units: design.units.filter((u) => u.id !== selectedId),
    });
    setSelectedId(null);
  };

  const rotateSelected = () => {
    if (!selectedId) return;
    const next = ((design.units.find((u) => u.id === selectedId)?.rotation ?? 0) + 90) % 360 as
      | 0
      | 90
      | 180
      | 270;
    updateSelected({ rotation: next });
  };

  const undo = () => {
    if (histIdx > 0) {
      setHistIdx(histIdx - 1);
      setDesign(history[histIdx - 1]);
    }
  };
  const redo = () => {
    if (histIdx < history.length - 1) {
      setHistIdx(histIdx + 1);
      setDesign(history[histIdx + 1]);
    }
  };

  const save = () => {
    startSaving(async () => {
      try {
        await saveDesign(projectId, design);
        toast.success("تم الحفظ");
      } catch (err) {
        toast.error((err as Error).message || "فشل الحفظ");
      }
    });
  };

  const selectedUnit = design.units.find((u) => u.id === selectedId) ?? null;

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-border bg-card/40">
      {/* Right sidebar: template palette (RTL = first column visually right) */}
      <aside className="glass flex w-64 shrink-0 flex-col border-l border-border/60 p-2">
        <div className="border-b border-border/50 px-2 pb-2 pt-1">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            القوالب
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground/70">
            اضغط على قالب لإضافته
          </div>
        </div>
        <TemplatePalette templates={templates} onAdd={onAddTemplate} />
      </aside>

      {/* Center: canvas */}
      <main className="relative flex-1 flex-col p-2">
        {/* Toolbar */}
        <div className="glass mb-2 flex items-center justify-between gap-2 rounded-xl px-3 py-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={undo}
              disabled={histIdx === 0}
              className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground disabled:opacity-30"
              title="تراجع"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={histIdx >= history.length - 1}
              className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground disabled:opacity-30"
              title="إعادة"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
            <div className="mx-2 h-5 w-px bg-border" />
            <span className="text-[10px] text-muted-foreground">
              {design.units.length} وحدة
            </span>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-white to-white/90 px-3 py-1.5 text-xs font-semibold text-background shadow-md disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            حفظ
          </button>
        </div>

        <div className="h-[calc(100%-3.5rem)]">
          <Canvas2D
            design={design}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onMoveUnit={onMoveUnit}
          />
        </div>
      </main>

      {/* Left sidebar: inspector */}
      <aside className="glass w-72 shrink-0 border-r border-border/60">
        <Inspector
          unit={selectedUnit}
          onUpdate={updateSelected}
          onDelete={deleteSelected}
          onRotate={rotateSelected}
        />
      </aside>
    </div>
  );
}
