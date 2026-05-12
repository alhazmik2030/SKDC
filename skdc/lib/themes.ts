/**
 * SKDC Theme System
 *
 * Each theme is a set of CSS custom properties applied to the <html> element.
 * Switching themes mutates document.documentElement.style — instant, no rerender.
 *
 * Adding a theme: append to THEMES with stops for the 3 aurora colors.
 */

export type ThemeId =
  | "aurora-violet"
  | "saudi-emerald"
  | "pearl-mono"
  | "royal-gold"
  | "cyber-cyan";

export interface Theme {
  id: ThemeId;
  name: string;
  nameAr: string;
  description: string;
  /** Three gradient stops (violet, fuchsia, sky in default theme). */
  stops: [string, string, string];
  /** Accent for badges, glows, active states. */
  accent: string;
  /** Halo glow color (rgba). */
  halo: string;
  /** Preview swatches for the picker UI. */
  swatches: [string, string, string];
}

export const THEMES: Theme[] = [
  {
    id: "aurora-violet",
    name: "Aurora Violet",
    nameAr: "أورورا بنفسجي",
    description: "الافتراضي · شبابي عصري",
    stops: ["#a78bfa", "#f0abfc", "#38bdf8"],
    accent: "#a78bfa",
    halo: "rgba(167, 139, 250, 0.45)",
    swatches: ["#a78bfa", "#f0abfc", "#38bdf8"],
  },
  {
    id: "saudi-emerald",
    name: "Saudi Emerald",
    nameAr: "زمرّد سعودي",
    description: "أخضر فخم · هوية وطنية",
    stops: ["#10b981", "#6ee7b7", "#ffffff"],
    accent: "#10b981",
    halo: "rgba(16, 185, 129, 0.45)",
    swatches: ["#059669", "#10b981", "#6ee7b7"],
  },
  {
    id: "pearl-mono",
    name: "Pearl Mono",
    nameAr: "لؤلؤي كلاسيكي",
    description: "أبيض/رمادي · أناقة هادئة",
    stops: ["#ffffff", "#e5e7eb", "#9ca3af"],
    accent: "#e5e7eb",
    halo: "rgba(229, 231, 235, 0.35)",
    swatches: ["#ffffff", "#d1d5db", "#6b7280"],
  },
  {
    id: "royal-gold",
    name: "Royal Gold",
    nameAr: "ذهبي ملكي",
    description: "ذهبي/برونزي · فخامة عالية",
    stops: ["#fbbf24", "#f59e0b", "#b45309"],
    accent: "#fbbf24",
    halo: "rgba(251, 191, 36, 0.45)",
    swatches: ["#fbbf24", "#f59e0b", "#92400e"],
  },
  {
    id: "cyber-cyan",
    name: "Cyber Cyan",
    nameAr: "سيبر سماوي",
    description: "تركوازي نيون · تقني محترف",
    stops: ["#22d3ee", "#06b6d4", "#0e7490"],
    accent: "#22d3ee",
    halo: "rgba(34, 211, 238, 0.45)",
    swatches: ["#22d3ee", "#06b6d4", "#155e75"],
  },
];

export const DEFAULT_THEME_ID: ThemeId = "aurora-violet";

export function getTheme(id: ThemeId): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/**
 * Apply a theme by mutating CSS custom properties on <html>.
 * Idempotent — safe to call as many times as needed.
 */
export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--theme-stop-1", theme.stops[0]);
  root.style.setProperty("--theme-stop-2", theme.stops[1]);
  root.style.setProperty("--theme-stop-3", theme.stops[2]);
  root.style.setProperty("--theme-accent", theme.accent);
  root.style.setProperty("--theme-halo", theme.halo);
  root.dataset.theme = theme.id;
}
