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
 * Common widths/heights/depths per category and per appliance sub-type.
 * Sourced from EU/Saudi manufacturer catalogs (IKEA, Nobilia, Bosch,
 * Samsung, Daewoo, local fabricators) — numbers match what factories
 * actually produce.
 *
 * APPLIANCE templates are too coarse, so the inspector also passes the
 * unit's `templateName` and we look up an appliance-specific key
 * ("COOKTOP", "OVEN", etc.) when the name matches. See `subCategoryFor()`.
 */
export const WIDTH_PRESETS_BY_CATEGORY: Record<string, number[]> = {
  // Cabinetry
  LOWER_CABINET: [400, 450, 500, 600, 800, 900, 1000, 1200],
  UPPER_CABINET: [400, 500, 600, 800, 900, 1000, 1200],
  TALL_CABINET: [600, 800, 900, 1200],
  ISLAND: [1200, 1500, 1800, 2000, 2400, 3000],
  COUNTERTOP: [600, 900, 1200, 1500, 1800, 2400],
  // Sinks
  SINK: [400, 500, 600, 800, 1000, 1200],
  FAUCET: [40, 50, 60], // tap footprint
  // Appliances — built-in standards (EU 60cm carcass)
  COOKTOP: [300, 600, 750, 900],           // 4/5/6 burners
  OVEN: [600],                              // built-in standard
  MICROWAVE: [460, 595, 600],
  HOOD: [600, 700, 800, 900, 1200],
  FRIDGE: [540, 595, 700],
  FRIDGE_SBS: [900, 1000, 1100, 1200],
  DISHWASHER: [450, 600],                   // slim / full
  WASHING_MACHINE: [600],
  COFFEE_MACHINE: [450, 595],
  KETTLE: [200, 240, 280],
  APPLIANCE: [600, 750, 900],               // generic fallback
};

/** Common standard heights per category (mm). */
export const HEIGHT_PRESETS_BY_CATEGORY: Record<string, number[]> = {
  // Cabinetry
  LOWER_CABINET: [720, 850, 900],
  UPPER_CABINET: [600, 700, 800, 900],
  TALL_CABINET: [2000, 2200, 2400],
  ISLAND: [850, 900, 1100],
  // Appliances
  COOKTOP: [50, 80, 100],                   // slim slab on top of counter
  OVEN: [595, 600],                         // built-in tower opening
  MICROWAVE: [380, 388, 455],
  HOOD: [200, 400, 600, 1100],              // chimney column varies
  FRIDGE: [1800, 1900, 2000, 2050],
  FRIDGE_SBS: [1750, 1780, 1850],
  DISHWASHER: [815, 850, 875],
  WASHING_MACHINE: [820, 850],
  COFFEE_MACHINE: [380, 455],
  KETTLE: [240, 280, 320],
  SINK: [180, 200, 250],                    // depth into the cabinet
  FAUCET: [200, 300, 400, 500],
};

/** Common standard depths per category (mm). */
export const DEPTH_PRESETS_BY_CATEGORY: Record<string, number[]> = {
  // Cabinetry
  LOWER_CABINET: [550, 600, 650],
  UPPER_CABINET: [300, 350, 400],
  TALL_CABINET: [550, 600],
  ISLAND: [600, 900, 1000, 1200],
  // Appliances
  COOKTOP: [510, 520, 550],
  OVEN: [540, 550, 570],
  MICROWAVE: [320, 340, 380],
  HOOD: [280, 300, 500, 600],
  FRIDGE: [600, 650, 700],
  FRIDGE_SBS: [700, 720, 750],
  DISHWASHER: [550, 570, 600],
  WASHING_MACHINE: [550, 600],
  COFFEE_MACHINE: [320, 380],
  KETTLE: [200, 240, 280],
  SINK: [400, 450, 500, 600],
  FAUCET: [40, 50, 60],
};

/**
 * Derive a more specific category from the unit's templateName. Falls back
 * to the original category when nothing matches. The keywords cover both
 * Arabic and English template names from our seed/Sketchfab library.
 */
export function subCategoryFor(category: string, templateName?: string): string {
  if (category !== "APPLIANCE" && category !== "SINK") return category;
  const n = (templateName || "").toLowerCase();
  // Order matters — more specific matches first
  if (/سايد|side[\s-]?by[\s-]?side|sbs/.test(n)) return "FRIDGE_SBS";
  if (/ثلاج|fridge|refrig/.test(n)) return "FRIDGE";
  if (/موقد|شعل|hob\b|cooktop|stove[-\s]?top/.test(n)) return "COOKTOP";
  if (/فرن|oven/.test(n)) return "OVEN";
  if (/مايكرو|microwave/.test(n)) return "MICROWAVE";
  if (/شفاط|hood|extractor|chimney/.test(n)) return "HOOD";
  if (/غسالة.*صحون|dishwash/.test(n)) return "DISHWASHER";
  if (/غسالة|washer|washing/.test(n)) return "WASHING_MACHINE";
  if (/قهوة|coffee|espresso/.test(n)) return "COFFEE_MACHINE";
  if (/غلاية|kettle/.test(n)) return "KETTLE";
  if (/صنبور|tap|faucet/.test(n)) return "FAUCET";
  if (/حوض|sink|basin/.test(n)) return "SINK";
  return category;
}

/** Generic fallback envelopes (mm) — used only if a category isn't listed. */
export const WIDTH_RANGE: [number, number] = [200, 3000];
export const HEIGHT_RANGE: [number, number] = [300, 2400];
export const DEPTH_RANGE: [number, number] = [200, 1500];

/**
 * Per-category slider envelopes. The min/max are real-world limits per
 * appliance/cabinet type, so the slider can't go below a manufacturable
 * width or above a workshop-feasible one.
 */
const RANGE_BY_CATEGORY: Record<
  string,
  { width: [number, number]; height: [number, number]; depth: [number, number] }
> = {
  // Cabinetry
  LOWER_CABINET:   { width: [300, 1500], height: [600, 950],   depth: [400, 800] },
  UPPER_CABINET:   { width: [300, 1500], height: [400, 1100],  depth: [250, 450] },
  TALL_CABINET:    { width: [400, 1500], height: [1800, 2400], depth: [400, 800] },
  ISLAND:          { width: [800, 4000], height: [700, 1200],  depth: [500, 1500] },
  COUNTERTOP:      { width: [400, 4000], height: [20, 80],     depth: [300, 1500] },
  // Sinks + faucet
  SINK:            { width: [300, 1500], height: [100, 300],   depth: [300, 700] },
  FAUCET:          { width: [30, 100],   height: [150, 600],   depth: [30, 100] },
  // Built-in appliances (EU 60cm carcass standard)
  COOKTOP:         { width: [300, 1200], height: [40, 150],    depth: [400, 600] },
  OVEN:            { width: [500, 900],  height: [400, 700],   depth: [500, 650] },
  MICROWAVE:       { width: [400, 700],  height: [250, 500],   depth: [300, 450] },
  HOOD:            { width: [500, 1500], height: [150, 1200],  depth: [250, 700] },
  FRIDGE:          { width: [400, 900],  height: [800, 2100],  depth: [500, 800] },
  FRIDGE_SBS:      { width: [800, 1300], height: [1500, 1900], depth: [600, 800] },
  DISHWASHER:      { width: [400, 700],  height: [750, 900],   depth: [500, 650] },
  WASHING_MACHINE: { width: [550, 700],  height: [800, 900],   depth: [500, 700] },
  COFFEE_MACHINE:  { width: [400, 650],  height: [350, 500],   depth: [300, 450] },
  KETTLE:          { width: [150, 350],  height: [200, 380],   depth: [150, 300] },
  APPLIANCE:       { width: [400, 1500], height: [300, 2200],  depth: [400, 800] },
};

/**
 * Resolve slider min/max for a unit. Tries the most specific key first
 * (e.g. "COOKTOP" detected from template name) then falls back to the
 * raw category, then to the generic envelopes.
 */
export function rangesFor(
  category: string,
  templateName?: string,
): { width: [number, number]; height: [number, number]; depth: [number, number] } {
  const key = subCategoryFor(category, templateName);
  return (
    RANGE_BY_CATEGORY[key] ||
    RANGE_BY_CATEGORY[category] || {
      width: WIDTH_RANGE,
      height: HEIGHT_RANGE,
      depth: DEPTH_RANGE,
    }
  );
}

export interface SizePresetsProps {
  /** The DesignerUnit.category (e.g. "LOWER_CABINET"). */
  category: string;
  /** Template name — used to pick a more specific appliance sub-type. */
  templateName?: string;
  /** Which dimension this row sets. */
  axis: "width" | "height" | "depth";
  /** Current value of that axis, used to highlight the active chip. */
  value: number;
  /** Pick a preset → set the chosen dimension to this many mm. */
  onPick: (next: number) => void;
}

export function SizePresets({
  category,
  templateName,
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

  const key = subCategoryFor(category, templateName);
  const presets = table[key] || table[category];
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
