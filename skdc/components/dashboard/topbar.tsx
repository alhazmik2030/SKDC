"use client";

import { motion } from "framer-motion";
import { Bell, Search, SunMoon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/dashboard/user-menu";

export function Topbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border/60 bg-background/40 px-6"
    >
      {/* ===== Search (visual right in RTL) ===== */}
      <div className="relative flex flex-1 items-center">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ابحث في كل شيء..."
            className="h-10 rounded-xl border-white/[0.06] bg-white/[0.03] pl-14 pr-10 text-sm placeholder:text-muted-foreground/70 focus-visible:border-violet-400/40 focus-visible:ring-violet-400/20"
          />
          <kbd className="pointer-events-none absolute left-3 top-1/2 hidden -translate-y-1/2 select-none items-center gap-1 rounded-md border border-border bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
            <span className="text-[11px]">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* ===== Right cluster (visual-left in RTL) ===== */}
      <div className="flex items-center gap-2">
        {/* Theme toggle (placeholder) */}
        <button
          type="button"
          aria-label="تبديل المظهر"
          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white/[0.02] text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
        >
          <SunMoon className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <button
          type="button"
          aria-label="الإشعارات"
          className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-white/[0.02] text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-violet-500/40">
            3
          </span>
        </button>

        {/* User menu */}
        <UserMenu />
      </div>
    </motion.header>
  );
}
