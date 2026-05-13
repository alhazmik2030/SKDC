"use client";

import * as React from "react";

/**
 * MobileNavProvider — tiny imperative context for the off-canvas
 * mobile sidebar. Mirrors the API shape of ThemeSwitcherProvider.
 *
 * Usage:
 *   const { open, close, toggle, isOpen } = useMobileNav();
 */

type Ctx = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const MobileNavContext = React.createContext<Ctx | null>(null);

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const ctx = React.useMemo<Ctx>(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((v) => !v),
    }),
    [isOpen],
  );

  // Lock body scroll while the panel is open; clean up on close/unmount.
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  return <MobileNavContext.Provider value={ctx}>{children}</MobileNavContext.Provider>;
}

export function useMobileNav() {
  const ctx = React.useContext(MobileNavContext);
  if (!ctx) throw new Error("useMobileNav must be used inside <MobileNavProvider>");
  return ctx;
}
