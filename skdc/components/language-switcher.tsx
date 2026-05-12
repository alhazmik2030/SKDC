"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/components/i18n-provider";
import { LOCALES, type Locale } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

/**
 * Language switcher with prominent country flags.
 *
 * Variants:
 *   - "compact"  — 3 small flag chips in a row (for topbar)
 *   - "modal"    — large flag cards (for first-time user / landing)
 *   - "dropdown" — single flag button that expands a panel
 */
export function LanguageSwitcher({
  variant = "compact",
  className,
}: {
  variant?: "compact" | "modal" | "dropdown";
  className?: string;
}) {
  if (variant === "modal") return <ModalSwitcher className={className} />;
  if (variant === "dropdown") return <DropdownSwitcher className={className} />;
  return <CompactSwitcher className={className} />;
}

// ============================================================
// Compact — 3 inline flag chips, very visible
// ============================================================
function CompactSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <div
      className={cn(
        "glass inline-flex items-center gap-0.5 rounded-full p-1 backdrop-blur-md",
        className,
      )}
      role="group"
      aria-label="Language switcher"
    >
      {LOCALES.map((l) => {
        const active = locale === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLocale(l.code)}
            aria-label={`Switch to ${l.label}`}
            aria-pressed={active}
            title={l.nativeLabel}
            className={cn(
              "group relative grid h-8 w-8 place-items-center rounded-full transition-all",
              active
                ? "bg-gradient-to-br from-white to-white/90 shadow-md ring-2 ring-violet-400/40"
                : "hover:bg-white/5",
            )}
          >
            <span className="text-xl leading-none">{l.flagEmoji}</span>
            {active ? (
              <motion.span
                layoutId="lang-active-dot"
                className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-violet-400"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// Dropdown — single flag button, expands menu on click
// ============================================================
function DropdownSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const current = LOCALES.find((l) => l.code === locale)!;
  const [open, setOpen] = React.useState(false);

  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Language"
        className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors hover:bg-white/5"
      >
        <span className="text-base leading-none">{current.flagEmoji}</span>
        <span className="text-xs font-medium">{current.nativeLabel}</span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="glass absolute right-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-2xl border border-border bg-card/95 backdrop-blur-xl"
          >
            {LOCALES.map((l) => {
              const active = locale === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLocale(l.code);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-right text-sm transition-colors hover:bg-white/5",
                    active && "bg-gradient-to-l from-violet-500/10 to-transparent",
                  )}
                >
                  <span className="text-xl leading-none">{l.flagEmoji}</span>
                  <span className="flex-1 font-medium">{l.nativeLabel}</span>
                  {active ? (
                    <span className="h-2 w-2 rounded-full bg-violet-400" />
                  ) : null}
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Modal — large flag cards (use for first-time picker)
// ============================================================
function ModalSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      {LOCALES.map((l) => {
        const active = locale === l.code;
        return (
          <motion.button
            key={l.code}
            type="button"
            onClick={() => setLocale(l.code)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "group relative flex flex-col items-center gap-2 rounded-2xl border p-5 transition-all",
              active
                ? "border-violet-400/50 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 shadow-lg shadow-violet-500/20"
                : "border-border bg-white/[0.02] hover:border-violet-400/30 hover:bg-white/5",
            )}
          >
            <span className="text-5xl leading-none drop-shadow-lg">{l.flagEmoji}</span>
            <span
              className={cn(
                "text-sm font-semibold",
                active ? "text-foreground" : "text-muted-foreground",
              )}
              dir={l.dir}
            >
              {l.nativeLabel}
            </span>
            {active ? (
              <div className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-foreground text-background">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6L5 9L10 3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ) : null}
          </motion.button>
        );
      })}
    </div>
  );
}

/** Export individual variants for direct import too. */
export { CompactSwitcher, ModalSwitcher, DropdownSwitcher };

/** Hook to programmatically switch (also re-exported from provider). */
export function useLanguage(): { locale: Locale; setLocale: (l: Locale) => void } {
  const { locale, setLocale } = useI18n();
  return { locale, setLocale };
}
