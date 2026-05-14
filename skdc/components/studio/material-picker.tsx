"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import {
  MATERIAL_GROUPS,
  MATERIAL_GROUP_LABEL_AR,
  MATERIAL_GROUP_LABEL_EN,
  materialsInGroup,
  type LibraryMaterial,
  type MaterialGroup,
} from "@/lib/designer/material-library";

const GLASS_STRONG = "rgba(8,8,12,0.92)";
const BORDER = "rgba(255,255,255,0.08)";

export type MaterialApplyScope = "selected" | "category" | "all";

export interface MaterialPickerProps {
  /** Currently-stored materialId on the selected unit (if any). */
  currentMaterialId?: string | null;
  /** Whether the user has any unit selected — controls "apply to selected". */
  hasSelection: boolean;
  /** Whether to enable the "apply to category" button (selection + a category). */
  hasCategory: boolean;
  /** Translated label for the selected unit's category, e.g. "خزائن سفلية". */
  categoryLabel?: string | null;
  onApply: (materialId: string, scope: MaterialApplyScope) => void;
  onClose: () => void;
}

/**
 * Floating modal-style picker anchored under the existing Walls / Hide-walls
 * pills on the right edge of the Studio canvas. Matches the visual language
 * of `studio-walls-panel.tsx` (smoked glass + aurora gradient accents).
 */
export function MaterialPicker({
  currentMaterialId,
  hasSelection,
  hasCategory,
  categoryLabel,
  onApply,
  onClose,
}: MaterialPickerProps) {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  const [activeGroup, setActiveGroup] = React.useState<MaterialGroup>(() => {
    // Open on the group containing the currently-applied material, if any.
    for (const g of MATERIAL_GROUPS) {
      if (materialsInGroup(g).some((m) => m.id === currentMaterialId)) return g;
    }
    return "WOOD";
  });

  const [pendingId, setPendingId] = React.useState<string | null>(
    currentMaterialId ?? null,
  );

  const groupItems = React.useMemo(
    () => materialsInGroup(activeGroup),
    [activeGroup],
  );

  const groupLabel = (g: MaterialGroup): string =>
    isAr ? MATERIAL_GROUP_LABEL_AR[g] : MATERIAL_GROUP_LABEL_EN[g];

  const applyDisabled = pendingId == null;

  function handleApply(scope: MaterialApplyScope) {
    if (!pendingId) return;
    onApply(pendingId, scope);
  }

  return (
    <div
      role="dialog"
      aria-label={isAr ? "اختيار الخامات" : "Material picker"}
      className="absolute end-[78px] top-[100px] z-[42] w-[380px] overflow-hidden rounded-2xl border shadow-2xl"
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
          {isAr ? "مكتبة الخامات" : "Material library"}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={isAr ? "إغلاق" : "Close"}
          className="rounded-md p-1 text-white/55 transition-colors hover:bg-white/5 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Group tabs */}
      <div
        className="grid grid-cols-4 border-b text-[11px]"
        style={{ borderColor: BORDER }}
      >
        {MATERIAL_GROUPS.map((g) => (
          <GroupTab
            key={g}
            active={activeGroup === g}
            onClick={() => setActiveGroup(g)}
          >
            {groupLabel(g)}
          </GroupTab>
        ))}
      </div>

      {/* Swatch grid */}
      <div className="max-h-[52vh] overflow-y-auto p-3">
        <div className="grid grid-cols-4 gap-2.5">
          {groupItems.map((m) => (
            <Swatch
              key={m.id}
              material={m}
              isAr={isAr}
              selected={pendingId === m.id}
              applied={currentMaterialId === m.id}
              onPick={() => setPendingId(m.id)}
            />
          ))}
        </div>
      </div>

      {/* Footer actions */}
      <div
        className="flex flex-col gap-1.5 border-t p-2.5"
        style={{ borderColor: BORDER }}
      >
        <ActionButton
          tone="primary"
          disabled={applyDisabled || !hasSelection}
          onClick={() => handleApply("selected")}
        >
          {isAr ? "تطبيق على المحدد" : "Apply to selected"}
        </ActionButton>
        <ActionButton
          tone="secondary"
          disabled={applyDisabled || !hasCategory}
          onClick={() => handleApply("category")}
          title={categoryLabel ?? undefined}
        >
          {isAr ? "تطبيق على الفئة" : "Apply to category"}
          {categoryLabel ? (
            <span className="ms-2 text-[9px] font-bold text-white/55">
              · {categoryLabel}
            </span>
          ) : null}
        </ActionButton>
        <ActionButton
          tone="secondary"
          disabled={applyDisabled}
          onClick={() => handleApply("all")}
        >
          {isAr ? "تطبيق على الكل" : "Apply to all"}
        </ActionButton>
      </div>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function GroupTab({
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
      className="relative py-2 text-center text-[11px] font-bold transition-colors"
      style={{
        color: active ? "#fff" : "rgba(255,255,255,0.55)",
        background: active ? "rgba(255,255,255,0.04)" : "transparent",
      }}
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

function Swatch({
  material,
  isAr,
  selected,
  applied,
  onPick,
}: {
  material: LibraryMaterial;
  isAr: boolean;
  selected: boolean;
  applied: boolean;
  onPick: () => void;
}) {
  const name = isAr ? material.nameAr : material.nameEn;
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={selected}
      aria-label={name}
      title={name}
      className="group relative flex flex-col items-stretch gap-1 rounded-lg border p-1 text-start transition-all"
      style={{
        borderColor: selected
          ? "transparent"
          : "rgba(255,255,255,0.08)",
        background: selected
          ? "linear-gradient(135deg, rgba(167,139,250,0.18), rgba(56,189,248,0.10))"
          : "rgba(255,255,255,0.02)",
        boxShadow: selected
          ? "0 0 0 1.5px var(--theme-stop-1,#a78bfa), 0 8px 20px -10px var(--theme-halo,rgba(167,139,250,0.55))"
          : "none",
      }}
    >
      <div
        className="aspect-square w-full overflow-hidden rounded-md border"
        style={{
          background: material.thumbnail,
          backgroundBlendMode: "multiply",
          borderColor: "rgba(255,255,255,0.10)",
        }}
      />
      <div className="flex items-center justify-between gap-1 px-0.5">
        <span
          className="truncate text-[10px] font-bold"
          style={{ color: selected ? "#fff" : "rgba(255,255,255,0.78)" }}
        >
          {name}
        </span>
        {applied ? (
          <span
            className="shrink-0 rounded-full px-1 text-[8px] font-black"
            style={{
              background: "rgba(167,139,250,0.20)",
              color: "#e0d4ff",
            }}
          >
            {isAr ? "حالي" : "now"}
          </span>
        ) : null}
      </div>
    </button>
  );
}

function ActionButton({
  tone,
  disabled,
  onClick,
  children,
  title,
}: {
  tone: "primary" | "secondary";
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  const primary = tone === "primary";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex h-9 items-center justify-center rounded-lg border px-3 text-[11px] font-black transition-all disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        background: primary
          ? "linear-gradient(135deg, var(--theme-stop-1,#a78bfa), var(--theme-stop-3,#38bdf8))"
          : "rgba(255,255,255,0.04)",
        color: primary ? "#fff" : "rgba(255,255,255,0.85)",
        borderColor: primary ? "transparent" : "rgba(255,255,255,0.08)",
        boxShadow: primary
          ? "0 8px 24px -8px var(--theme-halo,rgba(167,139,250,0.55))"
          : "none",
      }}
    >
      {children}
    </button>
  );
}
