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
import { findFreeSpot, snapPosition } from "@/lib/designer/placement";

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
  const [snapshotRequest, setSnapshotRequest] = React.useState(0);

  // ============================================================
  // Undo/redo history. We keep `design` as the single source of truth and
  // wrap mutating handlers with `mutateDesign`, which snapshots the previous
  // state into `past` and clears the redo branch. Capped at 50 entries.
  // ============================================================
  const historyRef = React.useRef<{
    past: DesignerState[];
    future: DesignerState[];
  }>({ past: [], future: [] });
  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);

  const mutateDesign = React.useCallback(
    (updater: (d: DesignerState) => DesignerState) => {
      setDesign((d) => {
        const next = updater(d);
        if (next === d) return d;
        const past = historyRef.current.past;
        past.push(d);
        if (past.length > 50) past.shift();
        historyRef.current.future = [];
        setCanUndo(true);
        setCanRedo(false);
        return next;
      });
    },
    [],
  );

  const handleUndo = React.useCallback(() => {
    setDesign((d) => {
      const { past, future } = historyRef.current;
      if (past.length === 0) return d;
      const prev = past.pop()!;
      future.push(d);
      setCanUndo(past.length > 0);
      setCanRedo(true);
      return prev;
    });
  }, []);

  const handleRedo = React.useCallback(() => {
    setDesign((d) => {
      const { past, future } = historyRef.current;
      if (future.length === 0) return d;
      const next = future.pop()!;
      past.push(d);
      setCanRedo(future.length > 0);
      setCanUndo(true);
      return next;
    });
  }, []);

  const handleAddTemplate = React.useCallback(
    (template: Template) => {
      mutateDesign((d) => {
        const spot = findFreeSpot(
          d.units,
          {
            width: template.defaultWidth,
            depth: template.defaultDepth,
            category: template.category,
          },
          d.room,
        );
        const unit: DesignerUnit = {
          id: makeId(),
          templateId: template.id,
          templateName: template.name,
          category: template.category,
          x: spot.x,
          y: spot.y,
          width: template.defaultWidth,
          depth: template.defaultDepth,
          height: template.defaultHeight,
          rotation: 0,
          color: getCategoryColor(template.category),
        };
        setSelectedId(unit.id);
        return { ...d, units: [...d.units, unit] };
      });
    },
    [mutateDesign],
  );

  /**
   * Adds a GLB-backed unit. The unit shares the same DesignerUnit shape as
   * procedural units but carries a `glbUrl` so the 3D renderer picks the
   * GLBUnit branch instead of building cabinet boxes.
   */
  const handleAddGlbTemplate = React.useCallback(
    (template: KitchenTemplate) => {
      mutateDesign((d) => {
        const spot = findFreeSpot(
          d.units,
          {
            width: template.defaultWidth,
            depth: template.defaultDepth,
            category: template.category,
          },
          d.room,
        );
        const unit: DesignerUnit = {
          id: makeId(),
          templateId: null,
          templateName: template.nameAr ?? template.name,
          category: template.category,
          x: spot.x,
          y: spot.y,
          width: template.defaultWidth,
          depth: template.defaultDepth,
          height: template.defaultHeight,
          rotation: 0,
          color: getCategoryColor(template.category),
          glbUrl: template.glbUrl,
        };
        setSelectedId(unit.id);
        return { ...d, units: [...d.units, unit] };
      });
    },
    [mutateDesign],
  );

  const handleUpdateSelected = React.useCallback(
    (patch: Partial<DesignerUnit>) => {
      if (!selectedId) return;
      mutateDesign((d) => ({
        ...d,
        units: d.units.map((u) =>
          u.id === selectedId ? { ...u, ...patch } : u,
        ),
      }));
    },
    [selectedId, mutateDesign],
  );

  const handleDeleteSelected = React.useCallback(() => {
    if (!selectedId) return;
    mutateDesign((d) => ({
      ...d,
      units: d.units.filter((u) => u.id !== selectedId),
    }));
    setSelectedId(null);
  }, [selectedId, mutateDesign]);

  const handleRotateSelected = React.useCallback(() => {
    if (!selectedId) return;
    mutateDesign((d) => ({
      ...d,
      units: d.units.map((u) => {
        if (u.id !== selectedId) return u;
        const next = ((u.rotation + 90) % 360) as 0 | 90 | 180 | 270;
        return { ...u, rotation: next };
      }),
    }));
  }, [selectedId, mutateDesign]);

  /**
   * Material picker → design state. Walks every unit and stamps the chosen
   * library id onto the ones matching the requested scope.
   *   - "selected" → only the currently selected unit
   *   - "category" → every unit sharing the selected unit's category
   *   - "all"      → every unit in the design
   */
  /**
   * Drag-to-move via TransformControls. We pipe the proposed (x, y)
   * through snapPosition so the cabinet magnetically locks to walls and
   * adjacent units, refuses to overlap, and stays inside the room.
   * Wall-bound units (wallId set) are also released here so the
   * wall-driven transform stops overriding the mouse position.
   */
  const handleUnitTransform = React.useCallback(
    (unitId: string, next: { x: number; y: number }) => {
      mutateDesign((d) => {
        const dragged = d.units.find((u) => u.id === unitId);
        if (!dragged) return d;
        const others = d.units
          .filter((u) => u.id !== unitId)
          .map((u) => ({
            id: u.id,
            x: u.x,
            y: u.y,
            width: u.width,
            depth: u.depth,
            category: u.category,
          }));
        const snapped = snapPosition(
          {
            id: dragged.id,
            x: next.x,
            y: next.y,
            width: dragged.width,
            depth: dragged.depth,
            category: dragged.category,
          },
          others,
          d.room,
          next,
        );
        return {
          ...d,
          units: d.units.map((u) =>
            u.id === unitId
              ? {
                  ...u,
                  x: snapped.x,
                  y: snapped.y,
                  wallId: null,
                  wallOffset: null,
                }
              : u,
          ),
        };
      });
    },
    [mutateDesign],
  );

  const handleApplyMaterial = React.useCallback(
    (materialId: string, scope: MaterialApplyScope) => {
      mutateDesign((d) => {
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
    [selectedId, mutateDesign],
  );

  // ============================================================
  // Toolbar handlers: snapshot, share, photoreal.
  // ============================================================

  /** Bumps the snapshot request counter; scene captures the canvas. */
  const handleSnapshot = React.useCallback(() => {
    setSnapshotRequest((n) => n + 1);
  }, []);

  /** Called by the Scene3D once the snapshot PNG is ready. Triggers a
   * direct download so the designer keeps the file on their machine. */
  const handleSnapshotReady = React.useCallback(
    (dataUrl: string) => {
      const a = document.createElement("a");
      const safeName = project.name.replace(/[^\w؀-ۿ-]/g, "_").slice(0, 60);
      a.href = dataUrl;
      a.download = `${safeName}_${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(t("studio.snapshotSaved"));
    },
    [project.name, t],
  );

  /** Copies the current project URL to the clipboard so the designer can
   * paste it into chat / email. Falls back to a "select & copy" approach
   * when the secure clipboard API isn't available (insecure context). */
  const handleShare = React.useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast.success(t("studio.shareLinkCopied"));
      } else {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        toast.success(t("studio.shareLinkCopied"));
      }
    } catch (e) {
      toast.error((e as Error).message || t("studio.shareFailed"));
    }
  }, [t]);

  /** Photoreal pipeline is on the roadmap (cloud-rendered final image).
   * For now we tell the user it's coming so they don't think the button
   * silently failed. */
  const handlePhotoreal = React.useCallback(() => {
    toast.message(t("studio.photorealSoon"));
  }, [t]);

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

  // Keyboard shortcuts: Ctrl/Cmd+Z = undo, Ctrl/Cmd+Shift+Z or Ctrl+Y = redo,
  // Ctrl/Cmd+S = save. Skipped while focus is in an editable element.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tgt = e.target as HTMLElement | null;
      const editable =
        tgt &&
        (tgt.tagName === "INPUT" ||
          tgt.tagName === "TEXTAREA" ||
          tgt.isContentEditable);
      if (editable) return;
      const cmd = e.ctrlKey || e.metaKey;
      if (!cmd) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((k === "z" && e.shiftKey) || k === "y") {
        e.preventDefault();
        handleRedo();
      } else if (k === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleUndo, handleRedo, handleSave]);

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
          cameraPreset={camera}
          snapshotRequest={snapshotRequest}
          onSnapshot={handleSnapshotReady}
          onUnitTransform={handleUnitTransform}
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
        onSnapshot={handleSnapshot}
        onShare={handleShare}
        onPhotoreal={handlePhotoreal}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onTime={setTime}
        wallsPanelOpen={wallsPanelOpen}
        onToggleWalls={() => setWallsPanelOpen((v) => !v)}
        wallsCount={walls.length}
        hideWalls={hideWalls}
        onToggleHideWalls={() => setHideWalls((v) => !v)}
        materialsPickerOpen={materialsPickerOpen}
        onToggleMaterials={() => setMaterialsPickerOpen((v) => !v)}
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
          glbTemplates={glbTemplates}
          onAdd={handleAddTemplate}
          onAddGlb={handleAddGlbTemplate}
          onClose={() => setCategory(null)}
        />
      ) : null}

      {/* === Left side: inspector === */}
      <StudioInspector
        unit={selectedUnit}
        onUpdate={handleUpdateSelected}
        onDelete={handleDeleteSelected}
        onRotate={handleRotateSelected}
      />

      {/* === Bottom slim status bar === */}
      <StudioStatusBar
        unitsCount={design.units.length}
        selectedName={selectedUnit?.templateName ?? null}
        estimate={estimate}
      />
    </div>
  );
}
