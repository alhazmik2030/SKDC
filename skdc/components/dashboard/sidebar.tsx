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
  Ship,
  Building2,
  ClipboardList,
  ChevronDown,
  PanelRightClose,
  PanelRightOpen,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";
import { useMobileNav } from "@/components/dashboard/mobile-nav-provider";

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
  { href: "/dashboard/factories", labelKey: "nav.factories", icon: Building2 },
  { href: "/dashboard/factory-orders", labelKey: "nav.factoryOrders", icon: ClipboardList },
  { href: "/dashboard/shipments", labelKey: "nav.shipments", icon: Ship },
  { href: "/dashboard/studio", labelKey: "nav.studio", icon: PenTool },
  { href: "/dashboard/settings", labelKey: "nav.settings", icon: Settings },
];

type NavLinkProps = {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  label: string;
};

// Why: the parent DesktopSidebar re-renders whenever the theme / locale
// context changes; making the link a memoized pure leaf means only links
// whose `active`/`label` actually changed re-render. ~7 nav items × frequent
// theme toggles adds up.
const NavLink = React.memo(function NavLink({ item, active, collapsed, label }: NavLinkProps) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        style={
          active
            ? {
                background:
                  "linear-gradient(135deg, var(--theme-stop-1,#a78bfa) 0%, var(--theme-stop-2,#f0abfc) 100%)",
                boxShadow:
                  "0 10px 25px -10px var(--theme-halo, rgba(167,139,250,0.5))",
              }
            : undefined
        }
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
          active
            ? "text-white"
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
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Active pill ambient glow — driven by active theme */}
        {active && (
          <motion.span
            layoutId="nav-active-glow"
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 rounded-xl"
            style={{
              boxShadow:
                "0 0 0 1px var(--theme-stop-1, rgba(167,139,250,0.25)), 0 18px 40px -16px var(--theme-halo, rgba(192,132,252,0.45))",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </Link>
    </li>
  );
});

export function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}

// ============================================================
// Desktop — collapsible vertical aside (md+)
// ============================================================
function DesktopSidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="glass relative hidden h-screen shrink-0 flex-col overflow-hidden border-l border-border/60 bg-sidebar/60 md:flex"
    >
      {/* Subtle aurora glow at the top — driven by the active theme. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, var(--theme-halo, rgba(167,139,250,0.25)) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* ===== Logo block ===== */}
      <div className="relative flex items-center gap-3 px-5 pb-4 pt-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold tracking-wide">
          <LogoMark />
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
          <div
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-bold text-white shadow-md"
            style={{
              background:
                "linear-gradient(135deg, var(--theme-stop-1,#a78bfa) 0%, var(--theme-stop-2,#f0abfc) 100%)",
              boxShadow:
                "0 4px 12px -2px var(--theme-halo, rgba(167,139,250,0.4))",
            }}
          >
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
            return (
              <NavLink
                key={item.href}
                item={item}
                active={!!active}
                collapsed={collapsed}
                label={t(item.labelKey)}
              />
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

// ============================================================
// Mobile — off-canvas slide-in panel (< md)
// ============================================================
function MobileSidebar() {
  const pathname = usePathname();
  const { t, dir } = useI18n();
  const { isOpen, close } = useMobileNav();

  // Slide direction: in RTL the sidebar lives on the right → slide from right.
  // In LTR it should mirror to the left.
  const isRtl = dir === "rtl";
  const offscreenX = isRtl ? "100%" : "-100%";
  const panelSide = isRtl ? "right-0" : "left-0";
  const borderSide = isRtl ? "border-l" : "border-r";

  // Close on Escape while open.
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  // Auto-close when the route changes.
  React.useEffect(() => {
    if (isOpen) close();
    // We intentionally watch pathname only — `close` is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mobile-nav-root"
          className="fixed inset-0 z-40 md:hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label={isRtl ? "إغلاق القائمة" : "Close menu"}
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={isRtl ? "قائمة التنقل" : "Navigation menu"}
            initial={{ x: offscreenX }}
            animate={{ x: 0 }}
            exit={{ x: offscreenX }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "glass absolute top-0 flex h-full w-[80vw] min-w-[280px] max-w-[320px] flex-col overflow-hidden bg-sidebar/95 backdrop-blur-xl",
              panelSide,
              borderSide,
              "border-border/60",
            )}
            style={{
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            {/* Aurora */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-50"
              style={{
                background:
                  "radial-gradient(circle, var(--theme-halo, rgba(167,139,250,0.25)) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />

            {/* Header row: logo + close */}
            <div className="relative flex items-center justify-between px-5 pb-4 pt-6">
              <Link
                href="/dashboard"
                onClick={close}
                className="flex items-center gap-2.5 font-bold tracking-wide"
              >
                <LogoMark />
                <span className="text-lg font-black">SKDC</span>
              </Link>
              <button
                type="button"
                onClick={close}
                aria-label={isRtl ? "إغلاق القائمة" : "Close menu"}
                className="grid h-11 w-11 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Workspace pill */}
            <div className="relative px-3 pb-4">
              <div className="flex w-full items-center gap-2 rounded-xl border border-border bg-white/[0.02] px-3 py-2.5 text-right text-sm">
                <div
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-bold text-white shadow-md"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--theme-stop-1,#a78bfa) 0%, var(--theme-stop-2,#f0abfc) 100%)",
                    boxShadow:
                      "0 4px 12px -2px var(--theme-halo, rgba(167,139,250,0.4))",
                  }}
                >
                  و
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <div className="truncate text-xs text-muted-foreground">الورشة</div>
                  <div className="truncate font-medium">ورشة تجريبية</div>
                </div>
              </div>
            </div>

            {/* Nav items */}
            <nav className="relative flex-1 overflow-y-auto px-3 pb-4">
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
                        onClick={close}
                        style={
                          active
                            ? {
                                background:
                                  "linear-gradient(135deg, var(--theme-stop-1,#a78bfa) 0%, var(--theme-stop-2,#f0abfc) 100%)",
                                boxShadow:
                                  "0 10px 25px -10px var(--theme-halo, rgba(167,139,250,0.5))",
                              }
                            : undefined
                        }
                        className={cn(
                          "relative flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                          active
                            ? "text-white"
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                        )}
                      >
                        <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "drop-shadow")} />
                        <span className="whitespace-nowrap">{t(item.labelKey)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// Shared logo mark
// ============================================================
function LogoMark() {
  return (
    <div className="relative h-8 w-8 shrink-0">
      <div
        className="absolute inset-0 rounded-md"
        style={{
          background:
            "linear-gradient(135deg, var(--theme-stop-1,#a78bfa) 0%, var(--theme-stop-2,#f0abfc) 50%, var(--theme-stop-3,#38bdf8) 100%)",
        }}
      />
      <div className="absolute inset-[2px] rounded-[5px] bg-background" />
      <div
        className="absolute inset-[6px] rounded-sm"
        style={{
          background:
            "linear-gradient(135deg, var(--theme-stop-1,#a78bfa) 0%, var(--theme-stop-3,#38bdf8) 100%)",
        }}
      />
    </div>
  );
}
