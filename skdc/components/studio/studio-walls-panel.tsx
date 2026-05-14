"use client";

import * as React from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  DoorOpen,
  Loader2,
  Pencil,
  Square,
  X,
} from "lucide-react";
import type { RoomShape, RoomWall } from "@prisma/client";
import { setIsland, setRoomShape, updateWall } from "@/lib/actions/walls";
import { ShapePreviewSVG } from "./shape-preview-svg";

const GLASS_STRONG = "rgba(8,8,12,0.92)";
const BORDER = "rgba(255,255,255,0.08)";

type WallPatch = Partial<
  Pick<
    RoomWall,
    | "label"
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
const AUTOSAVE_MS = 600;
const SAVED_BADGE_MS = 1200;

export type IslandData = {
  hasIsland: boolean;
  width: number | null;
  depth: number | null;
  x: number | null;
  z: number | null;
};

export interface StudioWallsPanelProps {
  projectId: string;
  walls: RoomWall[];
  shape: RoomShape | null;
  island: IslandData;
  /** Whole room volume — used as defaults when toggling the island. */
  room: { width: number; depth: number };
  onClose: () => void;
  /** Called after a single wall is patched (so 3D can re-render). */
  onWallChanged?: (next: RoomWall) => void;
  /** Called after a shape switch (which regenerates all walls). */
  onShapeChanged?: () => void;
  /** Called after island toggle/dimensions change. */
  onIslandChanged?: (island: IslandData) => void;
}

const WALL_DIRECTION_LABEL_AR: Record<string, string> = {
  A: "أمام (الواجهة)",
  B: "يمين",
  C: "خلف",
  D: "يسار",
};

const SHAPE_OPTIONS: {
  value: RoomShape;
  labelAr: string;
}[] = [
  { value: "SINGLE_WALL", labelAr: "جدار واحد" },
  { value: "L_SHAPE", labelAr: "حرف L" },
  { value: "U_SHAPE", labelAr: "حرف U" },
  { value: "CLOSED", labelAr: "غرفة مغلقة" },
  { value: "ISLAND", labelAr: "مع جزيرة" },
];

type Section = "shape" | "walls" | "island";

export function StudioWallsPanel({
  projectId,
  walls,
  shape,
  island,
  room,
  onClose,
  onWallChanged,
  onShapeChanged,
  onIslandChanged,
}: StudioWallsPanelProps) {
  const [localWalls, setLocalWalls] = React.useState<RoomWall[]>(walls);
  const [localIsland, setLocalIsland] = React.useState<IslandData>(island);
  const [expandedWallId, setExpandedWallId] = React.useState<string | null>(
    walls[0]?.id ?? null,
  );
  const [section, setSection] = React.useState<Section>("walls");
  const [saveState, setSaveState] = React.useState<SaveState>("idle");
  const [pendingShape, setPendingShape] = React.useState<RoomShape | null>(null);
  const [shapeBusy, setShapeBusy] = React.useState(false);

  React.useEffect(() => {
    setLocalWalls(walls);
  }, [walls]);
  React.useEffect(() => {
    setLocalIsland(island);
  }, [island]);

  const pendingWalls = React.useRef<{ [wallId: string]: WallPatch }>({});
  const pendingIsland = React.useRef<IslandData | null>(null);
  const debounceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    [],
  );

  async function flush() {
    const wallEntries = Object.entries(pendingWalls.current);
    const islandPatch = pendingIsland.current;
    if (wallEntries.length === 0 && !islandPatch) return;
    setSaveState("saving");
    pendingWalls.current = {};
    pendingIsland.current = null;
    try {
      const updated = await Promise.all(
        wallEntries.map(([id, patch]) => updateWall(id, patch)),
      );
      for (const w of updated) onWallChanged?.(w as RoomWall);
      if (islandPatch) {
        await setIsland(projectId, {
          hasIsland: islandPatch.hasIsland,
          width: islandPatch.width ?? undefined,
          depth: islandPatch.depth ?? undefined,
          x: islandPatch.x ?? undefined,
          z: islandPatch.z ?? undefined,
        });
        onIslandChanged?.(islandPatch);
      }
      setSaveState("saved");
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaveState("idle"), SAVED_BADGE_MS);
    } catch {
      setSaveState("idle");
    }
  }

  function patchWall(wallId: string, p: WallPatch) {
    setLocalWalls((prev) =>
      prev.map((w) => (w.id === wallId ? { ...w, ...p } : w)),
    );
    pendingWalls.current[wallId] = {
      ...(pendingWalls.current[wallId] ?? {}),
      ...p,
    };
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(flush, AUTOSAVE_MS);
  }

  function patchIsland(p: Partial<IslandData>) {
    const next: IslandData = { ...localIsland, ...p };
    setLocalIsland(next);
    pendingIsland.current = next;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(flush, AUTOSAVE_MS);
  }

  async function confirmShapeSwitch(next: RoomShape) {
    setShapeBusy(true);
    try {
      await setRoomShape(projectId, { shape: next });
      onShapeChanged?.();
      setPendingShape(null);
    } finally {
      setShapeBusy(false);
    }
  }

  return (
    <div
      className="absolute end-[78px] top-[100px] z-[42] w-[340px] overflow-hidden rounded-2xl border shadow-2xl"
      style={{
        background: GLASS_STRONG,
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderColor: BORDER,
        boxShadow: "0 30px 60px -20px rgba(0,0,0,0.75)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-3 py-2"
        style={{ borderColor: BORDER }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-[12px] font-black"
            style={{
              background:
                "linear-gradient(135deg, var(--theme-stop-1,#a78bfa), var(--theme-stop-3,#38bdf8))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            البنية والجدران
          </span>
          <SaveBadge state={saveState} />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="rounded-md p-1 text-white/55 transition-colors hover:bg-white/5 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Section tabs */}
      <div
        className="grid grid-cols-3 border-b text-[11px]"
        style={{ borderColor: BORDER }}
      >
        <SectionTab active={section === "shape"} onClick={() => setSection("shape")}>
          الشكل
        </SectionTab>
        <SectionTab active={section === "walls"} onClick={() => setSection("walls")}>
          الجدران ({localWalls.length})
        </SectionTab>
        <SectionTab active={section === "island"} onClick={() => setSection("island")}>
          الجزيرة {localIsland.hasIsland ? "✓" : ""}
        </SectionTab>
      </div>

      <div className="max-h-[64vh] overflow-y-auto p-2.5">
        {section === "shape" ? (
          <ShapeSection
            current={shape}
            pending={pendingShape}
            onPick={setPendingShape}
            onCancel={() => setPendingShape(null)}
            onConfirm={confirmShapeSwitch}
            busy={shapeBusy}
          />
        ) : null}

        {section === "walls" ? (
          localWalls.length === 0 ? (
            <p className="px-2 py-6 text-center text-[11px] text-white/55">
              لا توجد جدران بعد. اختر شكلًا من تبويب "الشكل".
            </p>
          ) : (
            localWalls.map((w) => (
              <WallCard
                key={w.id}
                wall={w}
                expanded={expandedWallId === w.id}
                onToggle={() =>
                  setExpandedWallId(expandedWallId === w.id ? null : w.id)
                }
                onPatch={(p) => patchWall(w.id, p)}
              />
            ))
          )
        ) : null}

        {section === "island" ? (
          <IslandSection
            island={localIsland}
            room={room}
            onPatch={patchIsland}
          />
        ) : null}
      </div>
    </div>
  );
}

function SectionTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative py-2 transition-colors ${
        active ? "text-white" : "text-white/55 hover:text-white"
      }`}
    >
      {children}
      {active ? (
        <span
          className="pointer-events-none absolute inset-x-2 bottom-0 h-[2px] rounded-full"
          style={{
            background:
              "linear-gradient(90deg, var(--theme-stop-1,#a78bfa), var(--theme-stop-3,#38bdf8))",
          }}
        />
      ) : null}
    </button>
  );
}

function ShapeSection({
  current,
  pending,
  onPick,
  onCancel,
  onConfirm,
  busy,
}: {
  current: RoomShape | null;
  pending: RoomShape | null;
  onPick: (s: RoomShape) => void;
  onCancel: () => void;
  onConfirm: (s: RoomShape) => void;
  busy: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] leading-relaxed text-white/55">
        اختر الشكل الأساسي لجدران المطبخ. تبديل الشكل يُعيد بناء الجدران من الأبعاد
        الحالية للمشروع.
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        {SHAPE_OPTIONS.map((opt) => {
          const isCurrent = opt.value === current;
          const isPending = opt.value === pending;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => (isCurrent ? null : onPick(opt.value))}
              aria-pressed={isCurrent}
              className={`relative flex flex-col items-center gap-1 rounded-lg border p-2 transition-all ${
                isPending
                  ? "border-rose-400/60"
                  : isCurrent
                    ? "border-transparent text-white"
                    : "border-transparent text-white/70 hover:border-white/15"
              }`}
              style={{
                background: isCurrent
                  ? "linear-gradient(135deg, color-mix(in oklab, var(--theme-stop-1,#a78bfa) 25%, transparent), color-mix(in oklab, var(--theme-stop-3,#38bdf8) 20%, transparent))"
                  : isPending
                    ? "rgba(244,63,94,0.10)"
                    : "rgba(255,255,255,0.02)",
              }}
            >
              <ShapePreviewSVG shape={opt.value} size={56} showLabels={false} />
              <span className="text-[10px] font-bold">{opt.labelAr}</span>
              {isCurrent ? (
                <span className="absolute -end-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-500/90 text-[8px] font-black text-white">
                  ✓
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {pending && pending !== current ? (
        <div
          className="mt-3 rounded-lg border p-2.5"
          style={{
            background: "rgba(244,63,94,0.10)",
            borderColor: "rgba(244,63,94,0.35)",
          }}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            تبديل الشكل سيحذف الجدران الحالية ويعيد بناءها
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-white/70">
            الوحدات المربوطة بالجدران تبقى موجودة لكن قد تحتاج لإعادة التوزيع
            لأن الأطوال ستتغير.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => onConfirm(pending)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-bold text-white"
              style={{
                background:
                  "linear-gradient(135deg, var(--theme-stop-1,#a78bfa), var(--theme-stop-3,#38bdf8))",
              }}
            >
              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              متابعة
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="rounded-md border px-2 py-1.5 text-[11px] text-white/70"
              style={{ borderColor: BORDER, background: "transparent" }}
            >
              إلغاء
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function IslandSection({
  island,
  room,
  onPatch,
}: {
  island: IslandData;
  room: { width: number; depth: number };
  onPatch: (p: Partial<IslandData>) => void;
}) {
  const enabled = island.hasIsland;
  const w = island.width ?? 1800;
  const d = island.depth ?? 900;
  const x = island.x ?? room.width / 2;
  const z = island.z ?? room.depth / 2;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="inline-flex items-center gap-1.5 text-[12px] font-bold">
            <Square className="h-3.5 w-3.5" />
            الجزيرة
          </h3>
          <p className="mt-0.5 text-[10px] leading-snug text-white/55">
            وحدة مستقلة في وسط المطبخ، تظهر في 3D كصندوق منفصل.
          </p>
        </div>
        <SwitchPill
          enabled={enabled}
          onChange={(next) =>
            onPatch(
              next
                ? {
                    hasIsland: true,
                    width: w,
                    depth: d,
                    x,
                    z,
                  }
                : { hasIsland: false },
            )
          }
        />
      </div>

      {enabled ? (
        <div className="grid grid-cols-2 gap-2 rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.02)" }}>
          <NumberField
            label="العرض"
            value={w}
            min={500}
            max={4000}
            step={10}
            onChange={(n) => onPatch({ width: n })}
          />
          <NumberField
            label="العمق"
            value={d}
            min={500}
            max={2500}
            step={10}
            onChange={(n) => onPatch({ depth: n })}
          />
          <NumberField
            label="الموضع X (من اليسار)"
            value={x}
            min={0}
            max={Math.max(0, room.width - w)}
            step={10}
            onChange={(n) => onPatch({ x: n })}
          />
          <NumberField
            label="الموضع Z (من الأمام)"
            value={z}
            min={0}
            max={Math.max(0, room.depth - d)}
            step={10}
            onChange={(n) => onPatch({ z: n })}
          />
        </div>
      ) : (
        <p className="rounded-lg p-3 text-center text-[10px] text-white/55" style={{ background: "rgba(255,255,255,0.02)" }}>
          الجزيرة معطّلة. شغّل المفتاح أعلاه لإضافة جزيرة وسط المطبخ.
        </p>
      )}
    </div>
  );
}

function WallCard({
  wall,
  expanded,
  onToggle,
  onPatch,
}: {
  wall: RoomWall;
  expanded: boolean;
  onToggle: () => void;
  onPatch: (p: WallPatch) => void;
}) {
  return (
    <div
      className="mb-1.5 rounded-xl border"
      style={{ borderColor: BORDER, background: "rgba(255,255,255,0.02)" }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-2.5 py-2 text-start transition-colors hover:bg-white/5"
      >
        <span
          className="grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold text-background"
          style={{
            background:
              "linear-gradient(135deg, var(--theme-stop-1,#a78bfa), var(--theme-stop-3,#38bdf8))",
          }}
        >
          {wall.label}
        </span>
        <div className="flex-1">
          <div className="text-[12px] font-bold text-white">
            جدار {wall.label}
            <span className="ms-1 text-[10px] font-normal text-white/55">
              · {WALL_DIRECTION_LABEL_AR[wall.label] ?? ""}
            </span>
          </div>
          <div className="font-mono text-[10px] tabular-nums text-white/55">
            {Math.round(wall.length)} × {Math.round(wall.height)} مم
            {wall.hasWindow ? " · 🪟" : ""}
            {wall.hasDoor ? " · 🚪" : ""}
          </div>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-white/55 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded ? (
        <div className="border-t px-2.5 py-2" style={{ borderColor: BORDER }}>
          <div className="grid grid-cols-2 gap-2">
            <TextField
              label="الاسم (الحرف)"
              value={wall.label}
              maxLength={4}
              onChange={(v) => onPatch({ label: v.toUpperCase().slice(0, 4) || "?" })}
            />
            <NumberField
              label="الطول"
              value={wall.length}
              min={500}
              max={20_000}
              step={10}
              onChange={(n) => onPatch({ length: n })}
            />
            <NumberField
              label="الارتفاع"
              value={wall.height}
              min={2000}
              max={5000}
              step={10}
              onChange={(n) => onPatch({ height: n })}
            />
            <NumberField
              label="السماكة"
              value={wall.thickness}
              min={50}
              max={500}
              step={10}
              onChange={(n) => onPatch({ thickness: n })}
            />
          </div>

          <OpeningSection kind="window" wall={wall} onPatch={onPatch} />
          <OpeningSection kind="door" wall={wall} onPatch={onPatch} />
        </div>
      ) : null}
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
  onPatch: (p: WallPatch) => void;
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
    <div className="mt-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/85">
          <Icon className="h-3 w-3" />
          {title}
        </span>
        <SwitchPill enabled={enabled} onChange={toggle} />
      </div>

      {enabled ? (
        isWindow ? (
          <div className="grid grid-cols-2 gap-2 px-2 pb-2">
            <NumberField
              label="البعد"
              value={wall.windowOffset ?? 600}
              min={0}
              max={wall.length}
              step={10}
              onChange={(n) => onPatch({ windowOffset: n })}
            />
            <NumberField
              label="العرض"
              value={wall.windowWidth ?? 1200}
              min={300}
              max={wall.length}
              step={10}
              onChange={(n) => onPatch({ windowWidth: n })}
            />
            <NumberField
              label="الارتفاع"
              value={wall.windowHeight ?? 1000}
              min={300}
              max={wall.height}
              step={10}
              onChange={(n) => onPatch({ windowHeight: n })}
            />
            <NumberField
              label="ع. العتبة"
              value={wall.windowSill ?? 1000}
              min={0}
              max={wall.height}
              step={10}
              onChange={(n) => onPatch({ windowSill: n })}
            />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 px-2 pb-2">
            <NumberField
              label="البعد"
              value={wall.doorOffset ?? 100}
              min={0}
              max={wall.length}
              step={10}
              onChange={(n) => onPatch({ doorOffset: n })}
            />
            <NumberField
              label="العرض"
              value={wall.doorWidth ?? 900}
              min={600}
              max={wall.length}
              step={10}
              onChange={(n) => onPatch({ doorWidth: n })}
            />
            <NumberField
              label="الارتفاع"
              value={wall.doorHeight ?? 2100}
              min={1800}
              max={wall.height}
              step={10}
              onChange={(n) => onPatch({ doorHeight: n })}
            />
          </div>
        )
      ) : null}
    </div>
  );
}

function SwitchPill({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (n: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className="relative h-4 w-8 shrink-0 rounded-full transition-colors"
      style={{
        background: enabled
          ? "var(--theme-stop-1,#a78bfa)"
          : "rgba(255,255,255,0.1)",
      }}
    >
      <span
        className="absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform"
        style={{
          insetInlineStart: "2px",
          transform: enabled ? "translateX(16px)" : "translateX(0)",
        }}
      />
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
      <span className="mb-0.5 block text-[10px] font-medium text-white/55">
        {label} (مم)
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
        className="w-full rounded-md border px-2 py-1 font-mono text-[11px] tabular-nums text-white outline-none transition-colors focus:border-[var(--theme-stop-1,#a78bfa)]/60"
        style={{
          background: "rgba(0,0,0,0.35)",
          borderColor: BORDER,
        }}
      />
    </label>
  );
}

function TextField({
  label,
  value,
  maxLength,
  onChange,
}: {
  label: string;
  value: string;
  maxLength?: number;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-[10px] font-medium text-white/55">
        {label}
      </span>
      <input
        type="text"
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border px-2 py-1 text-center text-[11px] font-bold text-white outline-none transition-colors focus:border-[var(--theme-stop-1,#a78bfa)]/60"
        style={{
          background: "rgba(0,0,0,0.35)",
          borderColor: BORDER,
        }}
      />
    </label>
  );
}

function SaveBadge({ state }: { state: SaveState }) {
  if (state === "idle") return <span className="h-3 w-3" aria-hidden />;
  const saving = state === "saving";
  return (
    <span
      aria-live="polite"
      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium"
      style={{
        background: saving ? "rgba(255,255,255,0.06)" : "rgba(16,185,129,0.18)",
        color: saving ? "rgba(255,255,255,0.55)" : "#6ee7b7",
      }}
    >
      {saving ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Check className="h-2.5 w-2.5" />}
      {saving ? "حفظ..." : "محفوظ"}
    </span>
  );
}
