"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
import type { RoomWall, Template } from "@prisma/client";
import { useI18n } from "@/components/i18n-provider";
import { saveDesign } from "@/lib/actions/projects";
import type { DesignerState, DesignerUnit } from "@/components/designer/types";
import { EMPTY_DESIGN } from "@/components/designer/types";
import { getCategoryColor } from "@/components/designer/template-palette";
import { ElevationView, defaultBaseHeight } from "./elevation-view";

const AUTOSAVE_MS = 700;
const SAVED_BADGE_MS = 1400;
type SaveState = "idle" | "saving" | "saved";

const CATEGORY_ORDER = [
  "LOWER_CABINET",
  "UPPER_CABINET",
  "CORNER",
  "TALL_CABINET",
  "DRAWER",
  "APPLIANCE",
  "ACCESSORY",
] as const;

const CATEGORY_LABEL: Record<string, string> = {
  LOWER_CABINET: "وحدات سفلية",
  UPPER_CABINET: "وحدات علوية",
  CORNER: "زاوية",
  TALL_CABINET: "وحدات عمودية",
  DRAWER: "أدراج",
  APPLIANCE: "أجهزة",
  ACCESSORY: "إكسسوارات",
};

export function WallAssembly({
  projectId,
  walls,
  templates,
  initialDesign,
  roomDims,
}: {
  projectId: string;
  walls: RoomWall[];
  templates: Template[];
  initialDesign: DesignerState | null;
  roomDims: { width: number; depth: number; height: number };
}) {
  const router = useRouter();
  const { t, dir } = useI18n();
  const rtl = dir === "rtl";
  const Forward = rtl ? ArrowLeft : ArrowRight;
  const Back = rtl ? ArrowRight : ArrowLeft;

  const seed: DesignerState =
    initialDesign && initialDesign.units
      ? { ...initialDesign, room: roomDims }
      : { ...EMPTY_DESIGN, room: roomDims };

  const [design, setDesign] = React.useState<DesignerState>(seed);
  const [activeWallId, setActiveWallId] = React.useState<string>(walls[0]?.id ?? "");
  const [selectedUnitId, setSelectedUnitId] = React.useState<string | null>(null);
  const [activeCategory, setActiveCategory] =
    React.useState<(typeof CATEGORY_ORDER)[number]>("LOWER_CABINET");
  const [saveState, setSaveState] = React.useState<SaveState>("idle");

  const undoStack = React.useRef<DesignerState[]>([]);
  const debounceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    [],
  );

  const activeWall = walls.find((w) => w.id === activeWallId);
  const wallUnits = design.units.filter((u) => u.wallId === activeWallId);
  const usedMm = wallUnits.reduce((sum, u) => sum + u.width, 0);
  const remainingMm = Math.max(0, (activeWall?.length ?? 0) - usedMm);
  const fillPct = activeWall
    ? Math.min(100, (usedMm / activeWall.length) * 100)
    : 0;

  function pushUndo(snapshot: DesignerState) {
    undoStack.current.push(snapshot);
    if (undoStack.current.length > 60) undoStack.current.shift();
  }

  async function flush(state: DesignerState) {
    setSaveState("saving");
    try {
      await saveDesign(projectId, state);
      setSaveState("saved");
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaveState("idle"), SAVED_BADGE_MS);
    } catch {
      setSaveState("idle");
    }
  }

  function commit(next: DesignerState, opts?: { skipUndo?: boolean }) {
    if (!opts?.skipUndo) pushUndo(design);
    setDesign(next);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => flush(next), AUTOSAVE_MS);
  }

  function handleUndo() {
    const prev = undoStack.current.pop();
    if (!prev) return;
    setDesign(prev);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => flush(prev), AUTOSAVE_MS);
  }

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z") && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design]);

  function addTemplate(tpl: Template) {
    if (!activeWall) return;
    const baseHeight = defaultBaseHeight(tpl.category);
    const offset = Math.min(usedMm, Math.max(0, activeWall.length - tpl.defaultWidth));
    const unit: DesignerUnit = {
      id: cryptoId(),
      templateId: tpl.id,
      templateName: tpl.name,
      category: tpl.category,
      x: 0,
      y: 0,
      width: tpl.defaultWidth,
      depth: tpl.defaultDepth,
      height: tpl.defaultHeight,
      rotation: 0,
      color: getCategoryColor(tpl.category),
      wallId: activeWallId,
      wallOffset: offset,
      baseHeight,
    };
    commit({ ...design, units: [...design.units, unit] });
    setSelectedUnitId(unit.id);
  }

  function patchUnit(id: string, patch: Partial<DesignerUnit>) {
    commit({
      ...design,
      units: design.units.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    });
  }

  function deleteUnit(id: string) {
    commit({
      ...design,
      units: design.units.filter((u) => u.id !== id),
    });
    if (selectedUnitId === id) setSelectedUnitId(null);
  }

  function moveUnit(id: string, nextOffset: number) {
    // mid-drag move — write directly, debounced flush picks it up.
    setDesign((prev) => ({
      ...prev,
      units: prev.units.map((u) =>
        u.id === id ? { ...u, wallOffset: nextOffset } : u,
      ),
    }));
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const snapshot: DesignerState = {
        ...design,
        units: design.units.map((u) =>
          u.id === id ? { ...u, wallOffset: nextOffset } : u,
        ),
      };
      pushUndo(design);
      flush(snapshot);
    }, AUTOSAVE_MS);
  }

  async function handleFinish() {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    await flush(design);
    router.push(`/dashboard/projects/${projectId}/studio?skipWizard=1`);
  }

  function handleBack() {
    router.push(`/dashboard/projects/${projectId}/studio/walls`);
  }

  const categoryTemplates = templates.filter((tp) => tp.category === activeCategory);
  const selectedUnit = design.units.find((u) => u.id === selectedUnitId) ?? null;

  return (
    <div className="space-y-4">
      {/* Wall tabs */}
      <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-border bg-card/40 p-2 backdrop-blur-md">
        {walls.map((w) => {
          const isActive = w.id === activeWallId;
          const countOnWall = design.units.filter((u) => u.wallId === w.id).length;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => {
                setActiveWallId(w.id);
                setSelectedUnitId(null);
              }}
              aria-pressed={isActive}
              className={[
                "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-white shadow-lg"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              ].join(" ")}
              style={
                isActive
                  ? {
                      background:
                        "linear-gradient(135deg, var(--theme-stop-1,#a78bfa) 0%, var(--theme-stop-2,#f0abfc) 50%, var(--theme-stop-3,#38bdf8) 100%)",
                    }
                  : undefined
              }
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white/15 text-[10px] font-bold">
                {w.label}
              </span>
              <span className="tabular-nums">{Math.round(w.length)} مم</span>
              {countOnWall > 0 && (
                <span className="rounded-full bg-emerald-400/20 px-1.5 py-px text-[9px] text-emerald-200">
                  {countOnWall}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr_280px]">
        {/* Palette */}
        <div className="glass max-h-[70vh] overflow-y-auto rounded-2xl p-3">
          <div className="mb-2 flex flex-wrap gap-1">
            {CATEGORY_ORDER.map((cat) => {
              const isActive = cat === activeCategory;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={[
                    "rounded-lg px-2 py-1 text-[10px] font-medium transition-colors",
                    isActive
                      ? "bg-white/15 text-foreground"
                      : "text-muted-foreground hover:bg-white/5",
                  ].join(" ")}
                  style={
                    isActive
                      ? { boxShadow: `inset 0 0 0 1px ${getCategoryColor(cat)}` }
                      : undefined
                  }
                >
                  {CATEGORY_LABEL[cat]}
                </button>
              );
            })}
          </div>
          <div className="space-y-1.5">
            {categoryTemplates.length === 0 ? (
              <p className="px-2 py-3 text-center text-[11px] text-muted-foreground">
                لا توجد قوالب في هذه الفئة بعد.
              </p>
            ) : (
              categoryTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => addTemplate(tpl)}
                  className="group flex w-full items-center gap-2 rounded-xl border border-border bg-white/[0.02] px-2.5 py-2 text-start transition-colors hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <span
                    aria-hidden
                    className="h-7 w-7 shrink-0 rounded-md"
                    style={{
                      background: `linear-gradient(135deg, ${getCategoryColor(tpl.category)} 0%, ${getCategoryColor(tpl.category)}88 100%)`,
                    }}
                  />
                  <span className="flex-1 truncate text-xs font-medium">
                    {tpl.name}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {tpl.defaultWidth}×{tpl.defaultHeight}
                  </span>
                  <Plus className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Elevation */}
        <div className="glass rounded-2xl p-4">
          {activeWall ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold">
                  <span className="text-gradient">
                    منظر جانبي — جدار {activeWall.label}
                  </span>
                </h3>
                <SaveBadge state={saveState} t={t} />
              </div>
              <ElevationView
                wall={activeWall}
                units={wallUnits}
                selectedId={selectedUnitId}
                onSelect={setSelectedUnitId}
                onMove={moveUnit}
                onDelete={deleteUnit}
              />
              <AvailableSpaceBar
                used={usedMm}
                total={activeWall.length}
                remaining={remainingMm}
                pct={fillPct}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              لم تُحدّد الجدران بعد.
            </p>
          )}
        </div>

        {/* Inspector */}
        <div className="glass max-h-[70vh] overflow-y-auto rounded-2xl p-4">
          <h3 className="mb-2 text-sm font-bold">المواصفات</h3>
          {selectedUnit ? (
            <UnitInspector
              unit={selectedUnit}
              wallLength={activeWall?.length ?? 0}
              wallHeight={activeWall?.height ?? 0}
              onPatch={(patch) => patchUnit(selectedUnit.id, patch)}
              onDelete={() => deleteUnit(selectedUnit.id)}
            />
          ) : (
            <p className="text-xs text-muted-foreground">
              اختر وحدة من المنظر الجانبي لتعديل أبعادها، أو أضف قالبًا جديدًا
              من القائمة على اليمين.
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-white/[0.03] px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
        >
          <Back className="h-4 w-4" />
          {t("studio.wizard.back")}
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleUndo}
            disabled={undoStack.current.length === 0}
            title="Ctrl+Z"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white/[0.03] px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Undo2 className="h-3.5 w-3.5" />
            {t("studio.wizard.undo")}
          </button>
          <button
            type="button"
            onClick={handleFinish}
            className="group inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
            style={{
              background:
                "linear-gradient(135deg, var(--theme-stop-1,#a78bfa) 0%, var(--theme-stop-2,#f0abfc) 50%, var(--theme-stop-3,#38bdf8) 100%)",
              boxShadow:
                "0 16px 36px -14px var(--theme-halo,rgba(167,139,250,0.55))",
            }}
          >
            <Sparkles className="h-4 w-4" />
            افتح استديو 3D
            <Forward className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SaveBadge({ state, t }: { state: SaveState; t: (k: string) => string }) {
  if (state === "idle") return <div className="h-6 w-20" aria-hidden />;
  const saving = state === "saving";
  return (
    <div
      aria-live="polite"
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium",
        saving
          ? "bg-white/5 text-muted-foreground"
          : "bg-emerald-500/15 text-emerald-300",
      ].join(" ")}
    >
      {saving ? (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      ) : (
        <Check className="h-3 w-3" />
      )}
      {saving ? t("studio.wizard.saving") : t("studio.wizard.savedJustNow")}
    </div>
  );
}

function AvailableSpaceBar({
  used,
  total,
  remaining,
  pct,
}: {
  used: number;
  total: number;
  remaining: number;
  pct: number;
}) {
  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          المستخدم:{" "}
          <span className="font-mono tabular-nums text-foreground">
            {Math.round(used)}
          </span>{" "}
          / {Math.round(total)} مم
        </span>
        <span
          className={remaining < 0 ? "text-rose-400" : "text-muted-foreground"}
        >
          متبقي:{" "}
          <span className="font-mono tabular-nums">{Math.round(remaining)}</span>{" "}
          مم
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="absolute inset-y-0 right-0 rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background:
              pct >= 100
                ? "linear-gradient(90deg, #fb7185, #f0abfc)"
                : "linear-gradient(90deg, var(--theme-stop-1,#a78bfa), var(--theme-stop-3,#38bdf8))",
          }}
        />
      </div>
    </div>
  );
}

function UnitInspector({
  unit,
  wallLength,
  wallHeight,
  onPatch,
  onDelete,
}: {
  unit: DesignerUnit;
  wallLength: number;
  wallHeight: number;
  onPatch: (patch: Partial<DesignerUnit>) => void;
  onDelete: () => void;
}) {
  const baseHeight = unit.baseHeight ?? defaultBaseHeight(unit.category);
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-white/[0.03] p-2.5">
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          القالب
        </div>
        <div className="mt-0.5 truncate text-sm font-bold">{unit.templateName}</div>
        <div className="mt-0.5 text-[10px] text-muted-foreground">
          {CATEGORY_LABEL[unit.category] ?? unit.category}
        </div>
      </div>

      <NumberField
        label="العرض (مم)"
        value={unit.width}
        min={100}
        max={Math.max(100, wallLength)}
        step={10}
        onChange={(n) => onPatch({ width: n })}
      />
      <NumberField
        label="الارتفاع (مم)"
        value={unit.height}
        min={100}
        max={Math.max(100, wallHeight - baseHeight)}
        step={10}
        onChange={(n) => onPatch({ height: n })}
      />
      <NumberField
        label="العمق (مم)"
        value={unit.depth}
        min={100}
        max={1200}
        step={10}
        onChange={(n) => onPatch({ depth: n })}
      />
      <NumberField
        label="البعد على الجدار (مم)"
        value={unit.wallOffset ?? 0}
        min={0}
        max={Math.max(0, wallLength - unit.width)}
        step={10}
        onChange={(n) => onPatch({ wallOffset: n })}
      />
      <NumberField
        label="الارتفاع من الأرض (مم)"
        value={baseHeight}
        min={0}
        max={Math.max(0, wallHeight - unit.height)}
        step={10}
        onChange={(n) => onPatch({ baseHeight: n })}
      />

      <button
        type="button"
        onClick={onDelete}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-500/20"
      >
        <Trash2 className="h-3.5 w-3.5" />
        حذف الوحدة
      </button>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={step}
        value={Math.round(value)}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(n);
        }}
        className="w-full rounded-xl border border-border bg-background/60 px-3 py-1.5 font-mono text-xs tabular-nums outline-none transition-all focus:border-[var(--theme-stop-1,#a78bfa)]/60 focus:bg-background"
      />
    </label>
  );
}

function cryptoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
