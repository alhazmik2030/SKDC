"use client";

/**
 * RoomShapePicker — pure presentational segmented control.
 *
 * Renders the five supported `RoomShape` values as a horizontal row of buttons.
 * Each button shows a small 32×32 SVG floor-plan diagram (drawn inline, no
 * external assets) and an i18n-aware label. Active option uses the theme
 * gradient defined by CSS variables (--theme-stop-1, --theme-stop-2,
 * --theme-halo); inactive uses a muted hover.
 *
 * This component is intentionally state-free — the parent owns the selection.
 */

import * as React from "react";
import { useI18n } from "@/components/i18n-provider";
import type { RoomShape } from "@/lib/designer/room-shapes";

interface ShapeOption {
  value: RoomShape;
  labelKey: string;
  Diagram: React.ComponentType;
}

const OPTIONS: ShapeOption[] = [
  { value: "SINGLE_WALL", labelKey: "designer.roomShape.singleWall", Diagram: SingleWallDiagram },
  { value: "L_SHAPE", labelKey: "designer.roomShape.lShape", Diagram: LShapeDiagram },
  { value: "U_SHAPE", labelKey: "designer.roomShape.uShape", Diagram: UShapeDiagram },
  { value: "CLOSED", labelKey: "designer.roomShape.fourWalls", Diagram: ClosedDiagram },
  { value: "ISLAND", labelKey: "designer.roomShape.island", Diagram: IslandDiagram },
];

export interface RoomShapePickerProps {
  value: RoomShape;
  onChange: (next: RoomShape) => void;
}

export function RoomShapePicker({
  value,
  onChange,
}: RoomShapePickerProps): React.JSX.Element {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {t("designer.roomShape.label")}
      </div>
      <div
        role="radiogroup"
        aria-label={t("designer.roomShape.label")}
        className="flex flex-wrap gap-1.5 rounded-xl border border-border/60 bg-background/40 p-1.5"
      >
        {OPTIONS.map((opt) => {
          const active = opt.value === value;
          const label = t(opt.labelKey);
          const Diagram = opt.Diagram;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              title={label}
              className={
                active
                  ? "flex min-w-[72px] flex-col items-center gap-1 rounded-lg px-2.5 py-2 text-[11px] font-medium text-white transition-all"
                  : "flex min-w-[72px] flex-col items-center gap-1 rounded-lg px-2.5 py-2 text-[11px] font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground"
              }
              style={
                active
                  ? {
                      background:
                        "linear-gradient(135deg, var(--theme-stop-1,#a78bfa) 0%, var(--theme-stop-2,#f0abfc) 100%)",
                      boxShadow:
                        "0 10px 25px -10px var(--theme-halo, rgba(167,139,250,0.5))",
                    }
                  : undefined
              }
            >
              <Diagram />
              <span className="leading-tight">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Diagrams                                                                    */
/*                                                                             */
/* All diagrams are 32×32 floor-plan icons using `stroke="currentColor"` so    */
/* they inherit the parent button's text colour (white when active, muted     */
/* otherwise). Stroke is thick enough to read at small sizes.                  */
/* -------------------------------------------------------------------------- */

const SVG_PROPS = {
  width: 32,
  height: 32,
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function SingleWallDiagram() {
  // One horizontal line at the top — represents a back wall only.
  return (
    <svg {...SVG_PROPS}>
      <line x1="5" y1="9" x2="27" y2="9" />
    </svg>
  );
}

function LShapeDiagram() {
  // Back wall + left wall forming an L.
  return (
    <svg {...SVG_PROPS}>
      <polyline points="5,27 5,7 27,7" />
    </svg>
  );
}

function UShapeDiagram() {
  // Back + left + right walls.
  return (
    <svg {...SVG_PROPS}>
      <polyline points="5,27 5,7 27,7 27,27" />
    </svg>
  );
}

function ClosedDiagram() {
  // Full rectangle — four walls.
  return (
    <svg {...SVG_PROPS}>
      <rect x="5" y="7" width="22" height="20" rx="1.5" />
    </svg>
  );
}

function IslandDiagram() {
  // Rectangle outline with a small centred inner rectangle = island plate.
  return (
    <svg {...SVG_PROPS}>
      <rect x="5" y="7" width="22" height="20" rx="1.5" />
      <rect x="13" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}
