"use client";

import * as React from "react";
import { Move, RotateCw, Trash2 } from "lucide-react";
import type { DesignerUnit } from "@/components/designer/types";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

const BORDER = "rgba(255,255,255,0.08)";
const GLASS_STRONG = "rgba(8,8,12,0.92)";

const MATERIAL_SWATCHES: Array<{ id: string; bg: string; title: string }> = [
  { id: "oak", bg: "#b7935d", title: "Oak" },
  { id: "walnut", bg: "#7d5b3a", title: "Walnut" },
  { id: "lacquer-white", bg: "#eee9e1", title: "Lacquer White" },
  { id: "matte-black", bg: "#1c1c1c", title: "Matte Black" },
  { id: "violet", bg: "#c8a9d4", title: "Violet" },
  { id: "mint", bg: "#a0c4b8", title: "Mint" },
];

const COUNTERTOP_SWATCHES: Array<{
  id: string;
  bg: string;
  title: string;
}> = [
  { id: "carrara", bg: "linear-gradient(135deg,#fff,#ccc)", title: "Carrara" },
  {
    id: "quartz",
    bg: "linear-gradient(135deg,#fff8e7,#d4caa8)",
    title: "Quartz",
  },
  {
    id: "granite",
    bg: "linear-gradient(135deg,#1c1c1c,#3a3a3a)",
    title: "Granite",
  },
  {
    id: "wood",
    bg: "linear-gradient(135deg,#ebc99e,#a87842)",
    title: "Wood",
  },
  { id: "hpl", bg: "linear-gradient(135deg,#e0e0e0,#999)", title: "HPL" },
  {
    id: "glass",
    bg: "linear-gradient(135deg,#a0d0d8,#5a8a92)",
    title: "Glass",
  },
];

const HANDLE_SWATCHES: Array<{ id: string; bg: string; title: string }> = [
  {
    id: "chrome",
    bg: "linear-gradient(135deg,#c0c4c8,#7a8088)",
    title: "Chrome",
  },
  {
    id: "matte-steel",
    bg: "linear-gradient(135deg,#8c8b8a,#4a4948)",
    title: "Matte Steel",
  },
  {
    id: "matte-black",
    bg: "linear-gradient(135deg,#1c1c1c,#0a0a0a)",
    title: "Matte Black",
  },
  {
    id: "brushed-gold",
    bg: "linear-gradient(135deg,#d4a574,#8a6a3a)",
    title: "Brushed Gold",
  },
  {
    id: "copper",
    bg: "linear-gradient(135deg,#c98668,#7a4530)",
    title: "Copper",
  },
  { id: "white", bg: "linear-gradient(135deg,#fff,#ddd)", title: "White" },
];

export interface StudioInspectorProps {
  unit: DesignerUnit | null;
  onUpdate: (patch: Partial<DesignerUnit>) => void;
  onDelete: () => void;
  onRotate: () => void;
}

export function StudioInspector({
  unit,
  onUpdate,
  onDelete,
  onRotate,
}: StudioInspectorProps) {
  const { t } = useI18n();

  const [material, setMaterial] = React.useState<string>("oak");
  const [countertop, setCountertop] = React.useState<string>("quartz");
  const [handle, setHandle] = React.useState<string>("chrome");

  return (
    <div
      className="absolute start-3 top-[100px] z-[40] w-[260px] overflow-y-auto rounded-2xl border p-3.5"
      style={{
        background: GLASS_STRONG,
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderColor: BORDER,
        boxShadow: "0 30px 70px -20px rgba(0,0,0,0.75)",
        maxHeight: "calc(100vh - 200px)",
      }}
    >
      {!unit ? (
        <div className="grid place-items-center px-4 py-10 text-center text-[12px] text-white/55">
          <Move className="mx-auto mb-2 h-8 w-8 opacity-50" />
          {t("designer.inspector.empty")}
        </div>
      ) : (
        <>
          <div
            className="mb-3 flex items-center gap-2 border-b pb-2"
            style={{ borderColor: BORDER }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: "var(--theme-stop-1, #a78bfa)",
                boxShadow: "0 0 10px var(--theme-stop-1, #a78bfa)",
              }}
            />
            <span className="flex-1 truncate text-[13px] font-bold">
              {unit.templateName}
            </span>
          </div>

          <NumberRow
            k={t("designer.inspector.width")}
            value={unit.width}
            onChange={(v) => onUpdate({ width: v })}
            suffix="مم"
          />
          <NumberRow
            k={t("designer.inspector.depth")}
            value={unit.depth}
            onChange={(v) => onUpdate({ depth: v })}
            suffix="مم"
          />
          <NumberRow
            k={t("designer.inspector.height")}
            value={unit.height}
            onChange={(v) => onUpdate({ height: v })}
            suffix="مم"
          />
          <NumberRow
            k={t("designer.inspector.x")}
            value={unit.x}
            onChange={(v) => onUpdate({ x: v })}
          />
          <NumberRow
            k={t("designer.inspector.y")}
            value={unit.y}
            onChange={(v) => onUpdate({ y: v })}
          />
          <Row k={"التدوير"} v={`${unit.rotation}°`} />

          <Section title="الخامة">
            <SwatchGrid
              swatches={MATERIAL_SWATCHES}
              selected={material}
              onSelect={setMaterial}
            />
          </Section>

          <Section title="السطح (countertop)">
            <SwatchGrid
              swatches={COUNTERTOP_SWATCHES}
              selected={countertop}
              onSelect={setCountertop}
            />
          </Section>

          <Section title="المقابض">
            <SwatchGrid
              swatches={HANDLE_SWATCHES}
              selected={handle}
              onSelect={setHandle}
            />
          </Section>

          <div className="mt-3 flex gap-1">
            <button
              type="button"
              onClick={onRotate}
              className="flex-1 cursor-pointer rounded-[7px] border px-2 py-1.5 text-[11px]"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderColor: BORDER,
                color: "#f5f5f7",
              }}
            >
              <RotateCw className="me-1 inline h-3 w-3" />
              {t("designer.inspector.rotate")}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="flex-1 cursor-pointer rounded-[7px] border px-2 py-1.5 text-[11px]"
              style={{
                background: "rgba(244,63,94,0.1)",
                borderColor: "rgba(244,63,94,0.3)",
                color: "#fda4af",
              }}
            >
              <Trash2 className="me-1 inline h-3 w-3" />
              {t("designer.inspector.delete")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function NumberRow({
  k,
  value,
  onChange,
  suffix,
}: {
  k: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-2.5 py-1 text-[11px]">
      <span className="text-white/55">{k}</span>
      <span className="inline-flex items-center gap-1">
        <input
          type="number"
          step={10}
          value={value}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (!Number.isNaN(next)) onChange(next);
          }}
          className="w-[70px] rounded-md border px-2 py-[3px] text-end font-mono text-[11px] outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            borderColor: "rgba(255,255,255,0.08)",
            color: "#f5f5f7",
          }}
        />
        {suffix ? (
          <span className="text-[10px] text-white/55">{suffix}</span>
        ) : null}
      </span>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-2.5 py-1 text-[11px]">
      <span className="text-white/55">{k}</span>
      <span
        className="rounded-md border px-2 py-[3px] text-end font-mono text-[11px]"
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.08)",
          color: "#f5f5f7",
        }}
      >
        {v}
      </span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="mt-2.5 border-t pt-2.5"
      style={{ borderColor: "rgba(255,255,255,0.04)" }}
    >
      <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/55">
        {title}
      </div>
      {children}
    </div>
  );
}

function SwatchGrid({
  swatches,
  selected,
  onSelect,
}: {
  swatches: Array<{ id: string; bg: string; title: string }>;
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-1">
      {swatches.map((s) => {
        const isSel = s.id === selected;
        return (
          <button
            key={s.id}
            type="button"
            title={s.title}
            onClick={() => onSelect(s.id)}
            className={cn(
              "aspect-square cursor-pointer rounded-md border-2",
              isSel ? "border-white" : "border-transparent",
            )}
            style={{
              background: s.bg,
              boxShadow: isSel ? "0 0 0 1px #050507 inset" : undefined,
            }}
          />
        );
      })}
    </div>
  );
}
