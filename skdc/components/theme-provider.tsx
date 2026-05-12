"use client";

import * as React from "react";
import {
  THEMES,
  DEFAULT_THEME_ID,
  applyTheme,
  getTheme,
  type Theme,
  type ThemeId,
} from "@/lib/themes";

const STORAGE_KEY = "skdc.theme";

type ThemeContextValue = {
  theme: Theme;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  themes: Theme[];
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = React.useState<ThemeId>(DEFAULT_THEME_ID);

  // Hydrate from localStorage on mount.
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
      if (saved && THEMES.some((t) => t.id === saved)) {
        setThemeIdState(saved);
        applyTheme(getTheme(saved));
      } else {
        applyTheme(getTheme(DEFAULT_THEME_ID));
      }
    } catch {
      applyTheme(getTheme(DEFAULT_THEME_ID));
    }
  }, []);

  const setTheme = React.useCallback((id: ThemeId) => {
    setThemeIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore quota / privacy mode
    }
    applyTheme(getTheme(id));
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      themeId,
      theme: getTheme(themeId),
      setTheme,
      themes: THEMES,
    }),
    [themeId, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
