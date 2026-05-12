"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check, X } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

/**
 * ThemeSwitcher — opens as a floating modal sheet from the bottom/center.
 * Trigger comes from the user-menu "تبديل المظهر" item.
 *
 * Use the imperative API:
 *   const { open } = useThemeSwitcher();
 *   open();
 */

type Ctx = { open: () => void; close: () => void };
const SwitcherCtx = React.createContext<Ctx | null>(null);

export function ThemeSwitcherProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = React.useState(false);
  const ctx = React.useMemo<Ctx>(
    () => ({ open: () => setOpen(true), close: () => setOpen(false) }),
    [],
  );

  return (
    <SwitcherCtx.Provider value={ctx}>
      {children}
      <AnimatePresence>{isOpen && <ThemeSwitcherModal onClose={ctx.close} />}</AnimatePresence>
    </SwitcherCtx.Provider>
  );
}

export function useThemeSwitcher() {
  const ctx = React.useContext(SwitcherCtx);
  if (!ctx) throw new Error("useThemeSwitcher must be used inside <ThemeSwitcherProvider>");
  return ctx;
}

function ThemeSwitcherModal({ onClose }: { onClose: () => void }) {
  const { themes, themeId, setTheme } = useTheme();

  // Close on ESC
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[200] grid place-items-center bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="glass relative mx-4 w-full max-w-lg overflow-hidden rounded-3xl p-8"
      >
        {/* Aurora ambient */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, var(--theme-halo, rgba(167,139,250,0.25)), transparent 70%)",
          }}
        />

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--theme-stop-1,#a78bfa)] via-[var(--theme-stop-2,#f0abfc)] to-[var(--theme-stop-3,#38bdf8)] shadow-lg">
              <Palette className="h-5 w-5 text-background" />
            </div>
            <div>
              <h2 className="text-lg font-bold">تبديل المظهر</h2>
              <p className="text-xs text-muted-foreground">اختر اللوحة اللونية المفضلة</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Themes grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {themes.map((t) => {
            const active = t.id === themeId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border p-4 text-right transition-all",
                  active
                    ? "border-foreground/40 bg-white/[0.04] shadow-lg"
                    : "border-border bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]",
                )}
              >
                {/* Swatches strip */}
                <div className="mb-3 flex gap-1.5">
                  {t.swatches.map((c, i) => (
                    <div
                      key={i}
                      className="h-8 flex-1 rounded-lg shadow-inner"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold">{t.nameAr}</div>
                    <div className="text-xs text-muted-foreground">{t.description}</div>
                  </div>
                  {active ? (
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-foreground text-background">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  ) : null}
                </div>

                {active ? (
                  <div
                    className="pointer-events-none absolute inset-0 -z-10"
                    style={{
                      background: `linear-gradient(135deg, ${t.stops[0]}15, ${t.stops[2]}15)`,
                    }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          الاختيار محفوظ على هذا المتصفح. سنزامنه مع حسابك في المرحلة القادمة.
        </p>
      </motion.div>
    </motion.div>
  );
}
