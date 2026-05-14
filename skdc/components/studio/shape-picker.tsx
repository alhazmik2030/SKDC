"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import type { RoomShape } from "@prisma/client";
import { useI18n } from "@/components/i18n-provider";
import { ShapePreviewSVG } from "./shape-preview-svg";
import { setRoomShape } from "@/lib/actions/walls";
import { updateProjectRoom } from "@/lib/actions/projects";

type ShapeOption = {
  value: RoomShape;
  labelKey: string;
  /** Short description to set expectations on what gets generated. */
  hintAr: string;
  hintEn: string;
};

const OPTIONS: ShapeOption[] = [
  {
    value: "SINGLE_WALL",
    labelKey: "designer.roomShape.singleWall",
    hintAr: "جدار واحد (A) — أبسط شكل، مثالي للمطابخ الصغيرة",
    hintEn: "One wall (A) — simplest layout, great for small kitchens",
  },
  {
    value: "L_SHAPE",
    labelKey: "designer.roomShape.lShape",
    hintAr: "جداران متعامدان (A + B) — يستغل الزاوية",
    hintEn: "Two perpendicular walls (A + B) — uses the corner",
  },
  {
    value: "U_SHAPE",
    labelKey: "designer.roomShape.uShape",
    hintAr: "ثلاثة جدران (A + B + C) — مساحة عمل واسعة",
    hintEn: "Three walls (A + B + C) — maximum counter space",
  },
  {
    value: "CLOSED",
    labelKey: "designer.roomShape.fourWalls",
    hintAr: "غرفة مغلقة (A + B + C + D) — يدعم الجدران الأربعة",
    hintEn: "Closed room (A + B + C + D) — full perimeter",
  },
  {
    value: "ISLAND",
    labelKey: "designer.roomShape.island",
    hintAr: "غرفة مغلقة + جزيرة وسطية مستقلة",
    hintEn: "Closed room + a free-standing centre island",
  },
];

const MIN_DIM = 1500;
const MAX_DIM = 20_000;
const MIN_HEIGHT = 2000;
const MAX_HEIGHT = 5000;

export function ShapePicker({
  projectId,
  initialShape,
  initialRoom,
}: {
  projectId: string;
  initialShape: RoomShape | null;
  initialRoom: { width: number | null; depth: number | null; height: number | null };
}) {
  const router = useRouter();
  const { t, dir, locale } = useI18n();
  const rtl = dir === "rtl";
  const Forward = rtl ? ArrowLeft : ArrowRight;

  const [shape, setShape] = React.useState<RoomShape | null>(initialShape);
  const [width, setWidth] = React.useState<number>(initialRoom.width ?? 4000);
  const [depth, setDepth] = React.useState<number>(initialRoom.depth ?? 3000);
  const [height, setHeight] = React.useState<number>(initialRoom.height ?? 2700);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isSingle = shape === "SINGLE_WALL";
  const valid =
    shape !== null &&
    width >= MIN_DIM && width <= MAX_DIM &&
    (isSingle || (depth >= MIN_DIM && depth <= MAX_DIM)) &&
    height >= MIN_HEIGHT && height <= MAX_HEIGHT;

  async function handleContinue() {
    if (!shape || !valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      await updateProjectRoom(projectId, {
        roomWidth: width,
        roomDepth: isSingle ? depth : depth,
        roomHeight: height,
      });
      await setRoomShape(projectId, { shape });
      router.push(`/dashboard/projects/${projectId}/studio/walls`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Shape grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {OPTIONS.map((opt) => {
          const selected = shape === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setShape(opt.value)}
              aria-pressed={selected}
              className={[
                "group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border p-4 text-center transition-all",
                selected
                  ? "border-transparent ring-2 ring-offset-2 ring-offset-background"
                  : "border-border bg-card/40 hover:-translate-y-0.5 hover:border-white/20",
              ].join(" ")}
              style={
                selected
                  ? {
                      background:
                        "linear-gradient(135deg, color-mix(in oklab, var(--theme-stop-1,#a78bfa) 20%, transparent), color-mix(in oklab, var(--theme-stop-3,#38bdf8) 18%, transparent))",
                      // @ts-expect-error custom property for ring
                      "--tw-ring-color": "var(--theme-stop-1,#a78bfa)",
                    }
                  : undefined
              }
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-0 transition-opacity group-hover:opacity-60"
                style={{
                  background:
                    "radial-gradient(circle, var(--theme-halo,rgba(167,139,250,0.4)) 0%, transparent 70%)",
                  filter: "blur(18px)",
                }}
              />
              <div className="relative text-foreground/85">
                <ShapePreviewSVG shape={opt.value} size={110} />
              </div>
              <div className="relative">
                <div className="text-sm font-bold">{t(opt.labelKey)}</div>
                <div className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  {locale === "ar" ? opt.hintAr : opt.hintEn}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Dimensions */}
      <div className="glass rounded-2xl p-5">
        <h3 className="mb-3 text-sm font-bold text-gradient">أبعاد الغرفة</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <DimField
            label="العرض (مم)"
            value={width}
            min={MIN_DIM}
            max={MAX_DIM}
            onChange={setWidth}
          />
          <DimField
            label={isSingle ? "العمق (اختياري — للسطح)" : "العمق (مم)"}
            value={depth}
            min={MIN_DIM}
            max={MAX_DIM}
            onChange={setDepth}
            disabled={false}
          />
          <DimField
            label="الارتفاع (مم)"
            value={height}
            min={MIN_HEIGHT}
            max={MAX_HEIGHT}
            onChange={setHeight}
          />
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          سنُنشئ الجدران تلقائيًا من هذه القياسات. تقدر تعدّل كل جدار على حدة في الخطوة التالية.
        </p>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {error ? <span className="text-rose-400">{error}</span> : null}
        </div>
        <button
          type="button"
          disabled={!valid || busy}
          onClick={handleContinue}
          className="group relative inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          style={{
            background:
              "linear-gradient(135deg, var(--theme-stop-1,#a78bfa) 0%, var(--theme-stop-2,#f0abfc) 50%, var(--theme-stop-3,#38bdf8) 100%)",
            boxShadow:
              "0 18px 40px -14px var(--theme-halo,rgba(167,139,250,0.6))",
          }}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Forward className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
          )}
          {t("studio.wizard.next")}
        </button>
      </div>
    </div>
  );
}

function DimField({
  label,
  value,
  min,
  max,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  disabled?: boolean;
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
        step="50"
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(n);
        }}
        className="w-full rounded-xl border border-border bg-background/60 px-3 py-2 font-mono text-sm tabular-nums outline-none ring-0 transition-all focus:border-[var(--theme-stop-1,#a78bfa)]/60 focus:bg-background"
      />
    </label>
  );
}
