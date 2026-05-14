"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type {
  KitchenTemplate,
  RoomShape,
  RoomWall,
  Template,
} from "@prisma/client";
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
import { StudioWallsPanel, type IslandData } from "./studio-walls-panel";
import {
  MaterialPicker,
  type MaterialApplyScope,
} from "./material-picker";
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
  /**
   * GLB library templates (high-detail Sketchfab / factory models). Optional
   * for backwards compatibility — pages that don't pass this default to an
   * empty list and only show procedural templates.
   */
  glbTemplates?: KitchenTemplate[];
  initialDesign: DesignerState | null;
  initialRoom: Partial<DesignerRoom>;
  walls: RoomWall[];
  shape: RoomShape | null;
  island: IslandData;
}

export function StudioShell({
  project,
  templates,
  glbTemplates = [],
  initialDesign,
  initialRoom,
  walls: initialWalls,
  shape: initialShape,
  island: initialIsland,
}: StudioShellProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [walls, setWalls] = React.useState<RoomWall[]>(initialWalls);
  const [shape, setShape] = React.useState<RoomShape | null>(initialShape);
  const [island, setIsland] = React.useState<IslandData>(initialIsland);
  const [wallsPanelOpen, setWallsPanelOpen] = React.useState(false);
  const [materialsPickerOpen, setMaterialsPickerOpen] = React.useState(false);

  React.useEffect(() => setWalls(initialWalls), [initialWalls]);
  React.useEffect(() => setShape(initialShape), [initialShape]);
  React.useEffect(() => setIsland(initialIsland), [initialIsland]);

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
  const [hideWalls, setHideWalls] = React.useState(false);
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

  /**
   * Adds a GLB-backed unit. The unit shares the same DesignerUnit shape as
   * procedural units but carries a `glbUrl` so the 3D renderer picks the
   * GLBUnit branch instead of building cabinet boxes.
   */
  const handleAddGlbTemplate = React.useCallback(
    (template: KitchenTemplate) => {
      const unit: DesignerUnit = {
        id: makeId(),
        templateId: null, // GLB templates live in a separate table
        templateName: template.nameAr ?? template.name,
        category: template.category,
        x: 100,
        y: 100,
        width: template.defaultWidth,
        depth: template.defaultDepth,
        height: template.defaultHeight,
        rotation: 0,
        color: getCategoryColor(template.category),
        glbUrl: template.glbUrl,
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

  /**
   * Material picker → design state. Walks every unit and stamps the chosen
   * library id onto the ones matching the requested scope.
   *   - "selected" → only the currently selected unit
   *   - "category" → every unit sharing the selected unit's category
   *   - "all"      → every unit in the design
   */
  const handleApplyMaterial = React.useCallback(
    (materialId: string, scope: MaterialApplyScope) => {
      setDesign((d) => {
        const selected = d.units.find((u) => u.id === selectedId) ?? null;
        return {
          ...d,
          units: d.units.map((u) => {
            const match =
              scope === "all" ||
              (scope === "selected" && u.id === selectedId) ||
              (scope === "category" && selected != null && u.category === selected.category);
            return match ? { ...u, materialId } : u;
          }),
        };
      });
    },
    [selectedId],
  );

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
          timeOfDay={time}
          walls={walls}
          island={island}
          hideWalls={hideWalls}
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

      {/* === Floating "Walls" pill, anchored above the rail. Always visible. === */}
      <button
        type="button"
        onClick={() => setWallsPanelOpen((v) => !v)}
        aria-pressed={wallsPanelOpen}
        aria-label="البنية والجدران"
        className="absolute end-3 top-[60px] z-[41] flex h-[34px] items-center gap-1.5 rounded-xl border px-3 text-[11px] font-bold transition-all"
        style={{
          background: wallsPanelOpen
            ? "linear-gradient(135deg, var(--theme-stop-1,#a78bfa), var(--theme-stop-3,#38bdf8))"
            : "rgba(8,8,12,0.92)",
          color: wallsPanelOpen ? "#fff" : "rgba(255,255,255,0.85)",
          borderColor: wallsPanelOpen
            ? "transparent"
            : "rgba(255,255,255,0.08)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          boxShadow: wallsPanelOpen
            ? "0 8px 24px -8px var(--theme-halo,rgba(167,139,250,0.55))"
            : "0 20px 40px -16px rgba(0,0,0,0.65)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-3.5 w-3.5"
          aria-hidden
        >
          <rect x="3" y="6" width="18" height="12" rx="1" />
          <line x1="9" y1="6" x2="9" y2="18" />
          <line x1="15" y1="6" x2="15" y2="18" />
        </svg>
        <span>الجدران</span>
        {walls.length > 0 ? (
          <span
            className="grid h-4 min-w-[16px] place-items-center rounded-full px-1 text-[9px] font-black"
            style={{
              background: wallsPanelOpen
                ? "rgba(255,255,255,0.25)"
                : "rgba(167,139,250,0.20)",
              color: wallsPanelOpen ? "#fff" : "#e0d4ff",
            }}
          >
            {walls.length}
          </span>
        ) : null}
      </button>

      {/* === "Hide walls" pill — anchored below the Walls pill ===
          Lets the designer take clean product shots of the cabinets without
          the surrounding walls or floor. Wall-bound units keep their
          position (their world transform was already baked from the wall
          geometry), so toggling this on/off is a pure visual change. */}
      <button
        type="button"
        onClick={() => setHideWalls((v) => !v)}
        aria-pressed={hideWalls}
        aria-label={hideWalls ? "إظهار الجدران" : "إخفاء الجدران للقطة نظيفة"}
        title={hideWalls ? "إظهار الجدران" : "إخفاء الجدران للقطة نظيفة"}
        className="absolute end-3 top-[100px] z-[41] flex h-[34px] items-center gap-1.5 rounded-xl border px-3 text-[11px] font-bold transition-all"
        style={{
          background: hideWalls
            ? "linear-gradient(135deg, var(--theme-stop-2,#f0abfc), var(--theme-stop-3,#38bdf8))"
            : "rgba(8,8,12,0.92)",
          color: hideWalls ? "#fff" : "rgba(255,255,255,0.85)",
          borderColor: hideWalls ? "transparent" : "rgba(255,255,255,0.08)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          boxShadow: hideWalls
            ? "0 8px 24px -8px var(--theme-halo,rgba(167,139,250,0.55))"
            : "0 20px 40px -16px rgba(0,0,0,0.65)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden
        >
          {hideWalls ? (
            <>
              {/* eye-off icon */}
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </>
          ) : (
            <>
              {/* eye icon */}
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </>
          )}
        </svg>
        <span>{hideWalls ? "إظهار الجدران" : "إخفاء"}</span>
      </button>

      {/* === Floating "Materials" pill — opens the rich PBR material picker. ===
          Anchored under the Hide-walls pill, same visual pattern. */}
      <button
        type="button"
        onClick={() => setMaterialsPickerOpen((v) => !v)}
        aria-pressed={materialsPickerOpen}
        aria-label="مكتبة الخامات"
        title="مكتبة الخامات"
        className="absolute end-3 top-[140px] z-[41] flex h-[34px] items-center gap-1.5 rounded-xl border px-3 text-[11px] font-bold transition-all"
        style={{
          background: materialsPickerOpen
            ? "linear-gradient(135deg, var(--theme-stop-1,#a78bfa), var(--theme-stop-3,#38bdf8))"
            : "rgba(8,8,12,0.92)",
          color: materialsPickerOpen ? "#fff" : "rgba(255,255,255,0.85)",
          borderColor: materialsPickerOpen
            ? "transparent"
            : "rgba(255,255,255,0.08)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          boxShadow: materialsPickerOpen
            ? "0 8px 24px -8px var(--theme-halo,rgba(167,139,250,0.55))"
            : "0 20px 40px -16px rgba(0,0,0,0.65)",
        }}
      >
        {/* Palette / swatch icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden
        >
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
        </svg>
        <span>خامات</span>
      </button>

      {/* === Walls panel (collapsible, always reachable) === */}
      {wallsPanelOpen ? (
        <StudioWallsPanel
          projectId={project.id}
          walls={walls}
          shape={shape}
          island={island}
          room={{
            width: design.room.width,
            depth: design.room.depth,
          }}
          onClose={() => setWallsPanelOpen(false)}
          onWallChanged={(next) =>
            setWalls((prev) => prev.map((w) => (w.id === next.id ? next : w)))
          }
          onShapeChanged={() => {
            // Shape regenerates walls server-side; refresh from the server.
            router.refresh();
          }}
          onIslandChanged={setIsland}
        />
      ) : null}

      {/* === Material picker (collapsible) === */}
      {materialsPickerOpen ? (
        <MaterialPicker
          currentMaterialId={selectedUnit?.materialId ?? null}
          hasSelection={selectedUnit != null}
          hasCategory={selectedUnit != null}
          categoryLabel={
            selectedUnit
              ? t(`template.category.${selectedUnit.category}`)
              : null
          }
          onApply={handleApplyMaterial}
          onClose={() => setMaterialsPickerOpen(false)}
        />
      ) : null}

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
