"use client";

import * as React from "react";
import { X } from "lucide-react";
import type { KitchenTemplate, Template } from "@prisma/client";
import { useI18n } from "@/components/i18n-provider";
import type { StudioCategory } from "./studio-types";

const BORDER = "rgba(255,255,255,0.08)";
const GLASS_STRONG = "rgba(8,8,12,0.92)";

export interface StudioPaletteProps {
  category: StudioCategory;
  templates: Template[];
  glbTemplates: KitchenTemplate[];
  onAdd: (tpl: Template) => void;
  onAddGlb: (tpl: KitchenTemplate) => void;
  /** Close the palette (deselect the rail category). */
  onClose?: () => void;
}

export function StudioPalette({
  category,
  templates,
  glbTemplates,
  onAdd,
  onAddGlb,
  onClose,
}: StudioPaletteProps) {
  const { t } = useI18n();

  const filtered = React.useMemo(
    () => templates.filter((t) => t.category === category),
    [templates, category],
  );

  // GLB templates are keyed on a stringified category so library entries
  // for categories outside the procedural TemplateCategory union (future)
  // still show up under the right rail tab.
  const filteredGlb = React.useMemo(
    () => glbTemplates.filter((t) => t.category === category),
    [glbTemplates, category],
  );

  return (
    <div
      className="absolute end-[80px] top-[100px] z-[41] w-[280px] overflow-y-auto rounded-2xl border p-3"
      style={{
        background: GLASS_STRONG,
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderColor: BORDER,
        boxShadow: "0 30px 70px -20px rgba(0,0,0,0.75)",
        maxHeight: "calc(100vh - 220px)",
      }}
    >
      <h3 className="mb-2.5 flex items-center justify-between gap-2 text-[12px] font-semibold">
        <span>{t(`template.category.${category}`)}</span>
        <span className="flex items-center gap-2">
          <span className="text-[10px] font-normal text-white/55">
            {filtered.length + filteredGlb.length} {t("designer.palette.title")}
          </span>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label={t("studio.close") || "إغلاق"}
              title={t("studio.close") || "إغلاق"}
              className="grid h-5 w-5 place-items-center rounded-md text-white/55 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </span>
      </h3>

      {filtered.length === 0 && filteredGlb.length === 0 ? (
        <div className="px-2 py-8 text-center text-[11px] text-white/55">
          {t("empty.templates.category")}
        </div>
      ) : (
        <>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 gap-1.5">
              {filtered.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => onAdd(tpl)}
                  className="cursor-pointer rounded-[10px] border p-1.5 text-start transition-all hover:bg-[rgba(167,139,250,0.08)]"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderColor: BORDER,
                  }}
                >
                  <div
                    className="relative mb-1 h-12 rounded-md"
                    style={{
                      background:
                        "linear-gradient(135deg, #d6b48a, #b7935d)",
                    }}
                  >
                    <span
                      aria-hidden
                      className="absolute left-1/2 top-[60%] block h-[2px] w-1/2 -translate-x-1/2 rounded-[1px]"
                      style={{ background: "rgba(70,50,22,0.8)" }}
                    />
                  </div>
                  <div className="text-[10px] font-semibold leading-tight">
                    {tpl.name}
                  </div>
                  <div className="mt-px font-mono text-[8px] text-white/55">
                    {tpl.defaultWidth}×{tpl.defaultHeight}×{tpl.defaultDepth}
                  </div>
                </button>
              ))}
            </div>
          ) : null}

          {filteredGlb.length > 0 ? (
            <>
              <div className="mb-1 mt-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-white/65">
                <span>قوالب من المكتبة</span>
                <span className="text-[9px] font-normal text-white/45">
                  {filteredGlb.length}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {filteredGlb.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => onAddGlb(tpl)}
                    className="cursor-pointer rounded-[10px] border p-1.5 text-start transition-all hover:bg-[rgba(56,189,248,0.10)]"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderColor: BORDER,
                    }}
                  >
                    <div
                      className="relative mb-1 h-12 overflow-hidden rounded-md"
                      style={{
                        background: tpl.thumbnailUrl
                          ? `url(${tpl.thumbnailUrl}) center/cover, linear-gradient(135deg, #2c3e50, #4a6fa5)`
                          : "linear-gradient(135deg, #2c3e50, #4a6fa5)",
                      }}
                    >
                      {!tpl.thumbnailUrl ? (
                        <span className="absolute inset-0 grid place-items-center text-[8px] font-bold text-white/70">
                          GLB
                        </span>
                      ) : null}
                      {tpl.featured ? (
                        <span
                          aria-hidden
                          className="absolute end-0.5 top-0.5 rounded-sm bg-amber-300 px-1 text-[7px] font-black text-black"
                        >
                          ★
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[10px] font-semibold leading-tight">
                      {tpl.nameAr ?? tpl.name}
                    </div>
                    <div className="mt-px font-mono text-[8px] text-white/55">
                      {tpl.defaultWidth}×{tpl.defaultHeight}×{tpl.defaultDepth}
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
