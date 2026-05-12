"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  Layers,
  Box,
  FolderKanban,
  PenTool,
  Settings,
  ChevronDown,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";

type NavItem = {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV: NavItem[] = [
  { href: "/dashboard", labelKey: "nav.home", icon: Home },
  { href: "/dashboard/customers", labelKey: "nav.customers", icon: Users },
  { href: "/dashboard/materials", labelKey: "nav.materials", icon: Layers },
  { href: "/dashboard/templates", labelKey: "nav.templates", icon: Box },
  { href: "/dashboard/projects", labelKey: "nav.projects", icon: FolderKanban },
  { href: "/dashboard/designer", labelKey: "nav.designer", icon: PenTool },
  { href: "/dashboard/settings", labelKey: "nav.settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="glass relative flex h-screen shrink-0 flex-col overflow-hidden border-l border-border/60 bg-sidebar/60"
    >
      {/* Subtle aurora glow at the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(167, 139, 250, 0.25) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* ===== Logo block ===== */}
      <div className="relative flex items-center gap-3 px-5 pb-4 pt-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold tracking-wide">
          <div className="relative h-8 w-8 shrink-0">
            <div className="absolute inset-0 rounded-md bg-gradient-to-br from-violet-400 via-fuchsia-400 to-sky-400" />
            <div className="absolute inset-[2px] rounded-[5px] bg-background" />
            <div className="absolute inset-[6px] rounded-sm bg-gradient-to-br from-violet-400 to-sky-400" />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="text-lg font-black"
              >
                SKDC
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* ===== Workspace switcher ===== */}
      <div className="relative px-3 pb-4">
        <button
          type="button"
          className={cn(
            "group flex w-full items-center gap-2 rounded-xl border border-border bg-white/[0.02] px-3 py-2.5 text-right text-sm transition-colors hover:bg-white/[0.04]",
            collapsed && "justify-center px-2",
          )}
        >
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[11px] font-bold text-white shadow-md shadow-violet-500/30">
            و
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-1 items-center justify-between gap-1 overflow-hidden"
              >
                <div className="min-w-0 text-right">
                  <div className="truncate text-xs text-muted-foreground">الورشة</div>
                  <div className="truncate font-medium">ورشة تجريبية</div>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ===== Nav items ===== */}
      <nav className="relative flex-1 overflow-y-auto px-3">
        <ul className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "drop-shadow")} />
                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.15 }}
                        className="whitespace-nowrap"
                      >
                        {t(item.labelKey)}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Active pill ambient glow */}
                  {active && (
                    <motion.span
                      layoutId="nav-active-glow"
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -z-10 rounded-xl"
                      style={{
                        boxShadow:
                          "0 0 0 1px rgba(167,139,250,0.25), 0 18px 40px -16px rgba(192,132,252,0.45)",
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ===== Collapse toggle ===== */}
      <div className="relative border-t border-border/60 p-3">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "توسيع الشريط" : "طي الشريط"}
          className={cn(
            "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? (
            <PanelRightOpen className="h-4 w-4" />
          ) : (
            <PanelRightClose className="h-4 w-4" />
          )}
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap"
              >
                طي الشريط
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
