"use client";

/**
 * DimensionSlider — a reusable "label + range + numeric input" row.
 *
 * Designed for the Studio inspector so that designers can pick exact
 * millimeter dimensions for a unit (width / height / depth) using either
 * a draggable slider or by typing into the number input. The two stay in
 * sync; the slider's filled portion uses the aurora theme gradient so it
 * matches the rest of the Studio chrome.
 *
 * RTL aware — the layout is logical (`start`/`end`), but the slider's
 * progress is rendered with a CSS variable so the gradient fill goes from
 * `min` to `value` regardless of writing direction.
 */

import * as React from "react";

const BORDER = "rgba(255,255,255,0.08)";
const TRACK_BG = "rgba(255,255,255,0.06)";

export interface DimensionSliderProps {
  /** Arabic-first label (e.g. "العرض"). */
  label: string;
  /** Current value, in the same unit as min/max (typically mm). */
  value: number;
  min: number;
  max: number;
  /** Slider/numeric step. Default 10 (mm). */
  step?: number;
  /** Suffix shown next to the numeric input, e.g. "مم". */
  suffix?: string;
  /** Called whenever the user drags the slider or types a new number. */
  onChange: (next: number) => void;
}

export function DimensionSlider({
  label,
  value,
  min,
  max,
  step = 10,
  suffix = "مم",
  onChange,
}: DimensionSliderProps) {
  // Clamp incoming value so the slider never visually escapes [min, max].
  const clamped = Math.min(Math.max(value, min), max);
  const pct = max > min ? ((clamped - min) / (max - min)) * 100 : 0;

  const commit = React.useCallback(
    (n: number) => {
      if (Number.isNaN(n)) return;
      // Snap to step and clamp.
      const snapped = Math.round(n / step) * step;
      const next = Math.min(Math.max(snapped, min), max);
      if (next !== value) onChange(next);
    },
    [min, max, step, value, onChange],
  );

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 py-1.5 text-[11px]">
      <span className="min-w-[36px] text-white/65">{label}</span>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamped}
        onChange={(e) => commit(Number(e.target.value))}
        className="dimension-slider h-[18px] w-full cursor-pointer appearance-none rounded-full"
        style={
          {
            // Aurora-gradient fill up to current value, neutral track after.
            background: `linear-gradient(
              to right,
              var(--theme-stop-1, #a78bfa) 0%,
              var(--theme-stop-2, #f0abfc) ${pct / 2}%,
              var(--theme-stop-3, #38bdf8) ${pct}%,
              ${TRACK_BG} ${pct}%,
              ${TRACK_BG} 100%
            )`,
            border: `1px solid ${BORDER}`,
            // Expose the percentage to CSS for any pseudo-element styling
            // that other parts of the app may want to hook into.
            ["--fill" as string]: `${pct}%`,
          } as React.CSSProperties
        }
        aria-label={label}
      />

      <span className="inline-flex items-center gap-1">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={clamped}
          onChange={(e) => commit(Number(e.target.value))}
          className="w-[58px] rounded-md border px-1.5 py-[3px] text-end font-mono text-[11px] outline-none focus:border-white/30"
          style={{
            background: "rgba(255,255,255,0.04)",
            borderColor: BORDER,
            color: "#f5f5f7",
          }}
        />
        {suffix ? (
          <span className="text-[9px] text-white/45">{suffix}</span>
        ) : null}
      </span>

      <style jsx>{`
        /* Custom slider thumb — small aurora-haloed pill. */
        .dimension-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 999px;
          background: #f5f5f7;
          border: 2px solid var(--theme-stop-1, #a78bfa);
          box-shadow:
            0 0 0 2px rgba(8, 8, 12, 0.6),
            0 0 14px var(--theme-halo, rgba(167, 139, 250, 0.55));
          cursor: grab;
          transition: transform 120ms ease;
        }
        .dimension-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.15);
        }
        .dimension-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 999px;
          background: #f5f5f7;
          border: 2px solid var(--theme-stop-1, #a78bfa);
          box-shadow:
            0 0 0 2px rgba(8, 8, 12, 0.6),
            0 0 14px var(--theme-halo, rgba(167, 139, 250, 0.55));
          cursor: grab;
        }
        .dimension-slider:focus-visible {
          outline: 2px solid var(--theme-stop-1, #a78bfa);
          outline-offset: 2px;
        }
        /* Hide the spin-buttons on the number input — they steal pixels. */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
