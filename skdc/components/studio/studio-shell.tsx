"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Template } from "@prisma/client";
import type {
  DesignerState,
  DesignerUnit,
  DesignerRoom,
} from "@/components/designer/types";
import { EMPTY_DESIGN } from "@/components/designer/types";
import { saveDesign } from "@/lib/actions/projects";
import { useI18n } from "@/components/i18n-provider";
import { getCategoryColor } from "@/components/designer/template-palette";
import { StudioTopbar } from "./studio-topbar";
import { StudioToolbar } from "./studio-toolbar";
import { StudioRail } from "./studio-rail";
import { StudioPalette } from "./studio-palette";
import { StudioInspector } from "./studio-inspector";
import { StudioBottomBar } from "./studio-bottom-bar";
import { StudioAIBar } from "./studio-ai-bar";
import { StudioStatusBar } from "./studio-status-bar";
import type {
  CameraPreset,
  TimeOfDay,
  StudioCategory,
} from "./studio-types";

const Scene3D = dynamic(
  () => import("@/components/designer3d/scene").then((m) => m.Scene3D),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center text-sm text-white/60">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    ),
  },
);

function makeId(): string {
  return `u_${Math.random().toString(36).slice(2, 10)}`;
}

export interface StudioProject {
  id: string;
  name: string;
}

export interface StudioShellProps {
  project: StudioProject;
  templates: Template[];
  initialDesign: DesignerState | null;
  initialRoom: Partial<DesignerRoom>;
}

export function StudioShell({
  project,
  templates,
  initialDesign,
  initialRoom,
}: StudioShellProps) {
  const { t } = useI18n();

  const startingDesign: DesignerState = React.useMemo(() => {
    if (initialDesign && Array.isArray(initialDesign.units)) {
      return {
        ...EMPTY_DESIGN,
        ...initialDesign,
        room: {
          ...EMPTY_DESIGN.room,
          ...initialDesign.room,
          ...initialRoom,
        },
      };
    }
    return {
      ...EMPTY_DESIGN,
      room: { ...EMPTY_DESIGN.room, ...initialRoom },
    };
  }, [initialDesign, initialRoom]);

  const [design, setDesign] = React.useState<DesignerState>(startingDesign);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [category, setCategory] = React.useState<StudioCategory | null>(
    "LOWER_CABINET",
  );
  const [camera, setCamera] = React.useState<CameraPreset>("perspective");
  const [time, setTime] = React.useState<TimeOfDay>("morning");
  const [isSaving, startSaving] = React.useTransition();
  const [lastSavedAt, setLastSavedAt] = React.useState<number | null>(null);

  const handleAddTemplate = React.useCallback(
    (template: Template) => {
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
      setDesign((d) => ({ ...d, units: [...d.units, unit] }));
      setSelectedId(unit.id);
    },
    [],
  );

  const handleUpdateSelected = React.useCallback(
    (patch: Partial<DesignerUnit>) => {
      if (!selectedId) return;
      setDesign((d) => ({
        ...d,
        units: d.units.map((u) =>
          u.id === selectedId ? { ...u, ...patch } : u,
        ),
      }));
    },
    [selectedId],
  );

  const handleDeleteSelected = React.useCallback(() => {
    if (!selectedId) return;
    setDesign((d) => ({
      ...d,
      units: d.units.filter((u) => u.id !== selectedId),
    }));
    setSelectedId(null);
  }, [selectedId]);

  const handleRotateSelected = React.useCallback(() => {
    if (!selectedId) return;
    setDesign((d) => ({
      ...d,
      units: d.units.map((u) => {
        if (u.id !== selectedId) return u;
        const next = ((u.rotation + 90) % 360) as 0 | 90 | 180 | 270;
        return { ...u, rotation: next };
      }),
    }));
  }, [selectedId]);

  const handleSave = React.useCallback(() => {
    startSaving(async () => {
      try {
        await saveDesign(project.id, design);
        setLastSavedAt(Date.now());
        toast.success(t("designer.saved"));
      } catch (err) {
        toast.error((err as Error).message || t("designer.saveFailed"));
      }
    });
  }, [project.id, design, t]);

  // Auto-save every 30s when there are units.
  React.useEffect(() => {
    if (design.units.length === 0) return;
    const id = window.setTimeout(() => {
      handleSave();
    }, 30_000);
    return () => window.clearTimeout(id);
  }, [design, handleSave]);

  const selectedUnit =
    design.units.find((u) => u.id === selectedId) ?? null;

  // Rough estimated price (very simple, kept here for status bar).
  const estimate = React.useMemo(() => {
    return design.units.reduce((sum, u) => {
      const area = (u.width * u.depth) / 1_000_000; // m²
      return sum + Math.round(area * 1500);
    }, 0);
  }, [design.units]);

  // Lighting intensity derived from the time-of-day pill.
  const ambientLightOn = time !== "night";

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 60% 40% at 65% 35%, rgba(167,139,250,0.10), transparent 60%), linear-gradient(180deg, #0d0d10 0%, #050507 100%)",
        color: "#f5f5f7",
        fontFamily: "Cairo, system-ui, sans-serif",
      }}
    >
      {/* === Fullscreen 3D canvas (behind every floating panel) === */}
      <div className="absolute inset-0">
        <Scene3D
          design={design}
          selectedId={selectedId}
          onSelect={setSelectedId}
          ambientLightOn={ambientLightOn}
        />
      </div>

      {/* === Top menu bar === */}
      <StudioTopbar
        projectId={project.id}
        lastSavedAt={lastSavedAt}
        isSaving={isSaving}
      />

      {/* === Toolbar (second row) === */}
      <StudioToolbar
        camera={camera}
        onCamera={setCamera}
        time={time}
        onSnapshot={() => toast.message(t("studio.snapshot"))}
        onShare={() => toast.message(t("studio.share"))}
        onPhotoreal={() => toast.message(t("studio.photoreal"))}
      />

      {/* === Center floating title pill === */}
      <div className="pointer-events-none absolute left-1/2 top-[52px] z-[41] -translate-x-1/2">
        <div
          className="rounded-full border px-4 py-1 text-[11px]"
          style={{
            background: "rgba(12,12,16,0.78)",
            backdropFilter: "blur(20px)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          {project.name}
          <span className="ms-2 text-[10px] text-white/55">
            {design.units.length} {t("designer.units")} ·{" "}
            {(design.room.width / 1000).toFixed(1)} ×{" "}
            {(design.room.depth / 1000).toFixed(1)} م
          </span>
        </div>
      </div>

      {/* === Right side: category rail === */}
      <StudioRail
        active={category}
        onSelect={(c) => setCategory(c)}
        templates={templates}
      />

      {/* === Slide-out templates palette === */}
      {category ? (
        <StudioPalette
          category={category}
          templates={templates}
          onAdd={handleAddTemplate}
        />
      ) : null}

      {/* === Left side: inspector === */}
      <StudioInspector
        unit={selectedUnit}
        onUpdate={handleUpdateSelected}
        onDelete={handleDeleteSelected}
        onRotate={handleRotateSelected}
      />

      {/* === Bottom center: camera + time pills === */}
      <StudioBottomBar
        camera={camera}
        onCamera={setCamera}
        time={time}
        onTime={setTime}
      />

      {/* === Bottom right: AI command bar === */}
      <StudioAIBar />

      {/* === Bottom slim status bar === */}
      <StudioStatusBar
        unitsCount={design.units.length}
        selectedName={selectedUnit?.templateName ?? null}
        estimate={estimate}
      />
    </div>
  );
}
