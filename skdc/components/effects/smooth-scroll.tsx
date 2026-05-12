"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Smooth-scroll provider — Lenis-powered, but **only** on the marketing
 * landing page. Dashboard users scroll through dense data and report
 * the inertial scroll as "thaqeel" (heavy/laggy), so we disable it for
 * any /dashboard or /api route. Lenis itself is dynamically imported so
 * the dashboard bundle never pays the ~25KB cost.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const enabled =
    pathname !== null &&
    !pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/sign-in") &&
    !pathname.startsWith("/sign-up") &&
    !pathname.startsWith("/verify-request") &&
    !pathname.startsWith("/api");

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let rafId = 0;
    let lenisInstance: { raf: (t: number) => void; destroy: () => void } | null = null;

    import("lenis")
      .then(({ default: Lenis }) => {
        if (cancelled) return;
        lenisInstance = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 2,
        });
        const raf = (time: number) => {
          lenisInstance?.raf(time);
          rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);
      })
      .catch(() => {
        // Lenis is non-essential — fall back to native scroll silently.
      });

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      lenisInstance?.destroy();
    };
  }, [enabled]);

  return <>{children}</>;
}
