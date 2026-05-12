"use client";

import * as React from "react";
import {
  DEFAULT_LOCALE,
  getDir,
  translations,
  type Locale,
} from "@/lib/i18n/translations";

const STORAGE_KEY = "skdc.locale";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
};

const I18nContext = React.createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && translations[saved]) {
        setLocaleState(saved);
        applyDir(saved);
      } else {
        applyDir(DEFAULT_LOCALE);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLocale = React.useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
    applyDir(l);
  }, []);

  const t = React.useCallback(
    (key: string) => translations[locale][key] ?? translations[DEFAULT_LOCALE][key] ?? key,
    [locale],
  );

  const value = React.useMemo<Ctx>(
    () => ({ locale, setLocale, t, dir: getDir(locale) }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}

function applyDir(locale: Locale) {
  if (typeof document === "undefined") return;
  document.documentElement.dir = getDir(locale);
  document.documentElement.lang = locale;
}
