"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Menu, Search, SunMoon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/dashboard/user-menu";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/components/i18n-provider";
import { useThemeSwitcher } from "@/components/theme-switcher";
import { useMobileNav } from "@/components/dashboard/mobile-nav-provider";
import { cn } from "@/lib/utils";

export function Topbar() {
  const { t, dir } = useI18n();
  const themeSwitcher = useThemeSwitcher();
  const mobileNav = useMobileNav();
  const [searchOpen, setSearchOpen] = React.useState(false);

  const isRtl = dir === "rtl";

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass sticky top-0 z-30 flex h-16 items-center justify-between gap-2 border-b border-border/60 bg-background/40 px-4 sm:gap-4 sm:px-6"
      >
        {/* ===== Left cluster: hamburger (mobile) + search ===== */}
        <div className="relative flex flex-1 items-center gap-2">
          {/* Mobile hamburger — opens the off-canvas sidebar */}
          <button
            type="button"
            onClick={() => mobileNav.open()}
            aria-label={isRtl ? "فتح القائمة" : "Open menu"}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-white/[0.02] text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Desktop search — visible from md up */}
          <div className="relative hidden w-full max-w-sm md:block">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("topbar.search")}
              className="h-10 rounded-xl border-white/[0.06] bg-white/[0.03] pl-14 pr-10 text-sm placeholder:text-muted-foreground/70 focus-visible:border-violet-400/40 focus-visible:ring-violet-400/20"
            />
            <kbd className="pointer-events-none absolute left-3 top-1/2 hidden -translate-y-1/2 select-none items-center gap-1 rounded-md border border-border bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          </div>

          {/* Mobile search icon — opens the modal sheet */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={t("topbar.search")}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-white/[0.02] text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground md:hidden"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>

        {/* ===== Right cluster (visual-left in RTL) ===== */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language switcher — full flags + dot on sm+, single dropdown flag on xs */}
          <LanguageSwitcher variant="compact" className="hidden sm:inline-flex" />
          <LanguageSwitcher variant="dropdown" className="sm:hidden" />

          {/* Theme toggle */}
          <button
            type="button"
            aria-label={t("userMenu.theme")}
            onClick={() => themeSwitcher.open()}
            className="grid h-11 w-11 place-items-center rounded-full border border-border bg-white/[0.02] text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground sm:h-9 sm:w-9"
          >
            <SunMoon className="h-4 w-4" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative grid h-11 w-11 place-items-center rounded-full border border-border bg-white/[0.02] text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground sm:h-9 sm:w-9"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-violet-500/40">
              3
            </span>
          </button>

          {/* User menu — UserMenu hides its label text under md internally. */}
          <UserMenu />
        </div>
      </motion.header>

      <AnimatePresence>
        {searchOpen && (
          <MobileSearchSheet
            placeholder={t("topbar.search")}
            onClose={() => setSearchOpen(false)}
            isRtl={isRtl}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================
// Mobile search sheet — full-width modal triggered from topbar icon
// ============================================================
function MobileSearchSheet({
  placeholder,
  onClose,
  isRtl,
}: {
  placeholder: string;
  onClose: () => void;
  isRtl: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll while open.
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={placeholder}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-20 backdrop-blur-md md:hidden"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="glass relative w-full max-w-lg overflow-hidden rounded-2xl border border-border/60 bg-card/95 p-3"
      >
        <div className="relative flex items-center gap-2">
          <Search
            className={cn(
              "pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
              isRtl ? "right-3" : "left-3",
            )}
          />
          <Input
            ref={inputRef}
            placeholder={placeholder}
            className={cn(
              "h-12 flex-1 rounded-xl border-white/[0.06] bg-white/[0.03] text-sm placeholder:text-muted-foreground/70",
              isRtl ? "pl-12 pr-10" : "pl-10 pr-12",
            )}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={isRtl ? "إغلاق" : "Close"}
            className={cn(
              "absolute top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
              isRtl ? "left-2" : "right-2",
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
