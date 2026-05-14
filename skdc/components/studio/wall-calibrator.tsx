"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  Pencil,
  Undo2,
} from "lucide-react";
import type { RoomWall } from "@prisma/client";
import { useI18n } from "@/components/i18n-provider";
import { updateWall } from "@/lib/actions/walls";

type WallPatch = Partial<
  Pick<
    RoomWall,
    | "length"
    | "height"
    | "thickness"
    | "hasWindow"
    | "windowOffset"
    | "windowWidth"
    | "windowHeight"
    | "windowSill"
    | "hasDoor"
    | "doorOffset"
    | "doorWidth"
    | "doorHeight"
  >
>;

type SaveState = "idle" | "saving" | "saved";

const AUTOSAVE_DEBOUNCE_MS = 600;
const SAVED_TOAST_MS = 1400;

export function WallCalibrator({
  projectId,
  initialWalls,
}: {
  projectId: string;
  initialWalls: RoomWall[];
}) {
  const router = useRouter();
  const { t, dir } = useI18n();
  const rtl = dir === "rtl";
  const Forward = rtl ? ArrowLeft : ArrowRight;
  const Back = rtl ? ArrowRight : ArrowLeft;

  const [walls, setWalls] = React.useState<RoomWall[]>(initialWalls);
  const [activeId, setActiveId] = React.useState<string>(initialWalls[0]?.id ?? "");
  const [saveState, setSaveState] = React.useState<SaveState>("idle");
  /** stack of prior values for the active wall (per-wall is overkill here). */
  const undoStack = React.useRef<{ wallId: string; prev: WallPatch }[]>([]);
  const pendingPatch = React.useRef<{ [wallId: string]: WallPatch }>({});
  const debounceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeWall = walls.find((w) => w.id === activeId);

  React.useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  const flush = React.useCallback(async () => {
    const entries = Object.entries(pendingPatch.current);
    if (entries.length === 0) return;
    setSaveState("saving");
    pendingPatch.current = {};
    try {
      await Promise.all(entries.map(([id, patch]) => updateWall(id, patch)));
      setSaveState("saved");
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaveState("idle"), SAVED_TOAST_MS);
    } catch {
      setSaveState("idle");
    }
  }, []);

  function captureUndoEntry(wallId: string, patch: WallPatch) {
    const current = walls.find((w) => w.id === wallId);
    if (!current) return;
    const prev: WallPatch = {};
    for (const key of Object.keys(patch) as (keyof WallPatch)[]) {
      // @ts-expect-error narrowing over Prisma union
      prev[key] = current[key];
    }
    undoStack.current.push({ wallId, prev });
    // keep history bounded
    if (undoStack.current.length > 50) undoStack.current.shift();
  }

  function applyPatch(wallId: string, patch: WallPatch, opts?: { skipUndo?: boolean }) {
    if (!opts?.skipUndo) captureUndoEntry(wallId, patch);

    setWalls((prev) =>
      prev.map((w) => (w.id === wallId ? { ...w, ...patch } : w)),
    );
    pendingPatch.current[wallId] = {
      ...(pendingPatch.current[wallId] ?? {}),
      ...patch,
    };

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(flush, AUTOSAVE_DEBOUNCE_MS);
  }

  function handleUndo() {
    const entry = undoStack.current.pop();
    if (!entry) return;
    applyPatch(entry.wallId, entry.prev, { skipUndo: true });
    setActiveId(entry.wallId);
  }

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const z = (e.key === "z" || e.key === "Z");
      if ((e.ctrlKey || e.metaKey) && z && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walls]);

  async function handleContinue() {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    await flush();
    router.push(`/dashboard/projects/${projectId}/studio/assembly`);
  }

  function handleBack() {
    router.push(`/dashboard/projects/${projectId}/studio/shape`);
  }

  if (!activeWall) {
    return (
      <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">
        لم تُنشأ جدران بعد — ارجع للخطوة السابقة واختر شكلاً.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Wall tabs */}
      <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-border bg-card/40 p-2 backdrop-blur-md">
        {walls.map((w) => {
          const isActive = w.id === activeId;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setActiveId(w.id)}
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
              {(w.hasWindow || w.hasDoor) && (
                <span className="flex items-center gap-1 text-[10px] opacity-80">
                  {w.hasWindow && <Pencil className="h-3 w-3" />}
                  {w.hasDoor && <DoorOpen className="h-3 w-3" />}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <WallForm
        key={activeWall.id}
        wall={activeWall}
        onPatch={(patch) => applyPatch(activeWall.id, patch)}
      />

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
          <SaveBadge state={saveState} t={t} />
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
            onClick={handleContinue}
            className="group inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
            style={{
              background:
                "linear-gradient(135deg, var(--theme-stop-1,#a78bfa) 0%, var(--theme-stop-2,#f0abfc) 50%, var(--theme-stop-3,#38bdf8) 100%)",
              boxShadow:
                "0 16px 36px -14px var(--theme-halo,rgba(167,139,250,0.55))",
            }}
          >
            <Forward className="h-4 w-4" />
            {t("studio.wizard.next")}
          </button>
        </div>
      </div>
    </div>
  );
}

function SaveBadge({ state, t }: { state: SaveState; t: (k: string) => string }) {
  if (state === "idle") return <div className="h-6 w-20" aria-hidden />;
  const showSaving = state === "saving";
  return (
    <div
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium transition-opacity",
        showSaving
          ? "bg-white/5 text-muted-foreground"
          : "bg-emerald-500/15 text-emerald-300",
      ].join(" ")}
      aria-live="polite"
    >
      {showSaving ? (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      ) : (
        <Check className="h-3 w-3" />
      )}
      {showSaving ? t("studio.wizard.saving") : t("studio.wizard.savedJustNow")}
    </div>
  );
}

function WallForm({
  wall,
  onPatch,
}: {
  wall: RoomWall;
  onPatch: (patch: WallPatch) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-5">
        <h3 className="mb-3 text-sm font-bold">
          <span className="text-gradient">جدار {wall.label}</span>{" "}
          <span className="text-xs font-normal text-muted-foreground">
            · {labelForWall(wall.label)}
          </span>
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField
            label="الطول (مم)"
            value={wall.length}
            min={500}
            max={20_000}
            step={10}
            onChange={(n) => onPatch({ length: n })}
          />
          <NumberField
            label="الارتفاع (مم)"
            value={wall.height}
            min={2000}
            max={5000}
            step={10}
            onChange={(n) => onPatch({ height: n })}
          />
          <NumberField
            label="السماكة (مم)"
            value={wall.thickness}
            min={50}
            max={500}
            step={10}
            onChange={(n) => onPatch({ thickness: n })}
          />
        </div>
      </div>

      <OpeningSection
        kind="window"
        wall={wall}
        onPatch={onPatch}
      />
      <OpeningSection
        kind="door"
        wall={wall}
        onPatch={onPatch}
      />
    </div>
  );
}

function OpeningSection({
  kind,
  wall,
  onPatch,
}: {
  kind: "window" | "door";
  wall: RoomWall;
  onPatch: (patch: WallPatch) => void;
}) {
  const isWindow = kind === "window";
  const enabled = isWindow ? wall.hasWindow : wall.hasDoor;
  const title = isWindow ? "نافذة" : "باب";
  const Icon = isWindow ? Pencil : DoorOpen;

  function toggle(next: boolean) {
    if (isWindow) {
      onPatch(
        next
          ? {
              hasWindow: true,
              windowOffset: wall.windowOffset ?? 600,
              windowWidth: wall.windowWidth ?? 1200,
              windowHeight: wall.windowHeight ?? 1000,
              windowSill: wall.windowSill ?? 1000,
            }
          : { hasWindow: false },
      );
    } else {
      onPatch(
        next
          ? {
              hasDoor: true,
              doorOffset: wall.doorOffset ?? 100,
              doorWidth: wall.doorWidth ?? 900,
              doorHeight: wall.doorHeight ?? 2100,
            }
          : { hasDoor: false },
      );
    }
  }

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="inline-flex items-center gap-2 text-sm font-bold">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </h3>
        <SwitchPill enabled={enabled} onChange={toggle} />
      </div>
      {enabled ? (
        isWindow ? (
          <div className="grid gap-3 sm:grid-cols-4">
            <NumberField
              label="البعد من حافة الجدار (مم)"
              value={wall.windowOffset ?? 600}
              min={0}
              max={wall.length}
              step={10}
              onChange={(n) => onPatch({ windowOffset: n })}
            />
            <NumberField
              label="عرض النافذة (مم)"
              value={wall.windowWidth ?? 1200}
              min={300}
              max={wall.length}
              step={10}
              onChange={(n) => onPatch({ windowWidth: n })}
            />
            <NumberField
              label="ارتفاع النافذة (مم)"
              value={wall.windowHeight ?? 1000}
              min={300}
              max={wall.height}
              step={10}
              onChange={(n) => onPatch({ windowHeight: n })}
            />
            <NumberField
              label="ارتفاع العتبة (مم)"
              value={wall.windowSill ?? 1000}
              min={0}
              max={wall.height}
              step={10}
              onChange={(n) => onPatch({ windowSill: n })}
            />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <NumberField
              label="البعد من حافة الجدار (مم)"
              value={wall.doorOffset ?? 100}
              min={0}
              max={wall.length}
              step={10}
              onChange={(n) => onPatch({ doorOffset: n })}
            />
            <NumberField
              label="عرض الباب (مم)"
              value={wall.doorWidth ?? 900}
              min={600}
              max={wall.length}
              step={10}
              onChange={(n) => onPatch({ doorWidth: n })}
            />
            <NumberField
              label="ارتفاع الباب (مم)"
              value={wall.doorHeight ?? 2100}
              min={1800}
              max={wall.height}
              step={10}
              onChange={(n) => onPatch({ doorHeight: n })}
            />
          </div>
        )
      ) : (
        <p className="text-xs text-muted-foreground">
          لا يوجد {title} في هذا الجدار. شغّل المفتاح أعلاه لإضافة واحد.
        </p>
      )}
    </div>
  );
}

function SwitchPill({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={[
        "relative h-6 w-11 rounded-full transition-colors",
        enabled ? "bg-[var(--theme-stop-1,#a78bfa)]" : "bg-white/10",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-0.5 grid h-5 w-5 place-items-center rounded-full bg-white shadow transition-transform",
          enabled ? "left-0.5 translate-x-5" : "left-0.5 translate-x-0",
        ].join(" ")}
      >
        {enabled ? (
          <ChevronRight className="h-3 w-3 text-[var(--theme-stop-1,#a78bfa)]" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-muted-foreground" />
        )}
      </span>
    </button>
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
        className="w-full rounded-xl border border-border bg-background/60 px-3 py-2 font-mono text-sm tabular-nums outline-none transition-all focus:border-[var(--theme-stop-1,#a78bfa)]/60 focus:bg-background"
      />
    </label>
  );
}

function labelForWall(label: string): string {
  switch (label) {
    case "A":
      return "أمام (الواجهة)";
    case "B":
      return "يمين";
    case "C":
      return "خلف";
    case "D":
      return "يسار";
    default:
      return "";
  }
}
