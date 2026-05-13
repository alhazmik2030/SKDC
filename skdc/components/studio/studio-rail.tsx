"use client";

import * as React from "react";
import type { Template, TemplateCategory } from "@prisma/client";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";
import type { StudioCategory } from "./studio-types";

const BORDER = "rgba(255,255,255,0.08)";
const GLASS_STRONG = "rgba(8,8,12,0.92)";

interface CategoryDef {
  id: TemplateCategory;
  labelKey: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryDef[] = [
  {
    id: "LOWER_CABINET",
    labelKey: "template.category.LOWER_CABINET",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="12" width="18" height="9" />
        <line x1="9" y1="14" x2="9" y2="19" />
        <line x1="15" y1="14" x2="15" y2="19" />
      </svg>
    ),
  },
  {
    id: "UPPER_CABINET",
    labelKey: "template.category.UPPER_CABINET",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="7" />
        <line x1="9" y1="5" x2="9" y2="8" />
      </svg>
    ),
  },
  {
    id: "CORNER",
    labelKey: "template.category.CORNER",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 21V3h18" />
        <path d="M9 21V9h12" />
      </svg>
    ),
  },
  {
    id: "TALL_CABINET",
    labelKey: "template.category.TALL_CABINET",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="6" y="2" width="12" height="20" />
      </svg>
    ),
  },
  {
    id: "DRAWER",
    labelKey: "template.category.DRAWER",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="5" />
        <rect x="3" y="13" width="18" height="5" />
      </svg>
    ),
  },
  {
    id: "APPLIANCE",
    labelKey: "template.category.APPLIANCE",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    id: "ACCESSORY",
    labelKey: "template.category.ACCESSORY",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
      </svg>
    ),
  },
];

export interface StudioRailProps {
  active: StudioCategory | null;
  onSelect: (c: StudioCategory) => void;
  templates: Template[];
}

export function StudioRail({ active, onSelect, templates }: StudioRailProps) {
  const { t } = useI18n();

  const counts = React.useMemo(() => {
    const map: Partial<Record<TemplateCategory, number>> = {};
    for (const tpl of templates) {
      map[tpl.category] = (map[tpl.category] ?? 0) + 1;
    }
    return map;
  }, [templates]);

  return (
    <div
      className="absolute end-3 top-[100px] z-[40] flex flex-col gap-[3px] rounded-2xl border p-1.5"
      style={{
        background: GLASS_STRONG,
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderColor: BORDER,
        boxShadow: "0 30px 60px -20px rgba(0,0,0,0.7)",
      }}
    >
      {CATEGORIES.map((c) => {
        const isActive = c.id === active;
        const count = counts[c.id] ?? 0;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={cn(
              "relative flex h-[52px] w-[52px] cursor-pointer flex-col items-center justify-center gap-px rounded-[10px] border border-transparent transition-all",
              isActive
                ? "text-white shadow-[0_8px_20px_-6px_rgba(167,139,250,0.45)]"
                : "text-white/55 hover:bg-white/5 hover:text-white",
            )}
            style={
              isActive
                ? {
                    background:
                      "linear-gradient(135deg, var(--theme-stop-1, #a78bfa), var(--theme-stop-2, #f0abfc))",
                  }
                : { background: "rgba(255,255,255,0.03)" }
            }
            aria-label={t(c.labelKey)}
          >
            <span className="h-[18px] w-[18px]">{c.icon}</span>
            <span className="text-[8px] font-bold tracking-[0.02em]">
              {t(c.labelKey)}
            </span>
            {count > 0 ? (
              <span
                className="absolute -end-[3px] -top-[3px] rounded-[7px] px-1 text-[9px] font-bold"
                style={{
                  background: "var(--theme-stop-2, #f0abfc)",
                  color: "#050507",
                }}
              >
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
