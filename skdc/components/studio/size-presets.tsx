"use client";

/**
 * SizePresets — a horizontal chip row of common dimensions for the
 * selected unit's category. Designers often want to snap a cabinet to a
 * standard manufacturing width (400/450/.../1200 mm) without thinking;
 * this row makes that one click.
 *
 * The active chip (the one whose value matches the current dimension) is
 * highlighted with the aurora gradient so it stands out at a glance.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

const BORDER = "rgba(255,255,255,0.08)";

/**
 * Common widths per category. Sourced from typical Saudi/EU kitchen
 * manufacturer catalogs (Ikea, Nobilia, local fabricators) so the numbers
 * line up with what factories actually produce.
 */
export const WIDTH_PRESETS_BY_CATEGORY: Record<string, number[]> = {
  LOWER_CABINET: [400, 450, 500, 600, 800, 900, 1000, 1200],
  UPPER_CABINET: [400, 500, 600, 800, 900, 1000, 1200],
  TALL_CABINET: [600, 800, 900, 1200],
  ISLAND: [1200, 1500, 1800, 2000, 2400, 3000],
  APPLIANCE: [600, 700, 900],
  SINK: [500, 600, 800, 1000],
  COUNTERTOP: [600, 900, 1200, 1500, 1800, 2400],
};

/** Common standard heights per category (mm). */
export const HEIGHT_PRESETS_BY_CATEGORY: Record<string, number[]> = {
  LOWER_CABINET: [720, 850, 900],
  UPPER_CABINET: [600, 700, 800, 900],
  TALL_CABINET: [2000, 2200, 2400],
  ISLAND: [850, 900, 1100],
};

/** Common standard depths per category (mm). */
export const DEPTH_PRESETS_BY_CATEGORY: Record<string, number[]> = {
  LOWER_CABINET: [550, 600, 650],
  UPPER_CABINET: [300, 350, 400],
  TALL_CABINET: [550, 600],
  ISLAND: [600, 900, 1000, 1200],
};

/** Default width range envelopes (mm) for the slider per dimension axis. */
export const WIDTH_RANGE: [number, number] = [200, 3000];
export const HEIGHT_RANGE: [number, number] = [300, 2400];
export const DEPTH_RANGE: [number, number] = [200, 1500];

export interface SizePresetsProps {
  /** The DesignerUnit.category (e.g. "LOWER_CABINET"). */
  category: string;
  /** Which dimension this row sets. */
  axis: "width" | "height" | "depth";
  /** Current value of that axis, used to highlight the active chip. */
  value: number;
  /** Pick a preset → set the chosen dimension to this many mm. */
  onPick: (next: number) => void;
}

export function SizePresets({
  category,
  axis,
  value,
  onPick,
}: SizePresetsProps) {
  const table =
    axis === "width"
      ? WIDTH_PRESETS_BY_CATEGORY
      : axis === "height"
        ? HEIGHT_PRESETS_BY_CATEGORY
        : DEPTH_PRESETS_BY_CATEGORY;

  const presets = table[category];
  if (!presets || presets.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {presets.map((mm) => {
        const isActive = mm === value;
        return (
          <button
            key={mm}
            type="button"
            onClick={() => onPick(mm)}
            className={cn(
              "cursor-pointer rounded-full border px-2 py-[3px] font-mono text-[10px] transition-all",
              isActive ? "text-white" : "text-white/70 hover:text-white",
            )}
            style={
              isActive
                ? {
                    background:
                      "linear-gradient(135deg, var(--theme-stop-1,#a78bfa), var(--theme-stop-2,#f0abfc), var(--theme-stop-3,#38bdf8))",
                    borderColor: "transparent",
                    boxShadow:
                      "0 4px 14px -4px var(--theme-halo, rgba(167,139,250,0.55))",
                  }
                : {
                    background: "rgba(255,255,255,0.04)",
                    borderColor: BORDER,
                  }
            }
            aria-pressed={isActive}
            title={`${mm} مم`}
          >
            {mm}
          </button>
        );
      })}
    </div>
  );
}
